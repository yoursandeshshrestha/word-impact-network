import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { withAuth } from "@/common/services/auth";

interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  isFromStudent: boolean;
  sender: User;
}

interface AdminConversation {
  admin: User;
  messages: Message[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

interface MessagesState {
  adminConversation: AdminConversation | null;
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  adminConversation: null,
  loading: false,
  error: null,
};

// Async thunks
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (content: string) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/messages`,
      { content },
      {
        headers: withAuth() as Record<string, string>,
      }
    );
    return response.data;
  }
);

export const getAdminConversation = createAsyncThunk(
  "messages/getAdminConversation",
  async (page: number = 1) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/messages/admin-conversation?page=${page}`,
      {
        headers: withAuth() as Record<string, string>,
      }
    );
    return response.data.data;
  }
);

export const markConversationAsRead = createAsyncThunk(
  "messages/markConversationAsRead",
  async (partnerId: string) => {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/messages/conversations/${partnerId}/read`,
      {},
      {
        headers: withAuth() as Record<string, string>,
      }
    );
    return response.data.data;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.adminConversation = null;
      state.error = null;
    },
    prependMessages: (state, action) => {
      if (state.adminConversation) {
        state.adminConversation.messages = [
          ...action.payload,
          ...state.adminConversation.messages,
        ];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (state.adminConversation) {
          const newMessage = {
            ...action.payload,
            isFromStudent: true,
          };
          state.adminConversation.messages.push(newMessage);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to send message";
      })
      // Get Admin Conversation
      .addCase(getAdminConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminConversation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.pagination.currentPage === 1) {
          state.adminConversation = action.payload;
        } else if (state.adminConversation) {
          // Prepend older messages
          state.adminConversation.messages = [
            ...action.payload.messages,
            ...state.adminConversation.messages,
          ];
          // Update pagination info
          state.adminConversation.pagination = action.payload.pagination;
        }
      })
      .addCase(getAdminConversation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch admin conversation";
      })
      // Mark Conversation as Read
      .addCase(markConversationAsRead.fulfilled, (state) => {
        if (state.adminConversation) {
          state.adminConversation.messages =
            state.adminConversation.messages.map((message) => ({
              ...message,
              read: true,
            }));
        }
      });
  },
});

export const { clearMessages, prependMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
