type Bucket = { tokens: number; last: number };

const buckets = new Map<string, Bucket>();

/** Simple in-memory rate limiter for API routes / outbound calls (single instance). */
export function takeToken(key: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: maxPerMinute, last: now };
  const elapsed = now - b.last;
  const refill = (elapsed / 60000) * maxPerMinute;
  b.tokens = Math.min(maxPerMinute, b.tokens + refill);
  b.last = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return true;
}
