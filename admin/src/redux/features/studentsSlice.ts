import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/src/utils/auth";

// Types
export interface Student {
  id: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  email: string;
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface StudentsState {
  students: Student[];
  pagination: PaginationMeta;
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: StudentsState = {
  students: [],
  pagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  selectedStudent: null,
  isLoading: false,
  error: null,
  searchQuery: "",
};

// Async thunks
export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async (
    params: { search?: string; page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { search = "", page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams();

      if (search) queryParams.append("search", search);
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/admin/students?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to fetch students");
      }

      const data = await response.json();
      return {
        students: data.data.students,
        pagination: data.data.pagination,
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Slice
const studentsSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    setSelectedStudent: (state, action: PayloadAction<Student | null>) => {
      state.selectedStudent = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
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
      // Fetch students
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload.students;
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            total: action.payload.pagination.total,
            totalPages: action.payload.pagination.totalPages,
            currentPage: action.payload.pagination.currentPage,
            limit: action.payload.pagination.limit,
          };
        }
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectStudents = (state: RootState) => state.students.students;
export const selectSelectedStudent = (state: RootState) =>
  state.students.selectedStudent;
export const selectIsLoading = (state: RootState) => state.students.isLoading;
export const selectError = (state: RootState) => state.students.error;
export const selectSearchQuery = (state: RootState) =>
  state.students.searchQuery;
export const selectPagination = (state: RootState) => state.students.pagination;

// Actions
export const {
  setSelectedStudent,
  setSearchQuery,
  setPage,
  setLimit,
  clearError,
} = studentsSlice.actions;

export default studentsSlice.reducer;
