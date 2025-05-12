import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/utils/auth";

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchApplicationById = createAsyncThunk(
  "applications/fetchApplicationById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch application");
      }

      const data = await response.json();
      return data.data.application;
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/update-status/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      const data = await response.json();
      return { id, ...data.data.application };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteApplication = createAsyncThunk(
  "applications/deleteApplication",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      return id;
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
        state.applications = action.payload.applications;
        state.pagination = action.payload.pagination;
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
        state.selectedApplication = action.payload;
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
          (app) => app.applicationId === action.payload.id
        );

        if (index !== -1) {
          state.applications[index] = {
            ...state.applications[index],
            status: action.payload.status,
            rejectionReason: action.payload.rejectionReason || null,
            reviewedAt: new Date().toISOString(),
          };
        }

        // Update selected application if it's the one being updated
        if (state.selectedApplication?.applicationId === action.payload.id) {
          state.selectedApplication = {
            ...state.selectedApplication,
            status: action.payload.status as
              | "APPROVED"
              | "REJECTED"
              | "PENDING",
            rejectionReason: action.payload.rejectionReason || null,
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
          (app) => app.applicationId !== action.payload
        );

        if (state.selectedApplication?.applicationId === action.payload) {
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
