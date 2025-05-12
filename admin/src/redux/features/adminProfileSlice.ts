import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/utils/auth";

// Types
export interface AdminStatistics {
  coursesCreated: number;
  chaptersCreated: number;
  examsCreated: number;
  applicationsReviewed: number;
}

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  statistics: AdminStatistics;
}

export interface PasswordReset {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordResetVerification {
  resetId: string;
  verificationCode: string;
}

interface AdminProfileState {
  profile: AdminProfile | null;
  isLoading: boolean;
  error: string | null;
  passwordResetStatus: "idle" | "pending" | "success" | "error";
  passwordResetMessage: string | null;
  passwordVerificationNeeded: boolean;
  resetId: string | null;
}

const initialState: AdminProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  passwordResetStatus: "idle",
  passwordResetMessage: null,
  passwordVerificationNeeded: false,
  resetId: null,
};

// Async thunks
export const fetchAdminProfile = createAsyncThunk(
  "adminProfile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch admin profile";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "adminProfile/requestPasswordReset",
  async (passwordData: PasswordReset, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/admin/request-password-reset`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to request password reset");
      }

      return data;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const verifyPasswordReset = createAsyncThunk(
  "adminProfile/verifyPasswordReset",
  async (verificationData: PasswordResetVerification, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/admin/verify-password-reset`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to verify password reset");
      }

      return data;
    } catch (error) {
      console.error("Error verifying password reset:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

// Slice
const adminProfileSlice = createSlice({
  name: "adminProfile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordResetStatus: (state) => {
      state.passwordResetStatus = "idle";
      state.passwordResetMessage = null;
      state.passwordVerificationNeeded = false;
      state.resetId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin profile
      .addCase(fetchAdminProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Request password reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordResetStatus = "pending";
        state.passwordResetMessage = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.passwordResetStatus = "success";
        state.passwordResetMessage =
          action.payload.message || "Password reset requested successfully";

        // Check if verification is needed
        if (action.payload.data?.resetId) {
          state.passwordVerificationNeeded = true;
          state.resetId = action.payload.data.resetId;
        } else {
          state.passwordVerificationNeeded = false;
          state.resetId = null;
        }
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordResetStatus = "error";
        state.passwordResetMessage = action.payload as string;
      })

      // Verify password reset
      .addCase(verifyPasswordReset.pending, (state) => {
        state.passwordResetStatus = "pending";
        state.passwordResetMessage = null;
      })
      .addCase(verifyPasswordReset.fulfilled, (state, action) => {
        state.passwordResetStatus = "success";
        state.passwordResetMessage =
          action.payload.message || "Password reset verified successfully";
        state.passwordVerificationNeeded = false;
        state.resetId = null;
      })
      .addCase(verifyPasswordReset.rejected, (state, action) => {
        state.passwordResetStatus = "error";
        state.passwordResetMessage = action.payload as string;
      });
  },
});

// Selectors
export const selectAdminProfile = (state: RootState) =>
  state.adminProfile.profile;
export const selectIsLoading = (state: RootState) =>
  state.adminProfile.isLoading;
export const selectError = (state: RootState) => state.adminProfile.error;
export const selectPasswordResetStatus = (state: RootState) =>
  state.adminProfile.passwordResetStatus;
export const selectPasswordResetMessage = (state: RootState) =>
  state.adminProfile.passwordResetMessage;
export const selectPasswordVerificationNeeded = (state: RootState) =>
  state.adminProfile.passwordVerificationNeeded;
export const selectResetId = (state: RootState) => state.adminProfile.resetId;

// Actions
export const { clearError, clearPasswordResetStatus } =
  adminProfileSlice.actions;

export default adminProfileSlice.reducer;
