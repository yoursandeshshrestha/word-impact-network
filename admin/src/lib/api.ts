import { safeRedirectToLogin } from "@/utils/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data?: T;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private activeUploads: Set<string> = new Set(); // Track active uploads
  private refreshPromise: Promise<ApiResponse> | null = null; // Store the refresh promise

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Method to register an active upload
  private registerUpload(uploadId: string): void {
    this.activeUploads.add(uploadId);
  }

  // Method to unregister an upload
  private unregisterUpload(uploadId: string): void {
    this.activeUploads.delete(uploadId);
  }

  // Check if there are any active uploads
  private hasActiveUploads(): boolean {
    return this.activeUploads.size > 0;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      credentials: "include", // Always include cookies
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      // Check for expired tokens before making the request
      this.checkAndClearExpiredTokens();

      const response = await fetch(url, config);

      if (response.ok) {
        return await response.json();
      }

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !this.isRefreshing) {
        // Don't automatically refresh tokens if there are active uploads
        if (this.hasActiveUploads()) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              "Authentication failed - please refresh the page and try again"
          );
        }

        this.isRefreshing = true;
        this.refreshPromise = this.refreshToken();

        try {
          const refreshResponse = await this.refreshPromise;

          // If refresh was successful, retry the original request
          if (refreshResponse.status === "success") {
            const retryResponse = await fetch(url, config);
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }

          // If refresh failed, redirect to login
          this.safeRedirectToLogin();
          return refreshResponse as ApiResponse<T>;
        } finally {
          this.isRefreshing = false;
          this.refreshPromise = null;
        }
      } else if (response.status === 401) {
        // If we're already refreshing, wait for the existing refresh promise
        if (this.refreshPromise) {
          try {
            const refreshResponse = await this.refreshPromise;

            // If refresh was successful, retry the original request
            if (refreshResponse.status === "success") {
              const retryResponse = await fetch(url, config);
              if (retryResponse.ok) {
                return await retryResponse.json();
              }
            }

            // If refresh failed, redirect to login
            this.safeRedirectToLogin();
            return refreshResponse as ApiResponse<T>;
          } catch {
            this.safeRedirectToLogin();
            return {
              status: "error",
              message: "Authentication failed - redirecting to login",
              data: null as T,
            };
          }
        } else {
          // If we're already refreshing, just redirect to login
          this.safeRedirectToLogin();
          return {
            status: "error",
            message: "Authentication failed - redirecting to login",
            data: null as T,
          };
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  private async refreshToken(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }

      // If refresh fails, clear cookies and handle gracefully
      this.clearAuthCookies();

      // For expired refresh tokens, immediately redirect to login
      if (response.status === 401) {
        this.safeRedirectToLogin();
        return {
          status: "error",
          message: "Refresh token expired - redirecting to login",
          data: null,
        };
      }

      // For other errors, still throw to maintain existing behavior
      throw new Error("Token refresh failed");
    } catch {
      this.clearAuthCookies();

      // If it's a network error or other issue, immediately redirect to login
      this.safeRedirectToLogin();
      return {
        status: "error",
        message: "Token refresh failed - redirecting to login",
        data: null,
      };
    }
  }

  private clearAuthCookies(): void {
    // Simple and effective cookie clearing
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";

    // Also clear with domain if we're on localhost
    if (window.location.hostname === "localhost") {
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost";
    }
  }

  // Method to check if we have valid tokens
  private hasValidTokens(): boolean {
    // Check if we have cookies (basic check)
    const cookies = document.cookie.split(";");
    const hasAccessToken = cookies.some((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    const hasRefreshToken = cookies.some((cookie) =>
      cookie.trim().startsWith("refreshToken=")
    );

    return hasAccessToken || hasRefreshToken;
  }

  // Method to check and clear expired tokens
  private checkAndClearExpiredTokens(): void {
    // This is a basic check - in a real implementation you might want to decode JWT tokens
    // to check their expiration time
    if (!this.hasValidTokens()) {
      this.clearAuthCookies();
    }
  }

  // Safe redirect method that prevents multiple redirects
  private safeRedirectToLogin(): void {
    safeRedirectToLogin();
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // File upload request
  async upload<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData, // Don't set Content-Type for FormData
      });

      // For uploads, we should NOT automatically refresh tokens during the upload process
      // as this can cause the FormData to be consumed and the upload to fail
      // Instead, we should let the upload complete and handle auth issues separately
      if (response.status === 401) {
        // Don't redirect immediately for uploads - let the calling code handle this
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Authentication failed during upload"
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Manual token refresh method for when uploads are complete
  async manualRefreshToken(): Promise<ApiResponse> {
    return this.refreshToken();
  }

  // Method to check if token refresh is needed (for manual refresh)
  async checkTokenValidity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/profile`, {
        method: "GET",
        credentials: "include",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Public method to clear expired tokens
  clearExpiredTokens(): void {
    this.clearAuthCookies();
  }

  // Public method to force clear all auth cookies
  forceClearAuthCookies(): void {
    this.clearAuthCookies();
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export convenience methods
export const api = {
  get: <T>(endpoint: string) => apiClient.get<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: unknown) =>
    apiClient.put<T>(endpoint, data),
  patch: <T>(endpoint: string, data?: unknown) =>
    apiClient.patch<T>(endpoint, data),
  delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
  upload: <T>(endpoint: string, formData: FormData) =>
    apiClient.upload<T>(endpoint, formData),
  manualRefreshToken: () => apiClient.manualRefreshToken(),
  checkTokenValidity: () => apiClient.checkTokenValidity(),
  clearExpiredTokens: () => apiClient.clearExpiredTokens(),
  forceClearAuthCookies: () => apiClient.forceClearAuthCookies(),
};
