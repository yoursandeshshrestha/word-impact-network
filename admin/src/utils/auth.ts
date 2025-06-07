import Cookies from "js-cookie";
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  fullName: string;
}

// Cookie expiration options
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Set authentication token in cookies
 */
export const setAuthToken = (token: string, rememberMe: boolean = false) => {
  const expiryDays = rememberMe ? 30 : 1; // 30 days or 1 day
  Cookies.set("authToken", token, {
    ...COOKIE_OPTIONS,
    expires: expiryDays,
  });
};

/**
 * Set user info in cookies
 */
export const setUserInfo = (user: User, rememberMe: boolean = false) => {
  const expiryDays = rememberMe ? 30 : 1;
  Cookies.set("user", JSON.stringify(user), {
    ...COOKIE_OPTIONS,
    expires: expiryDays,
  });
};

/**
 * Get authentication token from cookies
 */
export const getAuthToken = (): string | undefined => {
  return Cookies.get("authToken");
};

/**
 * Get user info from cookies
 */
export const getUserInfo = (): User | null => {
  const userJson = Cookies.get("user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error("Error parsing user info:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Remove authentication data (logout)
 */
export const logout = () => {
  Cookies.remove("authToken");
  Cookies.remove("user");

  toast.success("You have been logged out successfully");
};

/**
 * Authentication API service
 */
export const AuthService = {
  login: async (email: string, password: string) => {
    try {
      console.log("Login attempt with:", { email });
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/login-admin`;
      console.log("Login URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        credentials: "include",
      });

      console.log("Login response status:", response.status);

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please check your API configuration."
        );
      }

      const data = await response.json();
      console.log("Login response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
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
      console.log("Registration attempt with:", { email: formData.email });
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/create-admin`;
      console.log("Registration URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Registration response status:", response.status);

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please check your API configuration."
        );
      }

      const data = await response.json();
      console.log("Registration response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unknown error occurred during registration");
    }
  },
};
