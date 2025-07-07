import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  sendMessage,
  getAdminConversation,
  clearMessages,
  addNewMessage,
} from "../redux/features/Message/messagesSlice";

export const useMessages = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminConversation, messages, loading, error } = useSelector(
    (state: RootState) => state.messages
  );

  const sendMessageToAdmin = useCallback(
    async (content: string) => {
      try {
        // Optimistically add a temporary message
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
          id: tempId,
          content,
          senderId: "me",
          receiverId: "admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isRead: false,
          isFromStudent: true,
          sender: {},
        };
        dispatch(addNewMessage(optimisticMessage));

        await dispatch(sendMessage(content)).unwrap();
        // Optionally, remove the optimistic message after real one arrives
        // (Handled by duplicate check in addNewMessage)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        console.error("Failed to send message:", errorMessage);
        throw error;
      }
    },
    [dispatch]
  );

  const fetchAdminConversation = useCallback(
    async (page?: number) => {
      try {
        await dispatch(getAdminConversation(page ?? 1)).unwrap();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch admin conversation";
        console.error("Failed to fetch admin conversation:", errorMessage);
        throw error;
      }
    },
    [dispatch]
  );

  const clearMessagesState = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    adminConversation,
    messages,
    loading,
    error,
    sendMessageToAdmin,
    fetchAdminConversation,
    clearMessagesState,
  };
};
