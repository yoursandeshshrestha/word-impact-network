import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const authToken = request.cookies.get("authToken")?.value;

  if (path.startsWith("/auth/") && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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
