import {
  SERMON_STAGES,
  getMockSermonStage,
  type SermonContext,
} from "@/lib/sermon-pipeline";
import { sermonStageMarker } from "@/lib/sermon-stages";
import { resolveProvider, streamChat } from "@/lib/ai-providers";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  let body: { passage?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const passage = (body.passage ?? "").trim();
  if (!passage) {
    return Response.json(
      { error: "본문(성경 구절 또는 본문 내용)을 입력해 주세요." },
      { status: 400 },
    );
  }
  if (passage.length > 6000) {
    return Response.json(
      { error: "본문이 너무 깁니다. 6000자 이내로 입력해 주세요." },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const provider = resolveProvider(req);

  // 검색순서상 키가 있는 제공자가 없으면 목업(데모) 파이프라인
  if (!provider) {
    const stream = new ReadableStream({
      async start(controller) {
        for (const stage of SERMON_STAGES) {
          controller.enqueue(encoder.encode(`\n${sermonStageMarker(stage.id)}\n`));
          const text = getMockSermonStage(stage.id, passage);
          for (let i = 0; i < text.length; i += 24) {
            controller.enqueue(encoder.encode(text.slice(i, i + 24)));
            await sleep(15);
          }
        }
        controller.enqueue(encoder.encode(`\n${sermonStageMarker("done")}\n`));
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

  // 실제 호출 경로 — 5단계 호출이라 더 빡빡하게 제한
  const rl = rateLimit(clientKey(req, "sermon"), 6, 60_000);
  if (!rl.ok) {
    return Response.json(
      { error: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const ctx: SermonContext = {
        passage,
        theme: "",
        structure: "",
        draft: "",
        critique: "",
      };

      try {
        for (const stage of SERMON_STAGES) {
          controller.enqueue(encoder.encode(`\n${sermonStageMarker(stage.id)}\n`));

          let acc = "";
          const { refused } = await streamChat({
            provider: provider.id,
            apiKey: provider.apiKey,
            system: stage.system,
            messages: [{ role: "user", content: stage.buildUser(ctx) }],
            maxTokens: stage.maxTokens,
            onText: (delta) => {
              acc += delta;
              controller.enqueue(encoder.encode(delta));
            },
          });

          if (refused) {
            const note =
              "\n\n(이 단계에서 함께 다루기 어려운 내용이 감지되었습니다. 목회자님과 직접 상의해 주세요.)";
            acc += note;
            controller.enqueue(encoder.encode(note));
          }

          if (stage.id !== "revision") {
            ctx[stage.id] = acc;
          }
        }

        controller.enqueue(encoder.encode(`\n${sermonStageMarker("done")}\n`));
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        controller.enqueue(
          encoder.encode(
            `\n${sermonStageMarker("error")}\n[오류] 설교 생성 중 문제가 발생했어요: ${message}`,
          ),
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
