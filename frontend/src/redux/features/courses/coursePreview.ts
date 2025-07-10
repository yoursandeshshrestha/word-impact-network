import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface PreviewVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  vimeoId: string;
  vimeoUrl: string;
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
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const fetchCoursePreview = createAsyncThunk(
  "coursePreview/fetchCoursePreview",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/student/courses/${courseId}/preview`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Failed to fetch course preview";
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return data.data as CoursePreview;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch course preview";
      toast.error(errorMessage);
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
