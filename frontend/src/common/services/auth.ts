"use client";

import Cookies from "js-cookie";

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  applicationStatus: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    student: User;
    token: string;
  };
}

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: User;
}

/**
 * Handles user login
 * @param email User email
 * @param password User password
 * @returns AuthResult object with success status and optional message/user
 */
export const login = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/student/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to login",
      };
    }

    const data: LoginResponse = await response.json();

    // Check if the login was successful based on status
    if (data.status !== "success") {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }

    // Store auth token in cookie
    Cookies.set("client-token-win", data.data.token, {
      expires: 7,
      path: "/",
      sameSite: "strict",
    });

    // Store user data in client-accessible cookie
    Cookies.set(
      "user",
      JSON.stringify({
        id: data.data.student.id,
        email: data.data.student.email,
        fullName: data.data.student.fullName,
        role: data.data.student.role,
        applicationStatus: data.data.student.applicationStatus,
      }),
      { expires: 7, path: "/", sameSite: "strict" }
    );

    return {
      success: true,
      user: data.data.student,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Logs the user out by removing auth cookies and redirecting to login
 * @returns AuthResult object indicating success/failure
 */
export const logout = (): AuthResult => {
  try {
    // Remove auth cookies
    Cookies.remove("client-token-win", { path: "/" });
    Cookies.remove("user", { path: "/" });

    // Redirect to login page
    window.location.href = "/auth/login";

    return {
      success: true,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred during logout";
    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Checks if the user is currently authenticated
 * @returns boolean indicating auth status
 */
export const isAuthenticated = (): boolean => {
  const token = Cookies.get("client-token-win");
  return !!token;
};

/**
 * Gets the current user from cookies
 * @returns User object or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  const userJson = Cookies.get("user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

/**
 * Gets the auth token from cookies
 * @returns Auth token or null if not present
 */
export const getAuthToken = (): string | null => {
  return Cookies.get("client-token-win") || null;
};

/**
 * Adds auth token to request headers
 * @param headers Initial headers object
 * @returns Headers with auth token added
 */
export const withAuth = (headers: HeadersInit = {}): HeadersInit => {
  const token = getAuthToken();

  if (token) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return headers;
};
