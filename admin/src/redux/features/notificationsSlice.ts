import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "@/lib/api";
import { PaginationMeta } from "./studentsSlice";

// Types
export interface Notification {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

// Initial state
const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (
    {
      page = 1,
      limit = 10,
      unreadOnly = false,
    }: { page?: number; limit?: number; unreadOnly?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get<{
        notifications: Notification[];
        pagination: PaginationMeta;
      }>(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);



      if (!response.data) {
        throw new Error("Failed to fetch notifications - no response data");
      }

      // Check if the expected structure exists
      if (!response.data.notifications) {
        throw new Error(
          "Invalid response structure - missing notifications property"
        );
      }

      const result = { data: response.data, page };
      return result;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await api.put<{ notification: Notification }>(
        `/notifications/${notificationId}/read`
      );

      if (!response.data) {
        throw new Error(
          "Failed to mark notification as read - no response data"
        );
      }

      // Check if the expected structure exists
      if (!response.data.notification) {
        throw new Error(
          "Invalid response structure - missing notification data"
        );
      }

      return { id: notificationId, data: response.data.notification };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllNotificationsAsRead",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put<{ markedAsRead: number }>(
        `/notifications/read-all`
      );

      if (!response.data) {
        throw new Error(
          "Failed to mark all notifications as read - no response data"
        );
      }

      // Check if the expected structure exists
      if (typeof response.data.markedAsRead !== "number") {
        throw new Error(
          "Invalid response structure - missing markedAsRead property"
        );
      }

      // Refresh the notifications after marking all as read
      dispatch(fetchNotifications({ page: 1 }));

      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Slice
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.error = null;
      state.pagination = initialState.pagination;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLocalUnreadCount: (state) => {
      // Recalculate unread count based on current items
      state.unreadCount = state.items.filter((item) => !item.isRead).length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;

        // Extract page parameter from the action meta
        const page = action.meta.arg?.page || 1;

        // Check if payload and data exist
        if (!action.payload || !action.payload.data) {
          state.error = "Invalid response structure";
          return;
        }

        // Safely access the data with fallbacks
        const notifications = action.payload.data.notifications || [];
        const pagination = action.payload.data.pagination || {
          totalPages: 1,
          total: 0,
          limit: 10,
        };

        // Update the state with notifications
        state.items = notifications;
        state.pagination = {
          currentPage: page,
          totalPages: pagination.totalPages,
          totalItems: pagination.total,
          pageSize: pagination.limit,
        };

        // Update unread count
        state.unreadCount = notifications.filter(
          (notification: Notification) => !notification.isRead
        ).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        // Don't set loading to true, to allow for optimistic updates
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        // Check if payload exists
        if (!action.payload) {
          state.error = "Invalid response structure";
          return;
        }

        // Update the notification in the list
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            isRead: true,
          };
        }

        // Recalculate unread count
        state.unreadCount = state.items.filter((item) => !item.isRead).length;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        // Don't set loading to true, to allow for optimistic updates
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        // Check if payload exists
        if (!action.payload) {
          state.error = "Invalid response structure";
          return;
        }

        // Mark all notifications as read in the current state
        state.items = state.items.map((item) => ({
          ...item,
          isRead: true,
        }));

        // Set unread count to 0
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectNotifications = (state: RootState) =>
  state.notifications.items;
export const selectUnreadCount = (state: RootState) =>
  state.notifications.unreadCount;
export const selectNotificationsLoading = (state: RootState) =>
  state.notifications.loading;
export const selectNotificationsError = (state: RootState) =>
  state.notifications.error;
export const selectNotificationsPagination = (state: RootState) =>
  state.notifications.pagination;

// Actions
export const {
  clearNotifications,
  setUnreadCount,
  clearError,
  updateLocalUnreadCount,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
