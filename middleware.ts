import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/lib/auth/auth.config";

const publicRoutes = new Set(["/", "/login", "/register"]);

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const pathname = nextUrl.pathname;
  const isLoggedIn = Boolean(session?.user);
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute =
    pathname.startsWith("/matches") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/profile");

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/matches", nextUrl));
  }

  if (!isLoggedIn && (isProtectedRoute || isAdminRoute)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/matches", nextUrl));
  }

  if (isLoggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/matches", nextUrl));
  }

  if (!isLoggedIn && publicRoutes.has(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/login", "/register", "/matches/:path*", "/leaderboard/:path*", "/profile/:path*", "/admin/:path*"]
};
