import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface AnnouncementImage {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export interface AnnouncementFile {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

export interface AnnouncementVideo {
  id: string;
  vimeoId: string;
  embedUrl: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string; // Legacy field for backward compatibility
  isActive: boolean;
  createdBy: {
    id: string;
    fullName: string;
  };
  images: AnnouncementImage[];
  files: AnnouncementFile[];
  videos: AnnouncementVideo[];
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementsState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: AnnouncementsState = {
  announcements: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Fetch active announcements for students
export const fetchActiveAnnouncements = createAsyncThunk(
  "announcements/fetchActiveAnnouncements",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const lastFetched = state.announcements.lastFetched;
      const now = Date.now();

      // If we have data and it's less than 5 minutes old, don't fetch again
      if (lastFetched && now - lastFetched < 5 * 60 * 1000) {
        return state.announcements.announcements;
      }

      const response = await fetch(`${BASE_URL}/announcements/active`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Failed to fetch announcements";
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return data.data as Announcement[];
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
  },
  extraReducers: (builder) => {
    // Fetch active announcements
    builder
      .addCase(fetchActiveAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchActiveAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = announcementsSlice.actions;

// Selectors
export const selectAnnouncements = (state: RootState) =>
  state.announcements.announcements;
export const selectAnnouncementsLoading = (state: RootState) =>
  state.announcements.loading;
export const selectAnnouncementsError = (state: RootState) =>
  state.announcements.error;
export const selectShouldFetchAnnouncements = (state: RootState) => {
  const { lastFetched, announcements } = state.announcements;
  const { user } = state.user;
  const now = Date.now();

  // If user is not authenticated, don't fetch
  if (!user) return false;

  // If we have no data, we should fetch
  if (announcements.length === 0) return true;

  // If we have data but it's older than 5 minutes, we should fetch
  if (lastFetched && now - lastFetched > 5 * 60 * 1000) return true;

  return false;
};

export default announcementsSlice.reducer;
