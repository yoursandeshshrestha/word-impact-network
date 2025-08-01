import Cookies from "js-cookie";

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  applicationStatus: string;
  hasChangedPassword?: boolean;
  profilePictureUrl?: string;
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

export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data: T;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  }

  /**
   * Get auth token from cookies
   */
  private getAuthTokenFromCookie(): string | null {
    return Cookies.get("client-access-token-win") || null;
  }

  /**
   * Get refresh token from cookies
   */
  private getRefreshToken(): string | null {
    return Cookies.get("client-refresh-token-win") || null;
  }

  /**
   * Set auth tokens in cookies
   */
  private setAuthTokens(accessToken: string, refreshToken?: string): void {
    Cookies.set("client-access-token-win", accessToken, {
      expires: 1 / 24, // 1 hour (access token expires in 15 minutes, but we set it for 1 hour)
      path: "/",
      sameSite: "strict",
    });

    if (refreshToken) {
      Cookies.set("client-refresh-token-win", refreshToken, {
        expires: 7, // 7 days
        path: "/",
        sameSite: "strict",
      });
    }
  }

  /**
   * Clear auth tokens
   */
  private clearAuthTokens(): void {
    Cookies.remove("client-access-token-win", { path: "/" });
    Cookies.remove("client-refresh-token-win", { path: "/" });
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/student/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        // Extract tokens from cookies in response
        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
          const cookies = setCookieHeader.split(",");
          let newAccessToken: string | undefined;
          let newRefreshToken: string | undefined;

          for (const cookie of cookies) {
            if (cookie.includes("client-access-token-win=")) {
              newAccessToken = cookie.split(";")[0].split("=")[1];
            }
            if (cookie.includes("client-refresh-token-win=")) {
              newRefreshToken = cookie.split(";")[0].split("=")[1];
            }
          }

          if (newAccessToken) {
            this.setAuthTokens(newAccessToken, newRefreshToken);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    let accessToken = this.getAuthTokenFromCookie();

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if available
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // Make the request
    let response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && this.getRefreshToken()) {
      const refreshSuccess = await this.refreshAccessToken();
      if (refreshSuccess) {
        // Retry the request with new token
        accessToken = this.getAuthTokenFromCookie();
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: "include",
          });
        }
      }
    }

    // Handle response
    if (!response.ok) {
      if (response.status === 401) {
        // Clear tokens and redirect to login
        this.clearAuthTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }

      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new Error(errorData.message || "Request failed");
    }

    return response.json();
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.baseURL}/student/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Failed to login",
        };
      }

      const data: LoginResponse = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }

      // User data will be fetched via API routes when needed

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
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await fetch(`${this.baseURL}/student/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Ignore errors in logout request
      console.error("Logout request failed:", error);
    } finally {
      // Clear all auth data
      this.clearAuthTokens();

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthTokenFromCookie();
  }

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.request<{ profile: User }>(
        "/student/profile"
      );

      // The backend returns { profile: { ...userData } }
      // We need to extract the profile data and map it to our User interface
      const profileData = response.data.profile;

      return {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.fullName,
        role: "STUDENT", // Default role for students
        applicationStatus: "APPROVED", // Default status for approved students
      };
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return null;
    }
  }

  /**
   * Get auth token
   */
  getAuthToken(): string | null {
    return this.getAuthTokenFromCookie();
  }

  // API methods for different endpoints
  async getProfile() {
    return this.request<User>("/student/profile");
  }

  async updateProfile(data: Partial<User>) {
    return this.request<User>("/student/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getEnrolledCourses() {
    return this.request("/mylearning/courses");
  }

  async enrollInCourse(courseId: string) {
    return this.request(`/student/courses/${courseId}/enroll`, {
      method: "POST",
    });
  }

  async getStudentProgress() {
    return this.request("/student/progress");
  }

  async getCourseContent(courseId: string) {
    return this.request(`/mylearning/courses/${courseId}`);
  }

  async updateVideoProgress(videoId: string, progress: number) {
    return this.request(`/student/videos/${videoId}/progress`, {
      method: "POST",
      body: JSON.stringify({ progress }),
    });
  }

  async getExamDetails(examId: string) {
    return this.request(`/student/exams/${examId}`);
  }

  async startExamAttempt(examId: string) {
    return this.request(`/student/exams/${examId}/attempt`, {
      method: "POST",
    });
  }

  async submitExamAttempt(attemptId: string, answers: Record<string, unknown>) {
    return this.request(`/student/exam-attempts/${attemptId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  }

  async getExamResult(attemptId: string) {
    return this.request(`/student/exam-attempts/${attemptId}/result`);
  }

  // News API methods
  async getActiveNews() {
    return this.request<News[]>("/news/active");
  }

  async getNewsBySlug(slug: string) {
    return this.request<News>(`/news/slug/${slug}`);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/student/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
}

// News types
export interface NewsImage {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
}

export interface NewsVideo {
  id: string;
  vimeoId: string;
  embedUrl: string;
  fileName: string;
  fileSize: number;
  duration?: number;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    fullName: string;
  };
  images: NewsImage[];
  videos: NewsVideo[];
}

// Export singleton instance
export const apiClient = new ApiClient();
