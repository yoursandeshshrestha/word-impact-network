import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Authentication API service
 */
export const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/login-admin`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please check your API configuration."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Match the exact response structure from the server
      if (data.status !== "success") {
        throw new Error(data.message || "Login failed");
      }

      if (!data.data || !data.data.admin) {
        throw new Error("Invalid response format from server");
      }

      return {
        message: data.message,
        data: {
          admin: {
            id: data.data.admin.id,
            email: data.data.admin.email,
            fullName: data.data.admin.fullName,
            role: data.data.admin.role,
          },
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unknown error occurred during login");
    }
  },

  register: async (formData: {
    email: string;
    password: string;
    fullName: string;
    adminCreationSecret: string;
  }) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/create-admin`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please check your API configuration."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unknown error occurred during registration");
    }
  },

  logout: async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/logout`;

      const response = await fetch(url, {
        method: "POST",
        credentials: "include", // Important: include cookies
      });

      if (response.ok) {
        toast.success("You have been logged out successfully");
      }
    } catch {
      // Silent error handling for logout
    }
  },

  refreshToken: async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/refresh-token`;

      const response = await fetch(url, {
        method: "POST",
        credentials: "include", // Important: include cookies
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/profile`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include", // Important: include cookies
      });

      // Check if this is an authentication error
      if (response.status === 401) {
        // Don't throw error for auth failures - let the API client handle it
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error("Failed to get current user");
      }
    } catch {
      // Don't throw error for auth failures - let the API client handle it
      return null;
    }
  },
};

/**
 * Check if user is authenticated by making a request to the server
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await AuthService.getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
};

// Global state to prevent multiple redirects
let globalRedirectInProgress = false;

/**
 * Safe redirect to login that prevents multiple redirects
 */
export const safeRedirectToLogin = (): void => {
  if (globalRedirectInProgress) {
    return;
  }

  globalRedirectInProgress = true;

  // Use setTimeout to ensure the redirect happens after the current execution context
  setTimeout(() => {
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/auth/login"
    ) {
      window.location.href = "/auth/login";
    }
  }, 100);
};

/**
 * Reset the global redirect flag (useful for testing or manual redirects)
 */
export const resetRedirectFlag = (): void => {
  globalRedirectInProgress = false;
};

/**
 * Remove authentication data (logout)
 */
export const logout = async () => {
  await AuthService.logout();
  // Use safe redirect instead of direct window.location.href
  safeRedirectToLogin();
};

/**
 * Handle authentication during uploads
 * This function checks if the user is still authenticated and provides appropriate feedback
 */
export const handleUploadAuthentication = async (): Promise<{
  isAuthenticated: boolean;
  shouldRefresh: boolean;
  message?: string;
}> => {
  try {
    // Check if user is still authenticated
    const user = await AuthService.getCurrentUser();
    if (user) {
      return { isAuthenticated: true, shouldRefresh: false };
    }
  } catch {
    // Silent error handling for authentication check
  }

  // If we get here, authentication has failed
  return {
    isAuthenticated: false,
    shouldRefresh: true,
    message:
      "Your session has expired. Please refresh the page and try uploading again.",
  };
};

/**
 * Refresh authentication and retry operation
 */
export const refreshAndRetry = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  try {
    // First try the operation
    return await operation();
  } catch (error) {
    // If it's an auth error, try to refresh and retry
    if (
      error instanceof Error &&
      error.message.includes("Authentication failed")
    ) {
      try {
        await AuthService.refreshToken();
        // Retry the operation after refresh
        return await operation();
      } catch {
        throw new Error(
          "Authentication failed. Please refresh the page and try again."
        );
      }
    }
    throw error;
  }
};
