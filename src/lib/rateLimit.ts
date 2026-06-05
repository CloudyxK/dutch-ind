type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((v, k) => { if (v.resetAt < now) store.delete(k); });
  }, 5 * 60 * 1000);
}

export function createRateLimiter(limit: number, windowMs: number) {
  return function check(key: string): { success: boolean; retryAfter: number } {
    const now   = Date.now();
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

// ─── Pre-built limiters ───────────────────────────────────────────────────────

/** Auth login: 5 attempts / 15 min / IP */
export const authLimiter          = createRateLimiter(5,  15 * 60 * 1000);
/** Registration: 3 / hour / IP */
export const registerLimiter      = createRateLimiter(3,  60 * 60 * 1000);
/** Order creation: 10 / min / user */
export const orderLimiter         = createRateLimiter(10, 60 * 1000);
/** Review submit: 5 / min / user */
export const reviewLimiter        = createRateLimiter(5,  60 * 1000);
/** Coupon validation: 20 / min / IP */
export const couponLimiter        = createRateLimiter(20, 60 * 1000);
/** Generic API: 100 / min / IP */
export const apiLimiter           = createRateLimiter(100, 60 * 1000);
/** File upload: 10 / min / user — prevents Cloudinary abuse */
export const uploadLimiter        = createRateLimiter(10, 60 * 1000);
/** Newsletter signup: 3 / hour / IP */
export const newsletterLimiter    = createRateLimiter(3,  60 * 60 * 1000);
/** Password reset: 3 / hour / IP */
export const passwordResetLimiter = createRateLimiter(3,  60 * 60 * 1000);
/** Search suggest: 60 / min / IP */
export const searchLimiter        = createRateLimiter(60, 60 * 1000);
/** Admin email blast: 5 / hour */
export const emailBlastLimiter    = createRateLimiter(5,  60 * 60 * 1000);
/** Contact form: 5 / hour / IP */
export const contactLimiter       = createRateLimiter(5,  60 * 60 * 1000);

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getIp(req: { headers: { get(k: string): string | null } }): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
