const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

const requestLog = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(ip: string | null | undefined) {
  if (!ip) {
    return { allowed: true };
  }

  const now = Date.now();
  const bucket = requestLog.get(ip);

  if (!bucket || bucket.expiresAt < now) {
    requestLog.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucket.expiresAt - now) / 1000),
    };
  }

  return { allowed: true, remaining: MAX_REQUESTS - bucket.count };
}
