// AI 연동 설정 — API 키 + 제공자 검색순서 저장소 (클라이언트, 키 본문 미포함)
//
// 화이트라벨 공급 전제: 각 업체가 자기 키를 설정 화면에서 입력해 보관.
// 키가 하나도 없으면 각 기능은 목업(데모)으로 동작.

export const ANTHROPIC_KEY_STORAGE = "ANTHROPIC_API_KEY";
export const OPENAI_KEY_STORAGE = "OPENAI_API_KEY";
export const GEMINI_KEY_STORAGE = "GEMINI_API_KEY";
export const PROVIDER_ORDER_STORAGE = "AI_PROVIDER_ORDER";

export type ProviderId = "anthropic" | "openai" | "gemini";

export interface ProviderMeta {
  id: ProviderId;
  label: string;
  emoji: string;
  usedFor: string;
  signup: string;
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    emoji: "🕊️",
    usedFor: "AI 신앙 멘토 · 설교 준비 자동화",
    signup: "console.anthropic.com",
  },
  {
    id: "openai",
    label: "OpenAI (GPT)",
    emoji: "🤖",
    usedFor: "AI 신앙 멘토 · 설교 준비 자동화",
    signup: "platform.openai.com",
  },
  {
    id: "gemini",
    label: "Google (Gemini)",
    emoji: "🔷",
    usedFor: "AI 신앙 멘토 · 설교 준비 자동화",
    signup: "aistudio.google.com",
  },
];

export const DEFAULT_ORDER: ProviderId[] = ["anthropic", "openai", "gemini"];

// ── 키 저장소 ────────────────────────────────────────────────
function readKey(storage: string): string {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(storage) || "";
  }
  return "";
}

function writeKey(storage: string, key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) window.localStorage.setItem(storage, trimmed);
  else window.localStorage.removeItem(storage);
}

export const getStoredAnthropicKey = () => readKey(ANTHROPIC_KEY_STORAGE);
export const setStoredAnthropicKey = (k: string) =>
  writeKey(ANTHROPIC_KEY_STORAGE, k);
export const clearStoredAnthropicKey = () =>
  writeKey(ANTHROPIC_KEY_STORAGE, "");

export const getStoredOpenAIKey = () => readKey(OPENAI_KEY_STORAGE);
export const setStoredOpenAIKey = (k: string) => writeKey(OPENAI_KEY_STORAGE, k);
export const clearStoredOpenAIKey = () => writeKey(OPENAI_KEY_STORAGE, "");

export const getStoredGeminiKey = () => readKey(GEMINI_KEY_STORAGE);
export const setStoredGeminiKey = (k: string) => writeKey(GEMINI_KEY_STORAGE, k);
export const clearStoredGeminiKey = () => writeKey(GEMINI_KEY_STORAGE, "");

const KEY_STORAGE: Record<ProviderId, string> = {
  anthropic: ANTHROPIC_KEY_STORAGE,
  openai: OPENAI_KEY_STORAGE,
  gemini: GEMINI_KEY_STORAGE,
};

export function getStoredKey(id: ProviderId): string {
  return readKey(KEY_STORAGE[id]);
}

export function setStoredKey(id: ProviderId, key: string): void {
  writeKey(KEY_STORAGE[id], key);
}

export function clearStoredKey(id: ProviderId): void {
  writeKey(KEY_STORAGE[id], "");
}

// ── 제공자 검색순서 ──────────────────────────────────────────
export function getProviderOrder(): ProviderId[] {
  let stored: unknown = null;
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(PROVIDER_ORDER_STORAGE);
    if (raw) {
      try {
        stored = JSON.parse(raw);
      } catch {
        stored = null;
      }
    }
  }
  const order: ProviderId[] = [];
  const seen = new Set<ProviderId>();
  const valid = PROVIDERS.map((p) => p.id) as string[];
  if (Array.isArray(stored)) {
    for (const id of stored) {
      if (valid.includes(id) && !seen.has(id)) {
        seen.add(id);
        order.push(id);
      }
    }
  }
  for (const id of DEFAULT_ORDER) if (!seen.has(id)) order.push(id);
  return order;
}

export function setProviderOrder(order: ProviderId[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROVIDER_ORDER_STORAGE, JSON.stringify(order));
}

// ── 요청 헤더 ────────────────────────────────────────────────
// 저장된 키를 서버 라우트로 전달(BYO) + 검색순서 동봉.
export function aiKeyHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "x-ai-order": getProviderOrder().join(","),
  };
  const a = getStoredAnthropicKey();
  if (a) headers["x-anthropic-key"] = a;
  const o = getStoredOpenAIKey();
  if (o) headers["x-openai-key"] = o;
  const g = getStoredGeminiKey();
  if (g) headers["x-gemini-key"] = g;
  return headers;
}
