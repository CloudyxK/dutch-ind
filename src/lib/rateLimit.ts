type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Cleanup old entries every 10 minutes to prevent memory growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((v, k) => { if (v.resetAt < now) store.delete(k); });
  }, 10 * 60 * 1000);
}

export function createRateLimiter(limit: number, windowMs: number) {
  return function check(key: string): { success: boolean; retryAfter: number } {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, retryAfter: 0 };
    }

    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return { success: false, retryAfter };
    }

    entry.count++;
    return { success: true, retryAfter: 0 };
  };
}

// Pre-built limiters
export const authLimiter = createRateLimiter(5, 15 * 60 * 1000);    // 5 per 15 min
export const registerLimiter = createRateLimiter(3, 60 * 60 * 1000); // 3 per hour
export const orderLimiter = createRateLimiter(10, 60 * 1000);        // 10 per min
export const reviewLimiter = createRateLimiter(5, 60 * 1000);        // 5 per min
export const couponLimiter = createRateLimiter(20, 60 * 1000);       // 20 per min
export const apiLimiter = createRateLimiter(100, 60 * 1000);         // 100 per min

export function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
