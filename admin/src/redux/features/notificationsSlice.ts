import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/utils/auth";

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(
        `${apiUrl}/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch notifications");
      }

      const data = await response.json();
      return { data: data.data, page };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(
        `${apiUrl}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to mark notification as read"
        );
      }

      const data = await response.json();
      return { id: notificationId, data: data.data };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllNotificationsAsRead",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to mark all notifications as read"
        );
      }

      const data = await response.json();

      // Refresh the notifications after marking all as read
      dispatch(fetchNotifications({ page: 1 }));

      return data.data;
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

        // Update the state with notifications
        state.items = action.payload.data.notifications;
        state.pagination = {
          currentPage: page,
          totalPages: action.payload.data.pagination.totalPages,
          totalItems: action.payload.data.pagination.totalItems,
          pageSize: action.payload.data.pagination.pageSize,
        };

        // Update unread count
        state.unreadCount = action.payload.data.notifications.filter(
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
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
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
