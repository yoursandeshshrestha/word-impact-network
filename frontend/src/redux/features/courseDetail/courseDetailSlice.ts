import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

export interface ChapterProgress {
  isCompleted: boolean;
  completedAt: string | null;
  videosCompleted: number;
  totalVideos: number;
  allVideosCompleted: boolean;
  hasExam: boolean;
  examPassed: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseYear: number;
  isLocked: boolean;
  lockReason?: string;
  progress: ChapterProgress;
}

export interface YearStructure {
  year: number;
  totalChapters: number;
  unlockedChapters: number;
  completedChapters: number;
  chapters: Chapter[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  coverImageUrl: string;
}

export interface OverallProgress {
  overallProgress: number;
  totalChapters: number;
  completedChapters: number;
  unlockedChapters: number;
}

export interface LockingRules {
  description: string;
  rules: string[];
}

export interface CourseDetailData {
  course: Course;
  progress: OverallProgress;
  yearStructure: YearStructure[];
  lockingRules: LockingRules;
}

export interface CourseDetailState {
  courseDetail: CourseDetailData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const fetchCourseDetail = createAsyncThunk(
  "courseDetail/fetchCourseDetail",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/mylearning/courses/${courseId}`,
        {
          method: "GET",
          credentials: "include", // This will automatically send cookies
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Failed to fetch course details";

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (response.status === 404) {
          toast.error("Course not found.");
        } else {
          toast.error(errorMessage);
        }

        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return data.data as CourseDetailData;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch course details";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const courseDetailSlice = createSlice({
  name: "courseDetail",
  initialState: {
    courseDetail: null,
    status: "idle",
    error: null as string | null,
  } as CourseDetailState,
  reducers: {
    clearCourseDetail: (state) => {
      state.courseDetail = null;
      state.error = null;
      state.status = "idle";
    },
    updateChapterProgress: (state, action) => {
      if (state.courseDetail) {
        const { chapterId, progress } = action.payload;

        // Find and update the chapter across all years
        for (const year of state.courseDetail.yearStructure) {
          const chapterIndex = year.chapters.findIndex(
            (ch) => ch.id === chapterId
          );
          if (chapterIndex !== -1) {
            year.chapters[chapterIndex].progress = {
              ...year.chapters[chapterIndex].progress,
              ...progress,
            };

            // Update year-level stats
            const completedInYear = year.chapters.filter(
              (ch) => ch.progress.isCompleted
            ).length;
            year.completedChapters = completedInYear;

            // Update overall progress
            const totalCompleted = state.courseDetail.yearStructure.reduce(
              (sum, y) => sum + y.completedChapters,
              0
            );
            state.courseDetail.progress.completedChapters = totalCompleted;
            state.courseDetail.progress.overallProgress = Math.round(
              (totalCompleted / state.courseDetail.progress.totalChapters) * 100
            );

            break;
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseDetail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCourseDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courseDetail = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseDetail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearCourseDetail, updateChapterProgress } =
  courseDetailSlice.actions;
export default courseDetailSlice.reducer;
