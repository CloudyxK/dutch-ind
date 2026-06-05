import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// ─── Attack pattern blocklists ────────────────────────────────────────────────

/** Paths that signal scanning / path-traversal attempts */
const BLOCKED_PATH_PATTERNS = [
  /\.\.(\/|\\|%2f|%5c)/i,                // path traversal
  /\.(env|git|htaccess|htpasswd|ssh|bash_history|zshrc|npmrc|yarnrc)$/i,
  /wp-(admin|login|config|includes|content)/i,  // WordPress probing
  /phpmyadmin|phpinfo|adminer/i,
  /\.php(\?|$)/i,
  /\/etc\/(passwd|shadow|group)/i,
  /\/proc\/(self|version|cmdline)/i,
  /xmlrpc\.php/i,
  /eval\s*\(/i,
  /(base64_decode|gzinflate|str_rot13)\s*\(/i,   // PHP webshell patterns
];

/** Known attack tool user-agent substrings */
const BLOCKED_UA = [
  "sqlmap", "nikto", "masscan", "nmap", "burpsuite", "acunetix",
  "nessus", "openvas", "w3af", "havij", "pangolin", "dirbuster",
  "gobuster", "hydra", "medusa", "metasploit", "zgrab", "nuclei",
  "python-requests/2.1",  // common scraper version
  "curl/7.1",             // old curl used by some attack scripts
];

/** SQL injection fragments in query strings */
const SQL_PATTERNS = [
  /(\s|%20|\+)(union|select|insert|update|delete|drop|create|alter|exec|truncate)(\s|%20|\+)/i,
  /(--|%23|%2f\*)/,       // SQL comment starters
  /xp_cmdshell|waitfor\s+delay|sleep\(\d/i,
  /'(\s)*(or|and)(\s)*'?1'?(\s)*=(\s)*'?1/i,  // classic OR 1=1
];

// ─── Admin-only route prefix ──────────────────────────────────────────────────
const ADMIN_PREFIX = "/admin";
const ADMIN_API_PREFIX = "/api/admin";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function blocked(reason: string, status = 403): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: "Forbidden", reason }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

function addSecurityHeaders(res: NextResponse, reqId: string): NextResponse {
  res.headers.set("X-Request-ID", reqId);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  return res;
}

// ─── Main middleware ──────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const ua = request.headers.get("user-agent") ?? "";
  const fullPath = pathname + search;

  // Generate unique request ID for tracing
  const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  // ── 1. Block known attack user-agents ─────────────────────────────────────
  const uaLower = ua.toLowerCase();
  if (BLOCKED_UA.some((bad) => uaLower.includes(bad))) {
    console.warn(`[security] Blocked UA: ${ua.slice(0, 80)} | path: ${pathname}`);
    return blocked("Forbidden user-agent", 403);
  }

  // ── 2. Block path traversal and dangerous paths ────────────────────────────
  const decodedPath = decodeURIComponent(pathname);
  if (BLOCKED_PATH_PATTERNS.some((p) => p.test(decodedPath) || p.test(pathname))) {
    console.warn(`[security] Blocked path: ${pathname} | IP: ${request.headers.get("x-forwarded-for") ?? "?"}`);
    return blocked("Forbidden path", 404); // 404 to not reveal the rule
  }

  // ── 3. Block SQL injection patterns in query string ────────────────────────
  if (search && SQL_PATTERNS.some((p) => p.test(search))) {
    console.warn(`[security] SQL pattern in query: ${search.slice(0, 100)}`);
    return blocked("Invalid request", 400);
  }

  // ── 4. Admin route protection ──────────────────────────────────────────────
  const isAdminPage = pathname.startsWith(ADMIN_PREFIX);
  const isAdminApi  = pathname.startsWith(ADMIN_API_PREFIX);

  if (isAdminPage || isAdminApi) {
    const session = await auth();

    if (!session) {
      if (isAdminPage) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== "ADMIN") {
      console.warn(`[security] Non-admin access attempt: ${session.user?.email} → ${pathname}`);
      if (isAdminPage) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── 5. Block empty or suspicious User-Agent on API mutations ──────────────
  if (pathname.startsWith("/api/") && !ua && request.method !== "GET") {
    return blocked("Missing User-Agent", 400);
  }

  // ── 6. Enforce HTTPS redirect signal header ────────────────────────────────
  // Vercel handles actual HTTPS redirect; we add HSTS header
  const res = NextResponse.next();
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return addSecurityHeaders(res, reqId);
}

export const config = {
  matcher: [
    // Run on everything EXCEPT static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|icon-|splash-|manifest|sw.js|logo|music|robots.txt|sitemap).*)",
  ],
};
