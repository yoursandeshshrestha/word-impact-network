import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "@/lib/api";

// Dashboard statistics types
export interface DashboardStats {
  counts: {
    students: number;
    courses: number;
    chapters: number;
    videos: number;
    exams: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  payments: {
    studentsWithPendingPayment: number;
    totalPayments: number;
    totalRevenue: number;
  };
  recentActivity: {
    newStudents: {
      id: string;
      name: string;
      email: string;
      registeredAt: string;
    }[];
    newApplications: {
      id: string;
      name: string;
      email: string;
      status: string;
      appliedAt: string;
    }[];
  };
  courseStats: {
    popularCourses: {
      courseId: string;
      courseTitle: string;
      enrollmentCount: number;
    }[];
  };
  videoStats: {
    popularVideos: {
      videoId: string;
      videoTitle: string;
      chapterTitle: string;
      courseTitle: string;
      watchCount: number;
    }[];
  };
}

interface DashboardState {
  data: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: DashboardState = {
  data: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to fetch dashboard data
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<DashboardStats>(`/admin/dashboard`);

      // Check if this is an authentication error response
      if (
        response.status === "error" &&
        response.message.includes("Authentication failed")
      ) {
        // For auth errors, throw immediately to stop all retries
        throw new Error("Authentication failed - redirecting to login");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard statistics
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload || null;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectDashboardData = (state: RootState) => state.dashboard.data;
export const selectDashboardIsLoading = (state: RootState) =>
  state.dashboard.isLoading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectDashboardLastFetched = (state: RootState) =>
  state.dashboard.lastFetched;

// Actions
export const { clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
