import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  clearError,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsError,
  selectNotificationsPagination,
  Notification,
} from "@/redux/features/notificationsSlice";

/**
 * Custom hook for notification management
 */
export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const storeNotifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const isLoading = useAppSelector(selectNotificationsLoading);
  const error = useAppSelector(selectNotificationsError);
  const pagination = useAppSelector(selectNotificationsPagination);

  // Local state to handle merged notifications across pagination
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Update local notifications when store notifications change
  useEffect(() => {
    if (pagination.currentPage === 1) {
      // Reset notifications when loading first page
      setNotifications(storeNotifications);
    } else if (pagination.currentPage > 1) {
      // Merge new notifications with existing ones for pagination
      const newNotificationIds = new Set(storeNotifications.map((n) => n.id));
      const existingNotifications = notifications.filter(
        (n) => !newNotificationIds.has(n.id)
      );
      setNotifications([...existingNotifications, ...storeNotifications]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeNotifications, pagination.currentPage]);

  // Load notifications with pagination support
  const loadNotifications = useCallback(
    (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) => {
      return dispatch(fetchNotifications(params));
    },
    [dispatch]
  );

  // Mark a notification as read
  const markAsRead = useCallback(
    (notificationId: string) => {
      // Optimistically update the local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      return dispatch(markNotificationAsRead(notificationId));
    },
    [dispatch]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    // Optimistically update the local state
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    return dispatch(markAllNotificationsAsRead());
  }, [dispatch]);

  // Clear notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    dispatch(clearNotifications());
  }, [dispatch]);

  // Clear error
  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Initial load on mount and set up polling for new notifications
  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Set up interval to refresh notifications every 30 seconds
    const intervalId = setInterval(() => {
      // Only fetch the first page with newest notifications to check for updates
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loadNotifications, dispatch]);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,

    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    resetError,
  };
};
