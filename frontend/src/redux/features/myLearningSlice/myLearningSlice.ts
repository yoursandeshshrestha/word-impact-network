import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getAuthToken } from "@/common/services/auth";

interface ErrorResponse {
  message: string;
}

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

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080/api/v1";

export const fetchMyLearningCourses = createAsyncThunk(
  "myLearning/fetchMyLearningCourses",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${BASE_URL}/mylearning/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data.data as MyLearningCourse[];
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to fetch learning courses";

      if ((error as AxiosError).response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(errorMessage);
      }

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
