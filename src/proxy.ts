import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const protectedRoutes = ["/profile", "/checkout", "/order-success", "/wishlist"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

// Security headers added to every page response
// (API routes also get them via next.config.ts headers())
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export default auth(function middleware(req: NextRequest & { auth: any }) {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;

  // Redirect logged-in users away from auth pages
  if (authRoutes.some((r) => pathname.startsWith(r)) && session) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/", req.nextUrl)));
  }

  // Redirect unauthenticated users from protected routes
  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !session) {
    return addSecurityHeaders(
      NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.nextUrl)
      )
    );
  }

  // Admin-only routes
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!session) {
      return addSecurityHeaders(NextResponse.redirect(new URL("/login", req.nextUrl)));
    }
    if ((session.user as any)?.role !== "ADMIN") {
      return addSecurityHeaders(NextResponse.redirect(new URL("/", req.nextUrl)));
    }
  }

  return addSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
