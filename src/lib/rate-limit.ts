// 간단한 인메모리 레이트리밋 (슬라이딩 윈도)
//
// 데모/단일 인스턴스용 베이스라인입니다. 운영에서 다중 인스턴스(서버리스)로
// 확장할 때는 Upstash Redis / Vercel KV 등 공유 저장소로 교체하세요.

type Timestamps = number[];
const buckets = new Map<string, Timestamps>();

export interface RateLimitResult {
  ok: boolean;
  retryAfter?: number; // 초
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
    return { ok: false, retryAfter: Math.max(1, retryAfter) };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { ok: true };
}

// 클라이언트 식별자(프록시 헤더 우선). 없으면 단일 키로 합쳐 보수적으로 제한.
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip =
    (fwd ? fwd.split(",")[0].trim() : "") ||
    req.headers.get("x-real-ip") ||
    "local";
  return `${scope}:${ip}`;
}
