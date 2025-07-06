import { NextRequest, NextResponse } from "next/server";

// Function to validate tokens and refresh if needed
async function validateAndRefreshTokens(
  accessToken?: string,
  refreshToken?: string
): Promise<{
  isValid: boolean;
  newAccessToken?: string;
  newRefreshToken?: string;
}> {
  try {
    // First, try to validate current tokens by calling the profile endpoint
    const profileResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/profile`,
      {
        method: "GET",
        headers: {
          Cookie: `accessToken=${accessToken || ""}; refreshToken=${
            refreshToken || ""
          }`,
        },
      }
    );

    // If profile request is successful, tokens are valid
    if (profileResponse.ok) {
      return { isValid: true };
    }

    // If profile request failed with 401 but we have a refresh token, try to refresh
    if (refreshToken && profileResponse.status === 401) {
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/refresh-token`,
        {
          method: "POST",
          headers: {
            Cookie: `refreshToken=${refreshToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (refreshResponse.ok) {
        // Extract cookies from the response headers
        const setCookieHeaders = refreshResponse.headers.getSetCookie();
        let newAccessToken = "";
        let newRefreshToken = "";

        for (const cookieHeader of setCookieHeaders) {
          if (cookieHeader.includes("accessToken=")) {
            const match = cookieHeader.match(/accessToken=([^;]+)/);
            if (match) {
              newAccessToken = match[1];
            }
          }
          if (cookieHeader.includes("refreshToken=")) {
            const match = cookieHeader.match(/refreshToken=([^;]+)/);
            if (match) {
              newRefreshToken = match[1];
            }
          }
        }

        // If we got new tokens, return them
        if (newAccessToken || newRefreshToken) {
          return {
            isValid: true,
            newAccessToken: newAccessToken || accessToken,
            newRefreshToken: newRefreshToken || refreshToken,
          };
        }

        // If no new tokens in cookies but response was successful, assume success
        return { isValid: true };
      }
    }

    return { isValid: false };
  } catch {
    return { isValid: false };
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Get tokens from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Check if user has any tokens
  const hasTokens = accessToken || refreshToken;

  // If user has tokens, validate them and refresh if needed
  let hasValidTokens = false;
  let newAccessToken = "";
  let newRefreshToken = "";

  if (hasTokens) {
    const validationResult = await validateAndRefreshTokens(
      accessToken,
      refreshToken
    );
    hasValidTokens = validationResult.isValid;
    newAccessToken = validationResult.newAccessToken || "";
    newRefreshToken = validationResult.newRefreshToken || "";
  }

  // Create response
  const response = NextResponse.next();

  // Set new tokens in cookies if we got them from refresh
  if (newAccessToken) {
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });
  }

  if (newRefreshToken) {
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  }

  // Helper function to create redirect response with new tokens
  const createRedirectResponse = (url: string) => {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url));

    if (newAccessToken) {
      redirectResponse.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60, // 15 minutes
      });
    }

    if (newRefreshToken) {
      redirectResponse.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return redirectResponse;
  };

  // If user is on auth pages (login, register, etc.)
  if (path.startsWith("/auth/")) {
    // If they have valid tokens, redirect to dashboard (they're already logged in)
    if (hasValidTokens) {
      return createRedirectResponse("/dashboard");
    }
    // If no valid tokens, allow access to auth pages
    return response;
  }

  // If user is on root path, redirect based on authentication
  if (path === "/") {
    if (hasValidTokens) {
      return createRedirectResponse("/dashboard");
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // If user is on protected pages, check for valid tokens
  if (!path.startsWith("/auth/")) {
    if (!hasValidTokens) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Root path
    "/",
    // Protected routes
    "/dashboard",
    "/courses/:path*",
    "/settings/:path*",
    "/analytics",
    "/applications/:path*",
    "/students",
    "/announcements",
    "/test",
    // Auth routes
    "/auth/:path*",
  ],
};
