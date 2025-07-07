import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

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
  messages: Message[];
  adminConversation: AdminConversation | null;
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  messages: [],
  adminConversation: null,
  loading: false,
  error: null,
};

// Async thunks
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (content: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/messages`,
      {
        method: "POST",
        credentials: "include", // This will automatically send cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    return data;
  }
);

export const getAdminConversation = createAsyncThunk(
  "messages/getAdminConversation",
  async (page: number = 1) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/messages/admin-conversation?page=${page}`,
      {
        method: "GET",
        credentials: "include", // This will automatically send cookies
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch admin conversation");
    }

    const data = await response.json();
    return data.data;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.adminConversation = null;
      state.messages = [];
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
    addNewMessage: (state, action) => {
      // Check if message already exists to prevent duplicates
      const messageExists = state.messages.some(
        (msg) => msg.id === action.payload.id
      );
      // Prevent empty or whitespace-only messages
      if (!action.payload.content || action.payload.content.trim() === "")
        return;
      // Remove any optimistic (temp) message with the same content
      state.messages = state.messages.filter(
        (msg) =>
          !(
            msg.id &&
            msg.id.startsWith("temp-") &&
            msg.content === action.payload.content
          )
      );
      if (!messageExists) {
        state.messages.push(action.payload);
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
        const backendMsg = action.payload;
        // Prevent empty or whitespace-only messages
        if (!backendMsg.content || backendMsg.content.trim() === "") return;
        const newMessage = {
          id: backendMsg.id,
          content: backendMsg.content,
          senderId: backendMsg.sender?.id,
          receiverId: backendMsg.recipient?.id,
          createdAt: backendMsg.createdAt,
          updatedAt: backendMsg.updatedAt,
          isRead: backendMsg.isRead,
          isFromStudent: backendMsg.sender?.role === "STUDENT",
          sender: backendMsg.sender,
        };
        state.messages.push(newMessage);
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

        if (action.payload?.pagination?.currentPage === 1) {
          // For page 1, replace the conversation and sync messages array
          state.adminConversation = action.payload;
          state.messages = action.payload.messages || [];
        } else if (state.adminConversation && action.payload) {
          // Prepend older messages
          state.adminConversation.messages = [
            ...(action.payload.messages || []),
            ...state.adminConversation.messages,
          ];
          // Update pagination info
          if (action.payload.pagination) {
            state.adminConversation.pagination = action.payload.pagination;
          }
        }
      })
      .addCase(getAdminConversation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch admin conversation";
      });
  },
});

export const { clearMessages, prependMessages, addNewMessage } =
  messagesSlice.actions;
export default messagesSlice.reducer;
