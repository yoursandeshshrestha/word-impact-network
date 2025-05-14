import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/utils/auth";

export interface Option {
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  questionType: string;
  options: Option[] | null;
  correctAnswer: string | null;
  points: number;
  examId: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionApiPayload {
  text: string;
  questionType: string;
  options: string[] | null;
  correctAnswer: string | null;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null; // in minutes
  chapterId: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

// Define a new type for posting questions
export interface NewQuestion {
  text: string;
  questionType: string;
  options: Option[] | null;
  correctAnswer: string | null;
  points: number;
}

interface ExamsState {
  exams: Exam[];
  exam: Exam | null;
  questions: Question[];
  question: Question | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string;
}

const initialState: ExamsState = {
  exams: [],
  exam: null,
  questions: [],
  question: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

// Create exam for chapter
export const createExam = createAsyncThunk(
  "exams/createExam",
  async (
    {
      chapterId,
      examData,
    }: {
      chapterId: string;
      examData: Omit<
        Exam,
        "id" | "adminId" | "chapterId" | "createdAt" | "updatedAt"
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/exams/chapters/${chapterId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create exam");
      }

      return data;
    } catch (error: unknown) {
      console.error("Error creating exam:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create exam"
      );
    }
  }
);

// Get exam by ID
export const getExamById = createAsyncThunk(
  "exams/getExamById",
  async (id: string, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/exams/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch exam");
      }

      return data;
    } catch (error: unknown) {
      console.error("Error fetching exam:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch exam"
      );
    }
  }
);

// Update exam
export const updateExam = createAsyncThunk(
  "exams/updateExam",
  async (
    { id, examData }: { id: string; examData: Partial<Exam> },
    { rejectWithValue }
  ) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/exams/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update exam");
      }

      return data;
    } catch (error: unknown) {
      console.error("Error updating exam:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update exam"
      );
    }
  }
);

// Delete exam
export const deleteExam = createAsyncThunk(
  "exams/deleteExam",
  async (id: string, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/exams/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete exam");
      }

      return { ...data, id };
    } catch (error: unknown) {
      console.error("Error deleting exam:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete exam"
      );
    }
  }
);

// Add question to exam - Fixed version
export const addQuestion = createAsyncThunk(
  "exams/addQuestion",
  async (
    {
      examId,
      questionData,
    }: {
      examId: string;
      questionData: NewQuestion;
    },
    { rejectWithValue }
  ) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      // Create a clean payload with only the fields expected by the API
      const cleanPayload: QuestionApiPayload = {
        text: questionData.text,
        questionType: questionData.questionType,
        options:
          questionData.options === null
            ? null
            : questionData.options.map((option) => option.text),
        correctAnswer: questionData.correctAnswer,
        points: questionData.points,
      };

      console.log("Clean API payload:", cleanPayload);

      const response = await fetch(`${apiUrl}/exams/${examId}/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to add question");
      }

      return data;
    } catch (error: unknown) {
      console.error("Error adding question:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to add question"
      );
    }
  }
);

// Similarly update the updateQuestion thunk
export const updateQuestion = createAsyncThunk(
  "exams/updateQuestion",
  async (
    {
      examId,
      questionId,
      questionData,
    }: {
      examId: string;
      questionId: string;
      questionData: Partial<NewQuestion>;
    },
    { rejectWithValue }
  ) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      // Create a clean payload with only the fields expected by the API
      const cleanPayload: Partial<QuestionApiPayload> = {};

      if (questionData.text !== undefined)
        cleanPayload.text = questionData.text;
      if (questionData.questionType !== undefined)
        cleanPayload.questionType = questionData.questionType;
      if (questionData.points !== undefined)
        cleanPayload.points = questionData.points;
      if (questionData.correctAnswer !== undefined)
        cleanPayload.correctAnswer = questionData.correctAnswer;

      // Handle options field specially
      if (questionData.options !== undefined) {
        cleanPayload.options =
          questionData.options === null
            ? null
            : questionData.options.map((option) => option.text);
      }

      console.log("Clean update payload:", cleanPayload);

      const response = await fetch(
        `${apiUrl}/exams/${examId}/questions/${questionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanPayload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update question");
      }

      return data;
    } catch (error: unknown) {
      console.error("Error updating question:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update question"
      );
    }
  }
);

// Delete question
export const deleteQuestion = createAsyncThunk(
  "exams/deleteQuestion",
  async (
    { examId, questionId }: { examId: string; questionId: string },
    { rejectWithValue }
  ) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(
        `${apiUrl}/exams/${examId}/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete question");
      }

      return { ...data, questionId };
    } catch (error: unknown) {
      console.error("Error deleting question:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete question"
      );
    }
  }
);

const examsSlice = createSlice({
  name: "exams",
  initialState,
  reducers: {
    resetExamStatus: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
    },
    setExam: (state, action: PayloadAction<Exam | null>) => {
      state.exam = action.payload;
    },
    setQuestion: (state, action: PayloadAction<Question | null>) => {
      state.question = action.payload;
    },
    clearExam: (state) => {
      state.exam = null;
      state.questions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create exam
      .addCase(createExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.exam = action.payload.data;
        state.exams.push(action.payload.data);
      })
      .addCase(createExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get exam by ID
      .addCase(getExamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExamById.fulfilled, (state, action) => {
        state.loading = false;
        state.exam = action.payload.data;
        state.questions = action.payload.data.questions || [];
      })
      .addCase(getExamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update exam
      .addCase(updateExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.exam = action.payload.data;
        state.exams = state.exams.map((exam) =>
          exam.id === action.payload.data.id ? action.payload.data : exam
        );
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete exam
      .addCase(deleteExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.exams = state.exams.filter(
          (exam) => exam.id !== action.payload.id
        );
        if (state.exam?.id === action.payload.id) {
          state.exam = null;
          state.questions = [];
        }
      })
      .addCase(deleteExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add question to exam
      .addCase(addQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.questions.push(action.payload.data);
        // Update the questions array in the exam if it exists
        if (state.exam && state.exam.questions) {
          state.exam.questions.push(action.payload.data);
        }
      })
      .addCase(addQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update question
      .addCase(updateQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.questions = state.questions.map((question) =>
          question.id === action.payload.data.id
            ? action.payload.data
            : question
        );
        // Update the question in the exam's questions array if it exists
        if (state.exam && state.exam.questions) {
          state.exam.questions = state.exam.questions.map((question) =>
            question.id === action.payload.data.id
              ? action.payload.data
              : question
          );
        }
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete question
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.questions = state.questions.filter(
          (question) => question.id !== action.payload.questionId
        );
        // Remove the question from the exam's questions array if it exists
        if (state.exam && state.exam.questions) {
          state.exam.questions = state.exam.questions.filter(
            (question) => question.id !== action.payload.questionId
          );
        }
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectExams = (state: RootState) => state.exams.exams;
export const selectExam = (state: RootState) => state.exams.exam;
export const selectQuestions = (state: RootState) => state.exams.questions;
export const selectQuestion = (state: RootState) => state.exams.question;
export const selectExamsLoading = (state: RootState) => state.exams.loading;
export const selectExamsError = (state: RootState) => state.exams.error;
export const selectExamsSuccess = (state: RootState) => state.exams.success;
export const selectExamsMessage = (state: RootState) => state.exams.message;

export const { resetExamStatus, setExam, setQuestion, clearExam } =
  examsSlice.actions;

export default examsSlice.reducer;
