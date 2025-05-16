import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  fetchMessages,
  sendMessage,
  markMessageAsRead,
  setSelectedStudent,
  clearSelectedStudent,
  clearMessagesState,
  selectMessages,
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
  const pagination = useAppSelector(selectPagination);
  const unreadCount = useAppSelector(selectUnreadCount);
  const selectedStudent = useAppSelector(selectSelectedStudent);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const success = useAppSelector(selectSuccess);
  const statusMessage = useAppSelector(selectMessage);

  // Fetch messages (with pagination and optional filter)
  const getMessages = useCallback(
    (page: number = 1, filter: string = "all") => {
      return dispatch(fetchMessages({ page, filter }));
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

  // Mark a message as read
  const readMessage = useCallback(
    (messageId: string) => {
      return dispatch(markMessageAsRead(messageId));
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
    pagination,
    unreadCount,
    selectedStudent,
    isLoading,
    error,
    success,
    statusMessage,

    // Actions
    getMessages,
    createMessage,
    readMessage,
    selectStudent,
    clearStudent,
    clearStatus,
  };
};
