// AI 연동 설정 — API 키 저장소 (클라이언트/서버 공용, 키 본문 미포함)
//
// 화이트라벨 공급을 전제로, 각 업체(배포/브라우저)가 자기 키를 설정 화면에서
// 입력해 보관합니다. 키가 없으면 각 기능은 목업(데모) 모드로 동작합니다.

export const ANTHROPIC_KEY_STORAGE = "ANTHROPIC_API_KEY";

// 브라우저 BYO 키를 서버 라우트로 전달할 때 쓰는 헤더 이름
export const AI_KEY_HEADER = "x-ai-key";

export function getStoredAnthropicKey(): string {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(ANTHROPIC_KEY_STORAGE) || "";
  }
  return "";
}

export function setStoredAnthropicKey(key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) {
    window.localStorage.setItem(ANTHROPIC_KEY_STORAGE, trimmed);
  } else {
    window.localStorage.removeItem(ANTHROPIC_KEY_STORAGE);
  }
}

export function clearStoredAnthropicKey(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ANTHROPIC_KEY_STORAGE);
}

// fetch 요청에 붙일 헤더 — 저장된 키가 있을 때만 포함
export function aiKeyHeaders(): Record<string, string> {
  const key = getStoredAnthropicKey();
  return key ? { [AI_KEY_HEADER]: key } : {};
}
