import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { getAuthToken } from "@/common/services/auth";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  createdBy: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementsState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

const initialState: AnnouncementsState = {
  announcements: [],
  loading: false,
  error: null,
};

// Fetch active announcements for students
export const fetchActiveAnnouncements = createAsyncThunk(
  "announcements/fetchActiveAnnouncements",
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API || "";
      const response = await fetch(`${apiUrl}/announcements/active`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch announcements");
      }

      const data = await response.json();
      return data.data;
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

export default announcementsSlice.reducer;
