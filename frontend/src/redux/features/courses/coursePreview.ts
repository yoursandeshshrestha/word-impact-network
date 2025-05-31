import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getAuthToken } from "@/common/services/auth";

interface ErrorResponse {
  message: string;
}

interface PreviewVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  backblazeUrl: string;
}

interface PreviewChapter {
  id: string;
  title: string;
  description: string;
  previewVideo?: PreviewVideo;
}

interface YearlyStructure {
  year: number;
  chapterCount: number;
  previewChapters: PreviewChapter[];
}

interface CoursePreview {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  coverImageUrl: string;
  totalChapters: number;
  enrollmentCount: number;
  instructor: string;
  createdAt: string;
  yearlyStructure: YearlyStructure[];
  previewChapter: PreviewChapter;
}

interface CoursePreviewState {
  coursePreview: CoursePreview | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080/api/v1";

export const fetchCoursePreview = createAsyncThunk(
  "coursePreview/fetchCoursePreview",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(
        `${BASE_URL}/student/courses/${courseId}/preview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data as CoursePreview;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to fetch course preview";

      if ((error as AxiosError).response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const coursePreviewSlice = createSlice({
  name: "coursePreview",
  initialState: {
    coursePreview: null,
    status: "idle",
    error: null as string | null,
  } as CoursePreviewState,
  reducers: {
    clearCoursePreview: (state) => {
      state.coursePreview = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoursePreview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCoursePreview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.coursePreview = action.payload;
        state.error = null;
      })
      .addCase(fetchCoursePreview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearCoursePreview } = coursePreviewSlice.actions;
export default coursePreviewSlice.reducer;
