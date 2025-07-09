import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "@/lib/api";

// Types
interface CourseProgress {
  courseId: string;
  courseTitle: string;
  durationYears: number;
  enrollmentDate: string;
  progress: {
    chaptersCompleted: number;
    totalChapters: number;
    chapterCompletionPercentage: number;
    examsPassed: number;
    totalExams: number;
    examCompletionPercentage: number;
  };
}

interface StudentStatistics {
  coursesEnrolled: number;
  chaptersCompleted: number;
  totalChapters: number;
  overallChapterProgress: number;
  examsCompleted: number;
  examsPassed: number;
  totalExams: number;
  overallExamProgress: number;
  videosWatched: number;
  videosInProgress: number;
  certificationsEarned: number;
}

interface RecentExamAttempt {
  id: string;
  examTitle: string;
  chapterTitle: string;
  courseTitle: string;
  score: number;
  isPassed: boolean;
  startTime: string;
}

interface RecentVideoProgress {
  videoTitle: string;
  chapterTitle: string;
  courseTitle: string;
  watchedPercent: number;
  lastWatchedAt: string;
}

interface RecentActivity {
  recentExamAttempts: RecentExamAttempt[];
  recentVideoProgress: RecentVideoProgress[];
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
}

interface Payment {
  id: string;
  amount: string;
  status: string;
  paymentMethod: string;
  paidAt: string | null;
  paymentDueDate: string | null;
}

export interface Student {
  id: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  email: string;
  country: string;
  academicQualification: string;
  desiredDegree: string;
  applicationStatus: string;
  paymentStatus: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  statistics: StudentStatistics;
  courseProgress: CourseProgress[];
  recentActivity: RecentActivity;
  application: Application | null;
  payments: Payment[];
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

      const response = await api.get<{
        students: Student[];
        pagination: PaginationMeta;
      }>(`/admin/students?${queryParams.toString()}`);

      // Check if this is an authentication error response
      if (
        response.status === "error" &&
        response.message.includes("Authentication failed")
      ) {
        // For auth errors, throw immediately to stop all retries
        throw new Error("Authentication failed - redirecting to login");
      }

      return {
        students: response.data?.students || [],
        pagination: response.data?.pagination || {
          total: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 10,
        },
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
