import {
  MENTOR_SYSTEM_PROMPT,
  MENTOR_PERSONAS,
  getMockMentorReply,
} from "@/lib/mentor-prompt";
import {
  ANTHROPIC_MODEL,
  createAnthropic,
  resolveAnthropicKey,
} from "@/lib/anthropic";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 목업(데모) 응답을 자연스럽게 스트리밍합니다.
function streamMock(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < text.length; i += 24) {
        controller.enqueue(encoder.encode(text.slice(i, i + 24)));
        await sleep(20);
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

export async function POST(req: Request) {
  let body: { messages?: ChatMessage[]; personaId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const messages = (body.messages ?? []).filter(
    (m): m is ChatMessage =>
      (m?.role === "user" || m?.role === "assistant") &&
      typeof m?.content === "string" &&
      m.content.trim().length > 0,
  );

  if (messages.length === 0) {
    return Response.json({ error: "메시지가 비어 있습니다." }, { status: 400 });
  }

  // 남용·과도한 비용을 막기 위한 입력 한도(인증 없는 공개 엔드포인트).
  if (messages.length > 50) {
    return Response.json(
      { error: "대화가 너무 깁니다. 새 대화를 시작해 주세요." },
      { status: 400 },
    );
  }
  if (messages.some((m) => m.content.length > 8000)) {
    return Response.json(
      { error: "메시지가 너무 깁니다. 조금 줄여서 보내 주세요." },
      { status: 400 },
    );
  }

  const personaId = body.personaId ?? "default";
  const apiKey = resolveAnthropicKey(req);

  // 키가 없으면 목업(데모) 응답으로 동작
  if (!apiKey) {
    return streamMock(getMockMentorReply(personaId));
  }

  // 실제 호출 경로 — 업체 키/비용 보호용 레이트리밋
  const rl = rateLimit(clientKey(req, "mentor"), 30, 60_000);
  if (!rl.ok) {
    return Response.json(
      { error: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 30) } },
    );
  }

  const persona = MENTOR_PERSONAS.find((p) => p.id === personaId);
  const system = persona?.prompt
    ? `${MENTOR_SYSTEM_PROMPT}\n\n## 이번 대화의 멘토\n${persona.prompt}`
    : MENTOR_SYSTEM_PROMPT;

  const client = createAnthropic(apiKey);
  const encoder = new TextEncoder();

  // 스트리밍으로 응답을 전달해 긴 응답에서도 타임아웃 없이 동작하게 합니다.
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: ANTHROPIC_MODEL,
          max_tokens: 2048,
          system: [
            { type: "text", text: system, cache_control: { type: "ephemeral" } },
          ],
          thinking: { type: "adaptive" },
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        claudeStream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        const final = await claudeStream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              "\n\n(이 주제는 제가 함께 다루기 어려운 부분이에요. 믿을 수 있는 어른이나 목회자 선생님과 꼭 나눠 보세요.)",
            ),
          );
        }
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        controller.enqueue(
          encoder.encode(`\n\n[오류] 멘토 응답 중 문제가 발생했어요: ${message}`),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
