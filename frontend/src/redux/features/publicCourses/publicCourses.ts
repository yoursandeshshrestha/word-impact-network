import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface VideoData {
  id: string;
  title: string;
  description: string;
  duration: number;
  vimeoId: string;
  embedUrl: string;
}

interface ChapterData {
  id: string;
  title: string;
  description: string;
  previewVideo?: VideoData;
}

interface YearData {
  year: number;
  chapterCount: number;
  previewChapters: ChapterData[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  coverImageUrl: string;
  totalChapters: number;
  enrollmentCount: number;
  instructor: string;
  createdAt: string;
  yearlyStructure: YearData[];
  previewChapter: ChapterData;
}

interface PublicCoursesState {
  courses: CourseData[];
  coursePreviews: CourseData[];
  currentCourse: CourseData | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const fetchCourses = createAsyncThunk(
  "publicCourses/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/courses`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to fetch courses";
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch courses";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPreviewCourseById = createAsyncThunk(
  "publicCourses/fetchPreviewCourseById",
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
          errorData.message || "Failed to fetch course details";
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch course details";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  "publicCourses/enrollInCourse",
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
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to enroll in course";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const courseSlice = createSlice({
  name: "publicCourses",
  initialState: {
    courses: [],
    coursePreviews: [],
    currentCourse: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
    status: "idle",
    error: null as string | null,
  } as PublicCoursesState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchCourses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Handle fetchPreviewCourseById
      .addCase(fetchPreviewCourseById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPreviewCourseById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchPreviewCourseById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
