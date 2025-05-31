import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getAuthToken } from "@/common/services/auth";

interface ErrorResponse {
  message: string;
}

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

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080/api/v1";

export const fetchEnrolledCourses = createAsyncThunk(
  "enrolledCourses/fetchEnrolledCourses",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${BASE_URL}/student/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data.data as EnrolledCoursesResponse;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to fetch enrolled courses";

      // Handle authentication errors specifically
      if ((error as AxiosError).response?.status === 401) {
        toast.error("Session expired. Please login again.");
        // You might want to redirect to login page here
        // window.location.href = '/login';
      } else {
        toast.error(errorMessage);
      }

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
        state.enrolledCourses = action.payload.enrolled.courses;
        state.recommendedCourses = action.payload.recommended.courses;
        state.enrolledCount = action.payload.enrolled.count;
        state.recommendedCount = action.payload.recommended.count;
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
