import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ─── Attack pattern blocklists ────────────────────────────────────────────────

const BLOCKED_PATH_PATTERNS = [
  /\.\.(\/|\\|%2f|%5c)/i,
  /\.(env|git|htaccess|htpasswd|ssh|bash_history|zshrc|npmrc|yarnrc)$/i,
  /wp-(admin|login|config|includes|content)/i,
  /phpmyadmin|phpinfo|adminer/i,
  /\.php(\?|$)/i,
  /\/etc\/(passwd|shadow|group)/i,
  /\/proc\/(self|version|cmdline)/i,
  /xmlrpc\.php/i,
  /eval\s*\(/i,
  /(base64_decode|gzinflate|str_rot13)\s*\(/i,
];

const BLOCKED_UA = [
  "sqlmap", "nikto", "masscan", "nmap", "burpsuite", "acunetix",
  "nessus", "openvas", "w3af", "havij", "pangolin", "dirbuster",
  "gobuster", "hydra", "medusa", "metasploit", "zgrab", "nuclei",
];

const SQL_PATTERNS = [
  /(\s|%20|\+)(union|select|insert|update|delete|drop|create|alter|exec|truncate)(\s|%20|\+)/i,
  /(--|%23|%2f\*)/,
  /xp_cmdshell|waitfor\s+delay|sleep\(\d/i,
  /'(\s)*(or|and)(\s)*'?1'?(\s)*=(\s)*'?1/i,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blocked(status = 403): NextResponse {
  return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function addSecurityHeaders(res: NextResponse, reqId: string): NextResponse {
  res.headers.set("X-Request-ID", reqId);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return res;
}

// ─── Main middleware ──────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const ua = request.headers.get("user-agent") ?? "";

  // Unique request ID for tracing
  const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  // ── 1. Block known attack user-agents ─────────────────────────────────────
  const uaLower = ua.toLowerCase();
  if (BLOCKED_UA.some((bad) => uaLower.includes(bad))) {
    return blocked(403);
  }

  // ── 2. Block path traversal and dangerous paths ────────────────────────────
  const decodedPath = (() => { try { return decodeURIComponent(pathname); } catch { return pathname; } })();
  if (BLOCKED_PATH_PATTERNS.some((p) => p.test(decodedPath) || p.test(pathname))) {
    return blocked(404); // 404 so attackers don't know the rule exists
  }

  // ── 3. Block SQL injection in query string ─────────────────────────────────
  if (search && SQL_PATTERNS.some((p) => p.test(search))) {
    return blocked(400);
  }

  // ── 4. Protect admin routes via JWT (Edge-compatible, no Prisma) ──────────
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi  = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    // getToken reads the JWT from the cookie without calling Prisma
    const token = await getToken({
      req:    request,
      secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    });

    if (!token) {
      if (isAdminPage) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((token as any).role !== "ADMIN") {
      if (isAdminPage) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── 5. Block mutations with empty User-Agent ───────────────────────────────
  if (pathname.startsWith("/api/") && !ua && request.method !== "GET") {
    return blocked(400);
  }

  // ── 6. Pass through with security headers ─────────────────────────────────
  return addSecurityHeaders(NextResponse.next(), reqId);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-|splash-|manifest|sw\\.js|logo|music|robots\\.txt|sitemap).*)",
  ],
};
