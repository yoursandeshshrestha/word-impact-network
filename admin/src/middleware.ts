import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Get auth token from cookies
  const authToken = request.cookies.get("authToken")?.value;

  // If user is on auth pages and has a token, redirect to dashboard
  if (path.startsWith("/auth/") && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is on protected pages and doesn't have a token, redirect to login
  if (!path.startsWith("/auth/") && !authToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    "/dashboard",
    "/courses/:path*",
    "/settings/:path*",
    "/analytics",
    "/applications/:path*",
    "/students",
    // Auth routes
    "/auth/:path*",
  ],
};
