"use client";

import { apiClient, type User, type AuthResult } from "@/lib/api-client";
import Cookies from "js-cookie";

// Re-export types for backward compatibility
export type { User, AuthResult };

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
  return apiClient.login(email, password);
};

/**
 * Logs the user out by removing auth cookies and redirecting to login
 * @returns AuthResult object indicating success/failure
 */
export const logout = (): AuthResult => {
  try {
    apiClient.logout();
    return { success: true };
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
 * Checks if the user is currently authenticated by checking for auth cookies
 * @returns boolean indicating auth status
 */
export const isAuthenticated = (): boolean => {
  const accessToken = Cookies.get("client-access-token-win");
  const refreshToken = Cookies.get("client-refresh-token-win");
  return !!(accessToken || refreshToken);
};

/**
 * Gets the current user from API
 * @returns Promise<User | null> User object or null if not authenticated
 */
export const getCurrentUser = async (): Promise<User | null> => {
  return apiClient.getCurrentUser();
};

/**
 * Gets the auth token from cookies
 * @returns Auth token or null if not present
 * @deprecated Use credentials: "include" instead
 */
export const getAuthToken = (): string | null => {
  return apiClient.getAuthToken();
};

/**
 * Adds auth token to request headers
 * @param headers Initial headers object
 * @returns Headers with auth token added
 * @deprecated Use credentials: "include" instead
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
