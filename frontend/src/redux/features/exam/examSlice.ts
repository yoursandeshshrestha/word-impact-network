import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

// Types
export interface ExamQuestion {
  id: string;
  text: string;
  questionType: string;
  options: string[];
  points: number;
}

export interface ExamAttempt {
  id: string;
  startTime: string;
  endTime: string;
  score: number;
  isPassed: boolean;
}

export interface ExamData {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number;
  totalQuestions: number;
  totalPoints: number;
  isLocked: boolean;
}

export interface ExamProgress {
  videosCompleted: number;
  totalVideos: number;
  allVideosCompleted: boolean;
  canTakeExam: boolean;
  hasPassed: boolean;
  bestScore: number;
}

export interface ExamState {
  examData: {
    exam: ExamData | null;
    chapter: {
      id: string;
      title: string;
    } | null;
    progress: ExamProgress | null;
    attempts: ExamAttempt[];
    canStartExam: boolean;
  } | null;
  currentAttempt: {
    attemptId: string;
    examId: string;
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    totalQuestions: number;
    totalPoints: number;
    questions: ExamQuestion[];
    startTime: string;
    endTime: string;
  } | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const initialState: ExamState = {
  examData: null,
  currentAttempt: null,
  status: "idle",
  error: null,
};

// Async thunks
export const fetchExamData = createAsyncThunk(
  "exam/fetchExamData",
  async (
    {
      courseId,
      chapterId,
      examId,
    }: { courseId: string; chapterId: string; examId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}/exams/${examId}`,
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
        const errorMessage = errorData.message || "Failed to fetch exam data";

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(errorMessage);
        }

        return rejectWithValue(errorMessage);
      }

      const data = await response.json();

      // Debug logging
      console.log("Exam Data Response:", {
        exam: data.data.exam,
        progress: data.data.progress,
        canStartExam: data.data.canStartExam,
        videosCompleted: data.data.progress?.videosCompleted,
        totalVideos: data.data.progress?.totalVideos,
        allVideosCompleted: data.data.progress?.allVideosCompleted,
      });

      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch exam data";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const startExam = createAsyncThunk(
  "exam/startExam",
  async (
    {
      courseId,
      chapterId,
      examId,
    }: { courseId: string; chapterId: string; examId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}/exams/${examId}/start`,
        {
          method: "POST",
          credentials: "include", // This will automatically send cookies
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to start exam";

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(errorMessage);
        }

        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      toast.success("Exam started successfully");
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start exam";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const submitExam = createAsyncThunk(
  "exam/submitExam",
  async (
    {
      courseId,
      chapterId,
      examId,
      attemptId,
      answers,
    }: {
      courseId: string;
      chapterId: string;
      examId: string;
      attemptId: string;
      answers: { questionId: string; answer: string }[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}/exams/${examId}/attempts/${attemptId}/submit`,
        {
          method: "POST",
          credentials: "include", // This will automatically send cookies
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to submit exam";

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(errorMessage);
        }

        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      toast.success("Exam submitted successfully");
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit exam";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    clearExam: (state) => {
      state.examData = null;
      state.currentAttempt = null;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Exam Data
      .addCase(fetchExamData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExamData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.examData = action.payload;
        state.error = null;

        // Debug logging
        console.log("Exam State Updated:", {
          exam: state.examData?.exam,
          progress: state.examData?.progress,
          canStartExam: state.examData?.canStartExam,
          videosCompleted: state.examData?.progress?.videosCompleted,
          totalVideos: state.examData?.progress?.totalVideos,
          allVideosCompleted: state.examData?.progress?.allVideosCompleted,
        });
      })
      .addCase(fetchExamData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Start Exam
      .addCase(startExam.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(startExam.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAttempt = action.payload;
        state.error = null;
      })
      .addCase(startExam.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Submit Exam
      .addCase(submitExam.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitExam.fulfilled, (state) => {
        state.status = "succeeded";
        state.currentAttempt = null;
        state.error = null;
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearExam } = examSlice.actions;
export default examSlice.reducer;
