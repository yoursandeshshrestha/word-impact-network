import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { withAuth } from "@/common/services/auth";

interface ErrorResponse {
  message: string;
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  duration: number;
  backblazeUrl: string;
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
  process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080/api/v1";

export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/courses`);
      return response.data.data;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to fetch courses";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPreviewCourseById = createAsyncThunk(
  "courses/fetchPreviewCourseById",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/student/courses/${courseId}/preview`
      );
      return response.data.data;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to fetch course details";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  "courses/enrollInCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/student/courses/${courseId}/enroll`,
        {},
        {
          headers: withAuth() as Record<string, string>,
        }
      );

      return response.data.data;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to enroll in course";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const courseSlice = createSlice({
  name: "courses",
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
