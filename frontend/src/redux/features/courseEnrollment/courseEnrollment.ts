import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface EnrollmentResponse {
  id: string;
  courseId: string;
  studentId: string;
  enrollmentDate: string;
  isActive: boolean;
  message: string;
}

interface CourseEnrollmentState {
  enrollmentData: EnrollmentResponse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const enrollInCourse = createAsyncThunk(
  "courseEnrollment/enrollInCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/student/courses/${courseId}/enroll`,
        {
          method: "POST",
          credentials: "include", // This will automatically send cookies
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to enroll in course";

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (response.status === 409) {
          toast.error("You are already enrolled in this course.");
        } else {
          toast.error(errorMessage);
        }

        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      toast.success("Successfully enrolled in course!");
      return data.data as EnrollmentResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to enroll in course";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const courseEnrollmentSlice = createSlice({
  name: "courseEnrollment",
  initialState: {
    enrollmentData: null,
    status: "idle",
    error: null as string | null,
  } as CourseEnrollmentState,
  reducers: {
    clearEnrollment: (state) => {
      state.enrollmentData = null;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(enrollInCourse.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enrollmentData = action.payload;
        state.error = null;
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearEnrollment } = courseEnrollmentSlice.actions;
export default courseEnrollmentSlice.reducer;
