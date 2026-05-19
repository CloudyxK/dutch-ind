import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const protectedRoutes = ["/profile", "/checkout", "/order-success", "/wishlist"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

export default auth(function middleware(req) {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;

  if (authRoutes.some((r) => pathname.startsWith(r)) && session) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !session) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.nextUrl)
    );
  }

  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if ((session.user as any)?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
