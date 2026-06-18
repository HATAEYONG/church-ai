// AI 제공자 레이어 (서버 전용)
//
// Anthropic(Claude)·OpenAI(GPT)를 통합 인터페이스로 다루고, 요청의 검색순서
// (x-ai-order)와 키 보유 여부로 사용할 제공자를 선택합니다.
// 키 해석 우선순위: 요청 헤더(BYO) → 환경변수.

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type ProviderId = "anthropic" | "openai";
export const PROVIDER_IDS: ProviderId[] = ["anthropic", "openai"];
export const DEFAULT_ORDER: ProviderId[] = ["anthropic", "openai"];

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function parseOrder(raw: string | null): ProviderId[] {
  const order: ProviderId[] = [];
  const seen = new Set<ProviderId>();
  for (const part of (raw ?? "").split(",")) {
    const id = part.trim();
    if ((PROVIDER_IDS as string[]).includes(id) && !seen.has(id as ProviderId)) {
      seen.add(id as ProviderId);
      order.push(id as ProviderId);
    }
  }
  // 누락된 제공자는 기본 순서로 뒤에 보강
  for (const id of DEFAULT_ORDER) if (!seen.has(id)) order.push(id);
  return order;
}

export interface ResolvedProvider {
  id: ProviderId;
  apiKey: string;
}

// 검색순서대로 '키가 설정된 첫 제공자'를 선택. 없으면 null(→ 목업).
export function resolveProvider(req: Request): ResolvedProvider | null {
  const order = parseOrder(req.headers.get("x-ai-order"));
  const keys: Record<ProviderId, string> = {
    anthropic:
      req.headers.get("x-anthropic-key")?.trim() ||
      process.env.ANTHROPIC_API_KEY ||
      "",
    openai:
      req.headers.get("x-openai-key")?.trim() || process.env.OPENAI_API_KEY || "",
  };
  for (const id of order) {
    if (keys[id]) return { id, apiKey: keys[id] };
  }
  return null;
}

export interface StreamChatOptions {
  provider: ProviderId;
  apiKey: string;
  system: string;
  messages: ChatTurn[];
  maxTokens: number;
  onText: (delta: string) => void;
}

// 제공자 공통 스트리밍. 텍스트 델타를 onText로 흘리고, 안전거부 여부를 반환.
export async function streamChat(
  opts: StreamChatOptions,
): Promise<{ refused: boolean }> {
  return opts.provider === "openai"
    ? streamOpenAI(opts)
    : streamAnthropic(opts);
}

async function streamAnthropic({
  apiKey,
  system,
  messages,
  maxTokens,
  onText,
}: StreamChatOptions) {
  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    thinking: { type: "adaptive" },
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  stream.on("text", (delta) => onText(delta));
  const final = await stream.finalMessage();
  return { refused: final.stop_reason === "refusal" };
}

async function streamOpenAI({
  apiKey,
  system,
  messages,
  maxTokens,
  onText,
}: StreamChatOptions) {
  const client = new OpenAI({ apiKey });
  const stream = await client.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });
  let refused = false;
  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    if (choice?.delta?.content) onText(choice.delta.content);
    if (choice?.finish_reason === "content_filter") refused = true;
  }
  return { refused };
}
