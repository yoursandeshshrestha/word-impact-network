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
    // If we have an access token, try to validate it
    if (accessToken) {
      const validateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/validate-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // If validate request is successful, tokens are valid
      if (validateResponse.ok) {
        return { isValid: true };
      }

      // If validate request failed with 401 but we have a refresh token, try to refresh
      if (refreshToken && validateResponse.status === 401) {
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/student/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `client-refresh-token-win=${refreshToken}`,
            },
          }
        );

        if (refreshResponse.ok) {
          // Extract cookies from the response headers
          const setCookieHeaders = refreshResponse.headers.getSetCookie();
          let newAccessToken = "";
          let newRefreshToken = "";

          for (const cookieHeader of setCookieHeaders) {
            if (cookieHeader.includes("client-access-token-win=")) {
              const match = cookieHeader.match(
                /client-access-token-win=([^;]+)/
              );
              if (match) {
                newAccessToken = match[1];
              }
            }
            if (cookieHeader.includes("client-refresh-token-win=")) {
              const match = cookieHeader.match(
                /client-refresh-token-win=([^;]+)/
              );
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
    } else if (refreshToken) {
      // If we only have a refresh token, try to refresh directly
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `client-refresh-token-win=${refreshToken}`,
          },
        }
      );

      if (refreshResponse.ok) {
        // Extract cookies from the response headers
        const setCookieHeaders = refreshResponse.headers.getSetCookie();
        let newAccessToken = "";
        let newRefreshToken = "";

        for (const cookieHeader of setCookieHeaders) {
          if (cookieHeader.includes("client-access-token-win=")) {
            const match = cookieHeader.match(/client-access-token-win=([^;]+)/);
            if (match) {
              newAccessToken = match[1];
            }
          }
          if (cookieHeader.includes("client-refresh-token-win=")) {
            const match = cookieHeader.match(
              /client-refresh-token-win=([^;]+)/
            );
            if (match) {
              newRefreshToken = match[1];
            }
          }
        }

        // If we got new tokens, return them
        if (newAccessToken || newRefreshToken) {
          return {
            isValid: true,
            newAccessToken: newAccessToken,
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

  // Skip middleware for API routes
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public routes without authentication
  const isPublicRoute =
    (path.startsWith("/courses") && path.includes("/preview")) ||
    path === "/" ||
    path.startsWith("/about-") ||
    path.startsWith("/academic-") ||
    path.startsWith("/ambassadors") ||
    path.startsWith("/board-of-directors") ||
    path.startsWith("/curriculum") ||
    path.startsWith("/educational-programs") ||
    path.startsWith("/faculty-profiles") ||
    path.startsWith("/faq") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/newsletters") ||
    path.startsWith("/office-of-the-president") ||
    path.startsWith("/online-training") ||
    path.startsWith("/our-") ||
    path.startsWith("/presidents-council") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/support-win");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get("client-access-token-win")?.value;
  const refreshToken = request.cookies.get("client-refresh-token-win")?.value;

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
  } else {
    // If no tokens, user is not authenticated
    hasValidTokens = false;
  }

  // Create response
  const response = NextResponse.next();

  // Set new tokens in cookies if we got them from refresh
  if (newAccessToken) {
    response.cookies.set("client-access-token-win", newAccessToken, {
      httpOnly: false, // Allow JavaScript access for frontend
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });
  }

  if (newRefreshToken) {
    response.cookies.set("client-refresh-token-win", newRefreshToken, {
      httpOnly: false, // Allow JavaScript access for frontend
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
      redirectResponse.cookies.set("client-access-token-win", newAccessToken, {
        httpOnly: false, // Allow JavaScript access for frontend
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60, // 15 minutes
      });
    }

    if (newRefreshToken) {
      redirectResponse.cookies.set(
        "client-refresh-token-win",
        newRefreshToken,
        {
          httpOnly: false, // Allow JavaScript access for frontend
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        }
      );
    }

    return redirectResponse;
  };

  // If user is on auth pages (login, register, etc.)
  if (path.startsWith("/auth/")) {
    // If they have valid tokens, redirect to my-learning (they're already logged in)
    if (hasValidTokens) {
      return createRedirectResponse("/my-learning");
    }
    // If no valid tokens, allow access to auth pages
    return response;
  }

  // If user is on root path, redirect based on authentication
  if (path === "/") {
    if (hasValidTokens) {
      return createRedirectResponse("/my-learning");
    } else {
      // For unauthenticated users, allow access to root (it's a public page)
      return response;
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
    // Protected routes
    "/profile/:path*",
    "/all-courses/:path*",
    "/my-learning/:path*",
    "/my-learning/course/:path*",
    "/support/:path*",
    // Auth routes
    "/auth/:path*",
    // Public routes that need middleware (for redirects)
    "/",
    "/courses/:path*",
  ],
};
