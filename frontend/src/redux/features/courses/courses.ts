import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getAuthToken } from "@/common/services/auth";

interface ErrorResponse {
  message: string;
}

interface CreatedBy {
  fullName: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  coverImageUrl: string;
  isActive: boolean;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: CreatedBy;
}

interface CoursesState {
  courses: Course[];
  filteredCourses: Course[];
  searchQuery: string;
  selectedDuration: string;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080/api/v1";

export const fetchAllCourses = createAsyncThunk(
  "courses/fetchAllCourses",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${BASE_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data.data as Course[];
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to fetch courses";

      if ((error as AxiosError).response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const coursesSlice = createSlice({
  name: "courses",
  initialState: {
    courses: [],
    filteredCourses: [],
    searchQuery: "",
    selectedDuration: "all",
    status: "idle",
    error: null as string | null,
  } as CoursesState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.filteredCourses = filterCourses(
        state.courses,
        action.payload,
        state.selectedDuration
      );
    },
    setSelectedDuration: (state, action) => {
      state.selectedDuration = action.payload;
      state.filteredCourses = filterCourses(
        state.courses,
        state.searchQuery,
        action.payload
      );
    },
    clearFilters: (state) => {
      state.searchQuery = "";
      state.selectedDuration = "all";
      state.filteredCourses = state.courses;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courses = action.payload;
        state.filteredCourses = filterCourses(
          action.payload,
          state.searchQuery,
          state.selectedDuration
        );
        state.error = null;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Helper function to filter courses
function filterCourses(
  courses: Course[],
  searchQuery: string,
  selectedDuration: string
): Course[] {
  let filtered = courses;

  // Filter by search query
  if (searchQuery.trim()) {
    filtered = filtered.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.createdBy.fullName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }

  // Filter by duration
  if (selectedDuration !== "all") {
    filtered = filtered.filter(
      (course) => course.durationYears.toString() === selectedDuration
    );
  }

  return filtered;
}

export const { setSearchQuery, setSelectedDuration, clearFilters } =
  coursesSlice.actions;
export default coursesSlice.reducer;
