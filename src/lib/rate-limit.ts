/**
 * Simple per-IP sliding window rate limit (best-effort on serverless).
 * Prefer Upstash/Redis later for multi-instance accuracy.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimitOk(req: Request): {
  ok: boolean;
  remaining: number;
  resetAt: number;
} {
  const key = clientIp(req);
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: MAX_REQUESTS - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Periodic cleanup to avoid unbounded Map growth in long-lived processes. */
export function pruneRateLimitBuckets() {
  const now = Date.now();
  Array.from(buckets.entries()).forEach(([key, bucket]) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}
