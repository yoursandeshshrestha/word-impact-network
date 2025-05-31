import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getAuthToken } from "@/common/services/auth";

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

interface ErrorResponse {
  message: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080/api/v1";

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
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}/exams/${examId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Debug logging
      console.log("Exam Data Response:", {
        exam: response.data.data.exam,
        progress: response.data.data.progress,
        canStartExam: response.data.data.canStartExam,
        videosCompleted: response.data.data.progress?.videosCompleted,
        totalVideos: response.data.data.progress?.totalVideos,
        allVideosCompleted: response.data.data.progress?.allVideosCompleted,
      });

      return response.data.data;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to fetch exam data";

      if ((error as AxiosError).response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(errorMessage);
      }

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
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}/exams/${examId}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Exam started successfully");
      return response.data.data;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to start exam";

      if ((error as AxiosError).response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(errorMessage);
      }

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
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}/exams/${examId}/attempts/${attemptId}/submit`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Exam submitted successfully");
      return response.data.data;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to submit exam";

      if ((error as AxiosError).response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(errorMessage);
      }

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
