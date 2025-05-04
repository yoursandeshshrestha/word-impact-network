// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const protectedPaths = [
  "/dashboard",
  "/settings",
  "/users",
  "/courses",
  // Add more protected paths as needed
];

// Paths that should redirect to dashboard if user is already authenticated
const authPaths = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // Get auth token from cookies
  const authToken = request.cookies.get("authToken")?.value;

  // Check if the path is protected and user is not authenticated
  if (
    protectedPaths.some((path) => currentPath.startsWith(path)) &&
    !authToken
  ) {
    // Redirect unauthenticated users to login page
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", currentPath);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (authPaths.some((path) => currentPath === path) && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/settings/:path*",
    "/users/:path*",
    "/courses/:path*",
    // Auth routes
    "/auth/login",
    "/auth/register",
  ],
};
