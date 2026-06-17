import Anthropic from "@anthropic-ai/sdk";
import { MENTOR_SYSTEM_PROMPT, MENTOR_PERSONAS } from "@/lib/mentor-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "AI 멘토를 사용하려면 ANTHROPIC_API_KEY 환경 변수가 필요합니다. .env.local 을 설정해 주세요.",
      },
      { status: 503 },
    );
  }

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

  const persona = MENTOR_PERSONAS.find((p) => p.id === body.personaId);
  const system = persona?.prompt
    ? `${MENTOR_SYSTEM_PROMPT}\n\n## 이번 대화의 멘토\n${persona.prompt}`
    : MENTOR_SYSTEM_PROMPT;

  const client = new Anthropic({ apiKey });

  // 스트리밍으로 응답을 전달해 긴 응답에서도 타임아웃 없이 동작하게 합니다.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: system,
              cache_control: { type: "ephemeral" },
            },
          ],
          thinking: { type: "adaptive" },
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
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
