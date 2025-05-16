import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/utils/auth";

// Types
export interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: User;
  recipient: User;
  direction: "sent" | "received";
}

export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface MessageResponse {
  messages: Message[];
  pagination: PaginationInfo;
  unreadCount: number;
}

interface MessageState {
  messages: Message[];
  pagination: PaginationInfo | null;
  unreadCount: number;
  selectedStudent: User | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

const initialState: MessageState = {
  messages: [],
  pagination: null,
  unreadCount: 0,
  selectedStudent: null,
  isLoading: false,
  error: null,
  success: false,
  message: null,
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (
    params: { page?: number; filter?: string } = {},
    { rejectWithValue }
  ) => {
    const { page = 1, filter = "all" } = params;

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(
        `${apiUrl}/messages?page=${page}&filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to fetch messages";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data as MessageResponse;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (
    messageData: { recipientId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/messages/admin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to send message";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  "messages/markAsRead",
  async (messageId: string, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/messages/${messageId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to mark message as read";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { messageId, data };
    } catch (error) {
      console.error("Error marking message as read:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "messages/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch unread count";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data.unreadCount;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

// Message slice
const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },
    clearMessagesState: (state) => {
      state.success = false;
      state.error = null;
      state.message = null;
    },
    // Add reducers for real-time notifications
    addNewMessage: (state, action) => {
      state.messages.unshift(action.payload); // Add to beginning of array
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.pagination = action.payload.pagination;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = action.payload.message || "Message sent successfully";
        // Don't modify the messages array here - we'll fetch fresh messages
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Mark message as read
      .addCase(markMessageAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the read status in the messages array
        const messageIndex = state.messages.findIndex(
          (msg) => msg.id === action.payload.messageId
        );
        if (messageIndex !== -1) {
          state.messages[messageIndex].isRead = true;
          if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

// Selectors
export const selectMessages = (state: RootState) => state.messages.messages;
export const selectPagination = (state: RootState) => state.messages.pagination;
export const selectUnreadCount = (state: RootState) =>
  state.messages.unreadCount;
export const selectSelectedStudent = (state: RootState) =>
  state.messages.selectedStudent;
export const selectIsLoading = (state: RootState) => state.messages.isLoading;
export const selectError = (state: RootState) => state.messages.error;
export const selectSuccess = (state: RootState) => state.messages.success;
export const selectMessage = (state: RootState) => state.messages.message;

// Actions
export const {
  setSelectedStudent,
  clearSelectedStudent,
  clearMessagesState,
  addNewMessage,
  incrementUnreadCount,
  
} = messagesSlice.actions;

export default messagesSlice.reducer;
