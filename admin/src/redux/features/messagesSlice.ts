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
  isFromUser?: boolean; // For student-admin conversation
  direction?: "sent" | "received"; // For backward compatibility
}

export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface Conversation {
  partner: User;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isFromUser: boolean;
  } | null;
  unreadCount: number;
}

export interface MessageResponse {
  messages: Message[];
  pagination: PaginationInfo;
  unreadCount: number;
  conversations?: Conversation[];
}

export interface ConversationResponse {
  partner: User;
  messages: Message[];
  pagination: PaginationInfo;
}

interface MessageState {
  messages: Message[];
  conversations: Conversation[];
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
  conversations: [],
  pagination: null,
  unreadCount: 0,
  selectedStudent: null,
  isLoading: false,
  error: null,
  success: false,
  message: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch conversations";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchConversationMessages",
  async (
    params: { partnerId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    const { partnerId, page = 1, limit = 20 } = params;

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(
        `${apiUrl}/messages/conversations/${partnerId}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to fetch conversation messages";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return {
        data: data.data as ConversationResponse,
        partnerId,
      };
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
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
      return { data: data, recipientId: messageData.recipientId };
    } catch (error) {
      console.error("Error sending message:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  "messages/markConversationAsRead",
  async (partnerId: string, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      const response = await fetch(
        `${apiUrl}/messages/conversations/${partnerId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to mark conversation as read";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { partnerId, data: data.data };
    } catch (error) {
      console.error("Error marking conversation as read:", error);
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
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations;
        state.unreadCount = action.payload.totalUnreadCount || 0;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch conversation messages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.data.messages;
        state.pagination = action.payload.data.pagination;

        // Set selected student if it's not already set
        if (
          !state.selectedStudent ||
          state.selectedStudent.id !== action.payload.partnerId
        ) {
          state.selectedStudent = action.payload.data.partner;
        }
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
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
        state.message =
          action.payload.data.message || "Message sent successfully";

        // Update the conversation with this student if it exists
        const studentId = action.payload.recipientId;
        const conversationIndex = state.conversations.findIndex(
          (conv) => conv.partner.id === studentId
        );

        if (conversationIndex !== -1) {
          // Update the last message in the conversation
          state.conversations[conversationIndex].lastMessage = {
            id: action.payload.data.data?.id || "temp-id",
            content: action.payload.data.data?.content || "",
            createdAt: new Date().toISOString(),
            isFromUser: true,
          };
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Mark conversation as read
      .addCase(markConversationAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        // Update unread count for this conversation
        const conversationIndex = state.conversations.findIndex(
          (conv) => conv.partner.id === action.payload.partnerId
        );

        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 0;
        }

        // Update isRead flag for all messages from this student
        state.messages.forEach((msg) => {
          if (
            (msg.sender.id === action.payload.partnerId ||
              (msg.sender.role === "STUDENT" &&
                state.selectedStudent?.id === action.payload.partnerId)) &&
            !msg.isRead
          ) {
            msg.isRead = true;
          }
        });

        // Update global unread count
        if (
          action.payload.data.markedAsRead &&
          state.unreadCount >= action.payload.data.markedAsRead
        ) {
          state.unreadCount -= action.payload.data.markedAsRead;
        }
      })
      .addCase(markConversationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

// Selectors
export const selectMessages = (state: RootState) => state.messages.messages;
export const selectConversations = (state: RootState) =>
  state.messages.conversations;
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
