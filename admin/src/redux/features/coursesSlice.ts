import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "@/lib/api";
import { setLoading } from "./loadingSlice";
import { Chapter } from "./chaptersSlice";

export interface Course {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  coverImageUrl: string | null;
  isActive: boolean;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    fullName: string;
  };
  chapters?: Chapter[];
}

interface CoursesState {
  courses: Course[];
  course: Course | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string;
}

const initialState: CoursesState = {
  courses: [],
  course: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

// Create course
export const createCourse = createAsyncThunk(
  "courses/createCourse",
  async (courseData: FormData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.upload<Course>(`/courses`, courseData);

      return response;
    } catch (error: unknown) {
      console.error("Error creating course:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create course"
      );
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get all courses
export const getCourses = createAsyncThunk(
  "courses/getCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Course[]>(`/courses`);

      return response;
    } catch (error: unknown) {
      console.error("Error fetching courses:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch courses"
      );
    }
  }
);

// Get course by ID
export const getCourseById = createAsyncThunk(
  "courses/getCourseById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Course>(`/courses/${id}`);

      return response;
    } catch (error: unknown) {
      console.error("Error fetching course:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch course"
      );
    }
  }
);

// Update course
export const updateCourse = createAsyncThunk(
  "courses/updateCourse",
  async (
    { id, courseData }: { id: string; courseData: FormData },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await api.uploadWithMethod<Course>(`/courses/${id}`, courseData, "PUT");

      return response;
    } catch (error: unknown) {
      console.error("Error updating course:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update course"
      );
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete course
export const deleteCourse = createAsyncThunk(
  "courses/deleteCourse",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete<{ id: string }>(`/courses/${id}`);

      return response;
    } catch (error: unknown) {
      console.error("Error deleting course:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete course"
      );
    }
  }
);

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    resetCourseStatus: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
    },
    setCourse: (state, action: PayloadAction<Course | null>) => {
      state.course = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "";
        if (action.payload.data) {
          state.courses.push(action.payload.data);
        }
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get all courses
      .addCase(getCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data || [];
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get course by ID
      .addCase(getCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.course = action.payload.data || null;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "";
        state.courses = state.courses.map((course) =>
          course.id === action.payload.data?.id ? action.payload.data : course
        );
        state.course = action.payload.data || null;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "";
        state.courses = state.courses.filter(
          (course) => course.id !== action.payload.data?.id
        );
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectCourses = (state: RootState) => state.courses.courses;
export const selectCourse = (state: RootState) => state.courses.course;
export const selectCoursesLoading = (state: RootState) => state.courses.loading;
export const selectCoursesError = (state: RootState) => state.courses.error;
export const selectCoursesSuccess = (state: RootState) => state.courses.success;
export const selectCoursesMessage = (state: RootState) => state.courses.message;

export const { resetCourseStatus, setCourse } = coursesSlice.actions;

export default coursesSlice.reducer;
