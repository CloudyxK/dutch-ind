import { NextRequest, NextResponse } from "next/server";

// Strip HTML tags and script injections from a string
export function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")          // strip HTML tags
    .replace(/javascript:/gi, "")     // strip JS protocol
    .replace(/on\w+\s*=/gi, "")       // strip event handlers
    .trim();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email);
}

// Validate that request body isn't too large (default 100 KB)
export async function parseJsonSafe(
  req: NextRequest,
  maxBytes = 100_000
): Promise<{ ok: true; data: any } | { ok: false; response: NextResponse }> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request terlalu besar" }, { status: 413 }),
    };
  }

  try {
    const text = await req.text();
    if (text.length > maxBytes) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Request terlalu besar" }, { status: 413 }),
      };
    }
    const data = JSON.parse(text);
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Format request tidak valid" }, { status: 400 }),
    };
  }
}

// Verify request comes from the same origin (CSRF protection for API routes)
export function verifySameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true; // server-to-server calls allowed
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

// Build a rate-limit exceeded response
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
