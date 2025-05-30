import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  sendMessage,
  getAdminConversation,
  markConversationAsRead,
  clearMessages,
} from "../redux/features/Message/messagesSlice";

export const useMessages = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminConversation, loading, error } = useSelector(
    (state: RootState) => state.messages
  );

  const sendMessageToAdmin = useCallback(
    async (content: string) => {
      try {
        await dispatch(sendMessage(content)).unwrap();
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

  const markAsRead = useCallback(
    async (partnerId: string) => {
      try {
        await dispatch(markConversationAsRead(partnerId)).unwrap();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to mark conversation as read";
        console.error("Failed to mark conversation as read:", errorMessage);
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
    loading,
    error,
    sendMessageToAdmin,
    fetchAdminConversation,
    markAsRead,
    clearMessagesState,
  };
};
