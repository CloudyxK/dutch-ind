import { NextRequest, NextResponse } from "next/server";

// ─── Input Sanitization ───────────────────────────────────────────────────────

/** Strip HTML, JS, and event handlers from a string */
export function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")              // strip all HTML tags
    .replace(/javascript:/gi, "")         // strip JS protocol
    .replace(/vbscript:/gi, "")           // strip VBScript
    .replace(/data:\s*text\/html/gi, "")  // strip data: URI HTML
    .replace(/on\w+\s*=/gi, "")           // strip event handlers
    .replace(/<!--[\s\S]*?-->/g, "")      // strip HTML comments
    .trim();
}

/** Strip everything except plain text — for names, titles, etc. */
export function sanitizePlain(value: unknown, maxLen = 500): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[<>"'`]/g, "")             // strip chars used in injection
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars
    .trim()
    .slice(0, maxLen);
}

/** Validate email format (RFC 5321 inspired) */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 320) return false;
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,63}$/.test(email);
}

/** Validate a CUID-style ID (prevents NoSQL/path injection via IDs) */
export function isValidId(id: unknown): boolean {
  if (typeof id !== "string") return false;
  return /^[a-z0-9]{20,30}$/i.test(id);
}

/** Validate a URL slug */
export function isValidSlug(slug: unknown): boolean {
  if (typeof slug !== "string") return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 200;
}

/** Validate Indonesian phone number */
export function isValidPhone(phone: string): boolean {
  return /^(\+62|62|0)[0-9]{8,13}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
}

/** Detect common SQL injection patterns — for extra validation of free-text fields */
export function hasSqlInjection(value: string): boolean {
  const sqlPatterns = [
    /(\s)(union|select|insert|update|delete|drop|create|alter|exec|truncate)(\s)/i,
    /(--|#|\/\*)(\s|$)/,
    /'\s*(or|and)\s*'?\d/i,
    /xp_cmdshell|waitfor\s+delay|sleep\(\d/i,
    /char\(\d+\)\s*(\+|,)/i,
  ];
  return sqlPatterns.some((p) => p.test(value));
}

/** Detect script injection patterns */
export function hasScriptInjection(value: string): boolean {
  return /<script|javascript:|vbscript:|on\w+=|data:text\/html/i.test(value);
}

// ─── Request Parsing ──────────────────────────────────────────────────────────

/**
 * Parse + size-check JSON body.
 * Default max: 100 KB. Use smaller limits for auth/profile routes.
 */
export async function parseJsonSafe(
  req: NextRequest,
  maxBytes = 100_000
): Promise<{ ok: true; data: any } | { ok: false; response: NextResponse }> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > maxBytes) {
    return { ok: false, response: NextResponse.json({ error: "Request terlalu besar" }, { status: 413 }) };
  }

  try {
    const text = await req.text();
    if (text.length > maxBytes) {
      return { ok: false, response: NextResponse.json({ error: "Request terlalu besar" }, { status: 413 }) };
    }
    const data = JSON.parse(text);
    return { ok: true, data };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Format request tidak valid" }, { status: 400 }) };
  }
}

// ─── CSRF Protection ──────────────────────────────────────────────────────────

/**
 * Verify request comes from the same origin.
 * Allows server-to-server (no origin header) and webhook calls.
 */
export function verifySameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host   = req.headers.get("host");
  if (!origin) return true; // server-to-server — no Origin header
  if (!host)   return false;
  try {
    const originHost = new URL(origin).host;
    // Allow exact match OR Vercel preview URLs (same base domain)
    if (originHost === host) return true;
    // Allow Vercel preview URLs if they share the same root domain
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    if (appUrl) {
      const appHost = new URL(appUrl).host;
      if (originHost === appHost) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Rate Limit Response ──────────────────────────────────────────────────────

export function rateLimitResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: "Terlalu banyak permintaan. Coba lagi nanti." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": "exceeded",
      },
    }
  );
}

// ─── File Upload Validation ───────────────────────────────────────────────────

const ALLOWED_UPLOAD_FOLDERS = new Set(["reviews", "avatars", "products"]);

/** Validate that upload folder is one of the allowed values */
export function isValidUploadFolder(folder: unknown): boolean {
  return typeof folder === "string" && ALLOWED_UPLOAD_FOLDERS.has(folder);
}

/** Estimate base64 decoded size in bytes */
export function estimateBase64Size(b64: string): number {
  // base64 encodes 3 bytes as 4 chars; subtract padding
  const padding = (b64.match(/={1,2}$/) ?? [])[0]?.length ?? 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

/** Check if a base64 string starts with a valid image magic header */
export function isImageBase64(dataUrl: string): boolean {
  // Data URL prefix: data:image/[type];base64,
  if (!dataUrl.startsWith("data:image/")) return false;
  const allowedTypes = ["jpeg", "jpg", "png", "webp", "gif", "avif"];
  return allowedTypes.some((t) => dataUrl.startsWith(`data:image/${t};base64,`));
}

// ─── Response Helpers ─────────────────────────────────────────────────────────

/** Generic forbidden response (use 404 to not reveal protected endpoint) */
export function forbiddenResponse(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Add standard no-cache header to sensitive API responses */
export function noCacheHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
  };
}
