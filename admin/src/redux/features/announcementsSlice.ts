import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "@/lib/api";
import { Announcement } from "@/types/announcement";

interface AnnouncementsState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  currentAnnouncement: Announcement | null;
}

const initialState: AnnouncementsState = {
  announcements: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10,
  },
  currentAnnouncement: null,
};

// Fetch all announcements
export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAnnouncements",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get<{
        announcements: Announcement[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          pageSize: number;
        };
      }>(`/announcements?page=${page}&limit=${limit}`);
      return response.data as {
        announcements: Announcement[];
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

// Create announcement
export const createAnnouncement = createAsyncThunk(
  "announcements/createAnnouncement",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.upload<Announcement>(
        "/announcements",
        formData
      );
      return response.data as Announcement;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Update announcement
export const updateAnnouncement = createAsyncThunk(
  "announcements/updateAnnouncement",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.uploadWithMethod(`/announcements/${id}`, formData, "PUT");
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Delete announcement
export const deleteAnnouncement = createAsyncThunk(
  "announcements/deleteAnnouncement",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/announcements/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Toggle announcement status
export const toggleAnnouncementStatus = createAsyncThunk(
  "announcements/toggleAnnouncementStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/announcements/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const announcementsSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAnnouncement: (
      state,
      action: PayloadAction<Announcement | null>
    ) => {
      state.currentAnnouncement = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch announcements
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload.announcements;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create announcement
    builder
      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update announcement
    builder
      .addCase(updateAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as Announcement;
        const index = state.announcements.findIndex(
          (announcement) => announcement.id === payload.id
        );
        if (index !== -1) {
          state.announcements[index] = payload;
        }
        if (state.currentAnnouncement?.id === payload.id) {
          state.currentAnnouncement = payload;
        }
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete announcement
    builder
      .addCase(deleteAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = state.announcements.filter(
          (announcement) => announcement.id !== action.payload
        );
        state.pagination.totalItems -= 1;
        if (state.currentAnnouncement?.id === action.payload) {
          state.currentAnnouncement = null;
        }
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle announcement status
    builder
      .addCase(toggleAnnouncementStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleAnnouncementStatus.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as Announcement;
        const index = state.announcements.findIndex(
          (announcement) => announcement.id === payload.id
        );
        if (index !== -1) {
          state.announcements[index] = payload;
        }
        if (state.currentAnnouncement?.id === payload.id) {
          state.currentAnnouncement = payload;
        }
      })
      .addCase(toggleAnnouncementStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentAnnouncement } =
  announcementsSlice.actions;

export const selectAnnouncements = (state: RootState) =>
  state.announcements.announcements;
export const selectAnnouncementsLoading = (state: RootState) =>
  state.announcements.loading;
export const selectAnnouncementsError = (state: RootState) =>
  state.announcements.error;
export const selectAnnouncementsPagination = (state: RootState) =>
  state.announcements.pagination;
export const selectCurrentAnnouncement = (state: RootState) =>
  state.announcements.currentAnnouncement;

export default announcementsSlice.reducer;
