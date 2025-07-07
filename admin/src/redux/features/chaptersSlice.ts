import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "@/lib/api";
import { Question } from "./examsSlice";

export interface Video {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  passingScore?: number;
  timeLimit: number | null;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseYear: number;
  courseId: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    fullName: string;
  };
  course?: {
    title: string;
  };
  _count?: {
    videos: number;
  };
  videos?: Video[];
  exam?: Exam | null;
}

interface ChaptersState {
  chapters: Chapter[];
  chapter: Chapter | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string;
}

const initialState: ChaptersState = {
  chapters: [],
  chapter: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

// Create chapter
export const createChapter = createAsyncThunk(
  "chapters/createChapter",
  async (
    {
      courseId,
      chapterData,
    }: {
      courseId: string;
      chapterData: Omit<
        Chapter,
        | "id"
        | "adminId"
        | "courseId"
        | "createdAt"
        | "updatedAt"
        | "createdBy"
        | "course"
        | "_count"
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<Chapter>(
        `/courses/${courseId}/chapters`,
        chapterData
      );

      return response;
    } catch (error: unknown) {
      console.error("Error creating chapter:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create chapter"
      );
    }
  }
);

// Get all chapters for a course
export const getChaptersByCourse = createAsyncThunk(
  "chapters/getChaptersByCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Chapter[]>(
        `/courses/${courseId}/chapters`
      );

      return response;
    } catch (error: unknown) {
      console.error("Error fetching chapters:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch chapters"
      );
    }
  }
);

// Get chapter by ID
export const getChapterById = createAsyncThunk(
  "chapters/getChapterById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Chapter>(`/chapters/${id}`);

      return response;
    } catch (error: unknown) {
      console.error("Error fetching chapter:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch chapter"
      );
    }
  }
);

// Update chapter
export const updateChapter = createAsyncThunk(
  "chapters/updateChapter",
  async (
    { id, chapterData }: { id: string; chapterData: Partial<Chapter> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put<Chapter>(`/chapters/${id}`, chapterData);

      return response;
    } catch (error: unknown) {
      console.error("Error updating chapter:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update chapter"
      );
    }
  }
);

// Delete chapter
export const deleteChapter = createAsyncThunk(
  "chapters/deleteChapter",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete<{ id: string }>(`/chapters/${id}`);

      return response;
    } catch (error: unknown) {
      console.error("Error deleting chapter:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete chapter"
      );
    }
  }
);

const chaptersSlice = createSlice({
  name: "chapters",
  initialState,
  reducers: {
    resetChapterStatus: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
    },
    setChapter: (state, action: PayloadAction<Chapter | null>) => {
      state.chapter = action.payload;
    },
    clearChapters: (state) => {
      state.chapters = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create chapter
      .addCase(createChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "";
        if (action.payload.data) {
          state.chapters.push(action.payload.data);
        }
      })
      .addCase(createChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get all chapters for a course
      .addCase(getChaptersByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChaptersByCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters = action.payload.data || [];
      })
      .addCase(getChaptersByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get chapter by ID
      .addCase(getChapterById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChapterById.fulfilled, (state, action) => {
        state.loading = false;
        state.chapter = action.payload.data || null;
      })
      .addCase(getChapterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update chapter
      .addCase(updateChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "";
        state.chapters = state.chapters.map((chapter) =>
          chapter.id === action.payload.data?.id ? action.payload.data : chapter
        );
        state.chapter = action.payload.data || null;
      })
      .addCase(updateChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete chapter
      .addCase(deleteChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "";
        state.chapters = state.chapters.filter(
          (chapter) => chapter.id !== action.payload.data?.id
        );
      })
      .addCase(deleteChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectChapters = (state: RootState) => state.chapters.chapters;
export const selectChapter = (state: RootState) => state.chapters.chapter;
export const selectChaptersLoading = (state: RootState) =>
  state.chapters.loading;
export const selectChaptersError = (state: RootState) => state.chapters.error;
export const selectChaptersSuccess = (state: RootState) =>
  state.chapters.success;
export const selectChaptersMessage = (state: RootState) =>
  state.chapters.message;

export const { resetChapterStatus, setChapter, clearChapters } =
  chaptersSlice.actions;

export default chaptersSlice.reducer;
