// Anthropic 서버 헬퍼 — API 라우트 공용
//
// 키 해석 우선순위: 요청 헤더(x-ai-key, 업체 BYO) → 환경변수 → 없음(목업).

import Anthropic from "@anthropic-ai/sdk";
import { AI_KEY_HEADER } from "@/lib/ai-config";

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

// 요청에서 사용할 API 키를 해석합니다. 없으면 빈 문자열(=목업 모드).
export function resolveAnthropicKey(req: Request): string {
  const headerKey = req.headers.get(AI_KEY_HEADER)?.trim();
  return headerKey || process.env.ANTHROPIC_API_KEY || "";
}

export function createAnthropic(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}
