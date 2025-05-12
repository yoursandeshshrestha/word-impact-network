import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/utils/auth";
import { toast } from "sonner";
import { setLoading } from "./loadingSlice";

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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: courseData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", data);
        const errorMessage =
          data?.message || data?.error || "Failed to create course";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success(data.message || "Course created successfully");
      return data;
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/courses`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch courses");
      }

      return data;
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch course");
      }

      return data;
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/courses/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: courseData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", data);
        const errorMessage =
          data?.message || data?.error || "Failed to update course";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success(data.message || "Course updated successfully");
      return data;
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete course");
      }

      return { ...data, id };
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
        state.message = action.payload.message;
        state.courses.push(action.payload.data);
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
        state.courses = action.payload.data;
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
        state.course = action.payload.data;
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
        state.message = action.payload.message;
        state.courses = state.courses.map((course) =>
          course.id === action.payload.data.id ? action.payload.data : course
        );
        state.course = action.payload.data;
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
        state.message = action.payload.message;
        state.courses = state.courses.filter(
          (course) => course.id !== action.payload.id
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
