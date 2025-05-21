import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("client-token-win")?.value;

  const isAuthRoute = path.startsWith("/auth");

  if (isAuthRoute && token) {
    const isValid = await validateToken(token);
    if (isValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (!isAuthRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const isValid = await validateToken(token);
    if (!isValid) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/validate-token`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.ok;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
}

export const config = {
  matcher: [
    // Protected routes
    "/dashboard",
      "/settings/:path*",
    "/analytics",
    "/applications/:path*",
    "/students",
    // Auth routes
    "/auth/:path*",
  ],
};
