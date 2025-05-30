import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface PasswordResetState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PasswordResetState = {
  status: "idle",
  error: null,
};

export const requestPasswordReset = createAsyncThunk(
  "passwordReset/request",
  async (email: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/student/request-password-reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to request password reset");
    }

    return result;
  }
);

export const completePasswordReset = createAsyncThunk(
  "passwordReset/complete",
  async (data: {
    resetId: string;
    verificationCode: string;
    newPassword: string;
  }) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/student/complete-password-reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to complete password reset");
    }

    return result;
  }
);

const passwordResetSlice = createSlice({
  name: "passwordReset",
  initialState,
  reducers: {
    clearPasswordResetState: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Failed to request password reset";
      })
      // Complete Password Reset
      .addCase(completePasswordReset.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(completePasswordReset.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(completePasswordReset.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Failed to complete password reset";
      });
  },
});

export const { clearPasswordResetState } = passwordResetSlice.actions;
export default passwordResetSlice.reducer;
