import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "@/lib/api";

// Types
export interface Application {
  applicationId: string;
  email: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  country: string;
  academicQualification: string;
  desiredDegree: string;
  certificateUrl: string | null;
  recommendationLetterUrl: string | null;
  referredBy: string | null;
  referrerContact: string | null;
  agreesToTerms: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  appliedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  studentId: string | null;
  adminId: string | null;
  reviewedBy?: { fullName: string } | string;
}

export interface Pagination {
  current: number;
  limit: number;
  total: number;
  totalRecords: number;
}

interface ApplicationsState {
  applications: Application[];
  selectedApplication: Application | null;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  applications: [],
  selectedApplication: null,
  pagination: {
    current: 1,
    limit: 10,
    total: 0,
    totalRecords: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchApplications = createAsyncThunk(
  "applications/fetchApplications",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get<{
        applications: Application[];
        pagination: Pagination;
      }>(`/applications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchApplicationById = createAsyncThunk(
  "applications/fetchApplicationById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Application>(`/applications/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  "applications/updateApplicationStatus",
  async (
    {
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED" | "PENDING";
      rejectionReason?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload: { status: string; rejectionReason?: string } = { status };

      if (status === "REJECTED" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

          const response = await api.patch<Application>(
        `/applications/update-status/${id}`,
        payload
      );

      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteApplication = createAsyncThunk(
  "applications/deleteApplication",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete<Application>(`/applications/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Slice
const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    setSelectedApplication: (
      state,
      action: PayloadAction<Application | null>
    ) => {
      state.selectedApplication = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch applications
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload?.applications || [];
        state.pagination = action.payload?.pagination || initialState.pagination;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch application by ID
      .addCase(fetchApplicationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedApplication = action.payload || null;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update application status
      .addCase(updateApplicationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update the application in the list
        const index = state.applications.findIndex(
          (app) => app.applicationId === action.payload?.applicationId
        );

        if (index !== -1) {
          state.applications[index] = {
            ...state.applications[index],
            status: action.payload?.status as "APPROVED" | "REJECTED" | "PENDING",
            rejectionReason: action.payload?.rejectionReason || null,
            reviewedAt: new Date().toISOString(),
          };
        }

        // Update selected application if it's the one being updated
        if (state.selectedApplication?.applicationId === action.payload?.applicationId) {
          state.selectedApplication = {
            ...state.selectedApplication,
            status: action.payload?.status as
              | "APPROVED"
              | "REJECTED"
              | "PENDING",
            rejectionReason: action.payload?.rejectionReason || null,
            reviewedAt: new Date().toISOString(),
          } as Application;
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete application
      .addCase(deleteApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = state.applications.filter(
          (app) => app.applicationId !== action.payload?.applicationId
        );

        if (state.selectedApplication?.applicationId === action.payload?.applicationId) { 
          state.selectedApplication = null;
        }
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectApplications = (state: RootState) =>
  state.applications.applications;
export const selectPagination = (state: RootState) =>
  state.applications.pagination;
export const selectSelectedApplication = (state: RootState) =>
  state.applications.selectedApplication;
export const selectIsLoading = (state: RootState) =>
  state.applications.isLoading;
export const selectError = (state: RootState) => state.applications.error;

// Actions
export const { setSelectedApplication, setLimit, clearError } =
  applicationsSlice.actions;

export default applicationsSlice.reducer;
