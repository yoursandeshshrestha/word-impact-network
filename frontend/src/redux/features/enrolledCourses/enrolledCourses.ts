import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface EnrollmentData {
  id: string;
  enrollmentDate: string;
  isActive: boolean;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  coverImageUrl: string;
}

interface ChapterData {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseYear: number;
  videosCount: number;
}

interface ProgressData {
  completedChapters: number;
  totalChapters: number;
  chapterProgressPercent: number;
  watchedVideos: number;
  totalVideos: number;
  videoProgressPercent: number;
  overallProgress: number;
}

interface CertificationData {
  id?: string;
  issuedDate?: string;
  certificateUrl?: string;
}

interface EnrolledCourseData {
  enrollment: EnrollmentData;
  course: CourseData;
  chapters: ChapterData[];
  progress: ProgressData;
  certification: CertificationData | null;
}

interface EnrolledCoursesResponse {
  enrolled: {
    count: number;
    courses: EnrolledCourseData[];
  };
  recommended: {
    count: number;
    courses: CourseData[];
  };
}

interface EnrolledCoursesState {
  enrolledCourses: EnrolledCourseData[];
  recommendedCourses: CourseData[];
  enrolledCount: number;
  recommendedCount: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const fetchEnrolledCourses = createAsyncThunk(
  "enrolledCourses/fetchEnrolledCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/mylearning/courses`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Failed to fetch enrolled courses";

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(errorMessage);
        }

        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return data.data as EnrolledCoursesResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch enrolled courses";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const enrolledCoursesSlice = createSlice({
  name: "enrolledCourses",
  initialState: {
    enrolledCourses: [],
    recommendedCourses: [],
    enrolledCount: 0,
    recommendedCount: 0,
    status: "idle",
    error: null as string | null,
  } as EnrolledCoursesState,
  reducers: {
    clearEnrolledCourses: (state) => {
      state.enrolledCourses = [];
      state.recommendedCourses = [];
      state.enrolledCount = 0;
      state.recommendedCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload && action.payload.enrolled) {
          state.enrolledCourses = action.payload.enrolled.courses || [];
          state.enrolledCount = action.payload.enrolled.count || 0;
        } else {
          state.enrolledCourses = [];
          state.enrolledCount = 0;
        }

        if (action.payload && action.payload.recommended) {
          state.recommendedCourses = action.payload.recommended.courses || [];
          state.recommendedCount = action.payload.recommended.count || 0;
        } else {
          state.recommendedCourses = [];
          state.recommendedCount = 0;
        }

        state.error = null;
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearEnrolledCourses } = enrolledCoursesSlice.actions;
export default enrolledCoursesSlice.reducer;
