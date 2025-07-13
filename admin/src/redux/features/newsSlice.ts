import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "@/lib/api";
import { News } from "@/types/news";

interface NewsState {
  news: News[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  currentNews: News | null;
}

const initialState: NewsState = {
  news: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10,
  },
  currentNews: null,
};

// Fetch all news
export const fetchNews = createAsyncThunk(
  "news/fetchNews",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get<{
        news: News[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          pageSize: number;
        };
      }>(`/news?page=${page}&limit=${limit}`);
      return response.data as {
        news: News[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          pageSize: number;
        };
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Create news
export const createNews = createAsyncThunk(
  "news/createNews",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.upload<News>("/news", formData);
      return response.data as News;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Update news
export const updateNews = createAsyncThunk(
  "news/updateNews",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.uploadWithMethod(
        `/news/${id}`,
        formData,
        "PUT"
      );
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Delete news
export const deleteNews = createAsyncThunk(
  "news/deleteNews",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/news/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Toggle news status
export const toggleNewsStatus = createAsyncThunk(
  "news/toggleNewsStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/news/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentNews: (state, action: PayloadAction<News | null>) => {
      state.currentNews = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch news
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload.news;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create news
    builder
      .addCase(createNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update news
    builder
      .addCase(updateNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as News;
        const index = state.news.findIndex((news) => news.id === payload.id);
        if (index !== -1) {
          state.news[index] = payload;
        }
        if (state.currentNews?.id === payload.id) {
          state.currentNews = payload;
        }
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete news
    builder
      .addCase(deleteNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = state.news.filter((news) => news.id !== action.payload);
        state.pagination.totalItems -= 1;
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle news status
    builder
      .addCase(toggleNewsStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleNewsStatus.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as News;
        const index = state.news.findIndex((news) => news.id === payload.id);
        if (index !== -1) {
          state.news[index] = payload;
        }
        if (state.currentNews?.id === payload.id) {
          state.currentNews = payload;
        }
      })
      .addCase(toggleNewsStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentNews } = newsSlice.actions;

// Selectors
export const selectNews = (state: RootState) => state.news.news;

export const selectNewsLoading = (state: RootState) => state.news.loading;

export const selectNewsError = (state: RootState) => state.news.error;

export const selectNewsPagination = (state: RootState) => state.news.pagination;

export const selectCurrentNews = (state: RootState) => state.news.currentNews;

export default newsSlice.reducer;
