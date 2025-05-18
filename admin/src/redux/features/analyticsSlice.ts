import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/utils/auth";

// Types
export interface EnrollmentTrend {
  date: string;
  count: number;
}

export interface CourseCompletionRate {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  completedStudents: number;
  completionRate: number;
}

export interface VideoEngagement {
  videoId: string;
  videoTitle: string;
  chapterTitle: string;
  courseTitle: string;
  viewCount: number;
  averageWatchPercent: number;
}

export interface ExamPerformance {
  examId: string;
  examTitle: string;
  chapterTitle: string;
  courseTitle: string;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
}

export interface StudentProgress {
  studentId: string;
  fullName: string;
  email: string;
  coursesEnrolled: number;
  chaptersCompleted: number;
  examsCompleted: number;
  examsSuccessful: number;
  overallProgress: number;
}

export interface CountryDistribution {
  country: string;
  studentCount: number;
  percentage: number;
}

export interface CourseReferralStats {
  referralSource: string;
  studentCount: number;
  percentage: number;
}

export interface AnalyticsDashboard {
  enrollmentTrends: EnrollmentTrend[];
  courseCompletionRates: CourseCompletionRate[];
  videoEngagementMetrics: VideoEngagement[];
  examPerformanceMetrics: ExamPerformance[];
  studentProgressData: StudentProgress[];
  geographicDistribution: CountryDistribution[];
  referralStats: CourseReferralStats[];
}

interface AnalyticsState {
  dashboard: AnalyticsDashboard | null;
  enrollmentTrends: EnrollmentTrend[];
  courseCompletionRates: CourseCompletionRate[];
  videoEngagementMetrics: VideoEngagement[];
  examPerformanceMetrics: ExamPerformance[];
  studentProgressData: StudentProgress[];
  geographicDistribution: CountryDistribution[];
  referralStats: CourseReferralStats[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboard: null,
  enrollmentTrends: [],
  courseCompletionRates: [],
  videoEngagementMetrics: [],
  examPerformanceMetrics: [],
  studentProgressData: [],
  geographicDistribution: [],
  referralStats: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAnalyticsDashboard = createAsyncThunk(
  "analytics/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics dashboard");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchEnrollmentTrends = createAsyncThunk(
  "analytics/fetchEnrollmentTrends",
  async (period: "week" | "month" | "year" = "month", { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/enrollment-trends?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch enrollment trends");
      }

      const data = await response.json();
      return data.data.trends;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchCourseCompletionRates = createAsyncThunk(
  "analytics/fetchCourseCompletionRates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/course-completion`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch course completion rates");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchVideoEngagement = createAsyncThunk(
  "analytics/fetchVideoEngagement",
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/video-engagement?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch video engagement metrics");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchExamPerformance = createAsyncThunk(
  "analytics/fetchExamPerformance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/exam-performance`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam performance metrics");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchStudentProgress = createAsyncThunk(
  "analytics/fetchStudentProgress",
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/student-progress?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student progress data");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchGeographicDistribution = createAsyncThunk(
  "analytics/fetchGeographicDistribution",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/geographic-distribution`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch geographic distribution");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchReferralStats = createAsyncThunk(
  "analytics/fetchReferralStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/referral-stats`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch referral statistics");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Slice
const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAnalytics: (state) => {
      state.dashboard = null;
      state.enrollmentTrends = [];
      state.courseCompletionRates = [];
      state.videoEngagementMetrics = [];
      state.examPerformanceMetrics = [];
      state.studentProgressData = [];
      state.geographicDistribution = [];
      state.referralStats = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch analytics dashboard
      .addCase(fetchAnalyticsDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
        state.enrollmentTrends = action.payload.enrollmentTrends;
        state.courseCompletionRates = action.payload.courseCompletionRates;
        state.videoEngagementMetrics = action.payload.videoEngagementMetrics;
        state.examPerformanceMetrics = action.payload.examPerformanceMetrics;
        state.studentProgressData = action.payload.studentProgressData;
        state.geographicDistribution = action.payload.geographicDistribution;
        state.referralStats = action.payload.referralStats;
      })
      .addCase(fetchAnalyticsDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch enrollment trends
      .addCase(fetchEnrollmentTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollmentTrends = action.payload;
      })
      .addCase(fetchEnrollmentTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch course completion rates
      .addCase(fetchCourseCompletionRates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseCompletionRates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courseCompletionRates = action.payload;
      })
      .addCase(fetchCourseCompletionRates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch video engagement metrics
      .addCase(fetchVideoEngagement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoEngagement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videoEngagementMetrics = action.payload;
      })
      .addCase(fetchVideoEngagement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch exam performance metrics
      .addCase(fetchExamPerformance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamPerformance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.examPerformanceMetrics = action.payload;
      })
      .addCase(fetchExamPerformance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch student progress data
      .addCase(fetchStudentProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentProgressData = action.payload;
      })
      .addCase(fetchStudentProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch geographic distribution
      .addCase(fetchGeographicDistribution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGeographicDistribution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.geographicDistribution = action.payload;
      })
      .addCase(fetchGeographicDistribution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch referral stats
      .addCase(fetchReferralStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReferralStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.referralStats = action.payload;
      })
      .addCase(fetchReferralStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectDashboard = (state: RootState) => state.analytics.dashboard;
export const selectEnrollmentTrends = (state: RootState) =>
  state.analytics.enrollmentTrends;
export const selectCourseCompletionRates = (state: RootState) =>
  state.analytics.courseCompletionRates;
export const selectVideoEngagementMetrics = (state: RootState) =>
  state.analytics.videoEngagementMetrics;
export const selectExamPerformanceMetrics = (state: RootState) =>
  state.analytics.examPerformanceMetrics;
export const selectStudentProgressData = (state: RootState) =>
  state.analytics.studentProgressData;
export const selectGeographicDistribution = (state: RootState) =>
  state.analytics.geographicDistribution;
export const selectReferralStats = (state: RootState) =>
  state.analytics.referralStats;
export const selectIsLoading = (state: RootState) => state.analytics.isLoading;
export const selectError = (state: RootState) => state.analytics.error;

// Actions
export const { clearError, resetAnalytics } = analyticsSlice.actions;

export default analyticsSlice.reducer;
