import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface MyLearningCourse {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  coverImageUrl: string;
  progress: {
    overallProgress: number;
    completedChapters: number;
    totalChapters: number;
    watchedVideos: number;
    totalVideos: number;
  };
}

export interface MyLearningState {
  courses: MyLearningCourse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const fetchMyLearningCourses = createAsyncThunk(
  "myLearning/fetchMyLearningCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/mylearning/courses`, {
        method: "GET",
        credentials: "include", // This will automatically send cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Failed to fetch learning courses";

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(errorMessage);
        }

        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return data.data as MyLearningCourse[];
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch learning courses";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const myLearningSlice = createSlice({
  name: "myLearning",
  initialState: {
    courses: [],
    status: "idle",
    error: null as string | null,
  } as MyLearningState,
  reducers: {
    clearMyLearning: (state) => {
      state.courses = [];
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLearningCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyLearningCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchMyLearningCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearMyLearning } = myLearningSlice.actions;
export default myLearningSlice.reducer;
