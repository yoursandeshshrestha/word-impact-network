import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  fetchConversations,
  fetchConversationMessages,
  fetchUnreadCount as fetchUnreadCountAction,
  sendMessage,
  markConversationAsRead,
  setSelectedStudent,
  clearSelectedStudent,
  clearMessagesState,
  selectMessages,
  selectConversations,
  selectPagination,
  selectUnreadCount,
  selectSelectedStudent,
  selectIsLoading,
  selectError,
  selectSuccess,
  selectMessage,
  User,
} from "@/redux/features/messagesSlice";

export const useMessages = () => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMessages);
  const conversations = useAppSelector(selectConversations);
  const pagination = useAppSelector(selectPagination);
  const unreadCount = useAppSelector(selectUnreadCount);
  const selectedStudent = useAppSelector(selectSelectedStudent);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const success = useAppSelector(selectSuccess);
  const statusMessage = useAppSelector(selectMessage);

  // Fetch just the unread count
  const fetchUnreadCount = useCallback(() => {
    return dispatch(fetchUnreadCountAction());
  }, [dispatch]);

  // Fetch all conversations
  const getConversations = useCallback(() => {
    return dispatch(fetchConversations());
  }, [dispatch]);

  // Fetch messages for a specific conversation
  const getConversationMessages = useCallback(
    (partnerId: string, page: number = 1, limit: number = 20) => {
      return dispatch(fetchConversationMessages({ partnerId, page, limit }));
    },
    [dispatch]
  );

  // Send a new message
  const createMessage = useCallback(
    (recipientId: string, content: string) => {
      return dispatch(sendMessage({ recipientId, content }));
    },
    [dispatch]
  );

  // Mark all messages in a conversation as read
  const readConversation = useCallback(
    (partnerId: string) => {
      return dispatch(markConversationAsRead(partnerId));
    },
    [dispatch]
  );

  // Set the selected student for conversation
  const selectStudent = useCallback(
    (student: User) => {
      dispatch(setSelectedStudent(student));
    },
    [dispatch]
  );

  // Clear selected student
  const clearStudent = useCallback(() => {
    dispatch(clearSelectedStudent());
  }, [dispatch]);

  // Clear status
  const clearStatus = useCallback(() => {
    dispatch(clearMessagesState());
  }, [dispatch]);

  return {
    // State
    messages,
    conversations,
    pagination,
    unreadCount,
    selectedStudent,
    isLoading,
    error,
    success,
    statusMessage,

    // Actions
    fetchUnreadCount,
    getConversations,
    getConversationMessages,
    createMessage,
    readConversation,
    selectStudent,
    clearStudent,
    clearStatus,
  };
};
