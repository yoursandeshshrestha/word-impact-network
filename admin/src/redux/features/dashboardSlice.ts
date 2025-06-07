import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/utils/auth";

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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch dashboard statistics";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
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
        state.data = action.payload;
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
