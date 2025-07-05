import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  fetchUnreadCount,
  addNewMessage,
  getAdminConversation,
} from "@/redux/features/Message/messagesSlice";
import websocketService, { SocketEvents } from "@/services/SocketIOService";
import { toast } from "sonner";

// Type guard for backend payload
function isNewMessageData(
  data: unknown
): data is { message: Record<string, unknown> } {
  return (
    !!data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "object" &&
    (data as { message: unknown }).message !== null
  );
}

function isNewNotificationData(
  data: unknown
): data is { notification: Record<string, unknown> } {
  return (
    !!data &&
    typeof data === "object" &&
    "notification" in data &&
    typeof (data as { notification: unknown }).notification === "object" &&
    (data as { notification: unknown }).notification !== null
  );
}

export const useWebSocketConnection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to attempt reconnection with exponential backoff
  const scheduleReconnect = useCallback((attempt = 1) => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    // Exponential backoff: 2^attempt * 1000 ms, capped at 30 seconds
    const delay = Math.min(Math.pow(2, attempt) * 1000, 30000);
    reconnectTimerRef.current = setTimeout(() => {
      if (!websocketService.isConnected()) {
        websocketService.connect();
        // Schedule next reconnect attempt if still not connected
        if (!websocketService.isConnected()) {
          scheduleReconnect(attempt + 1);
        }
      }
    }, delay);
  }, []);

  useEffect(() => {
    // Fetch initial unread counts
    dispatch(fetchUnreadCount());
    // Connect to WebSocket
    websocketService.connect();

    // Handle new message notifications
    const handleNewMessage = (data: unknown) => {
      if (isNewMessageData(data)) {
        // Update the unread count
        dispatch(fetchUnreadCount());
        // Add the new message to the current conversation if we're in one
        const message = data.message as Record<string, unknown>;
        if (
          typeof message === "object" &&
          message !== null &&
          "id" in message &&
          "content" in message &&
          "sender" in message &&
          typeof message.sender === "object" &&
          message.sender !== null
        ) {
          const sender = message.sender as Record<string, unknown>;
          dispatch(
            addNewMessage({
              id: (message.id as string) || `temp-${Date.now()}`,
              content: message.content as string,
              senderId: (sender.id as string) || "",
              receiverId:
                message.recipient &&
                typeof message.recipient === "object" &&
                message.recipient !== null &&
                "id" in message.recipient
                  ? ((message.recipient as Record<string, unknown>)
                      .id as string)
                  : "",
              createdAt:
                (message.createdAt as string) || new Date().toISOString(),
              updatedAt:
                (message.updatedAt as string) || new Date().toISOString(),
              isRead: (message.isRead as boolean) ?? false,
              isFromStudent: false, // This is a message from admin to student
              sender: sender,
            })
          );
          // If we're on the support page, refresh the conversation to ensure we have the latest data
          if (window.location.pathname === "/support") {
            dispatch(getAdminConversation(1));
          }
          // Show a toast notification
          toast(
            <div className="flex flex-col">
              <span className="font-medium">{sender.fullName as string}</span>
              <span className="text-sm truncate">
                {message.content as string}
              </span>
            </div>,
            {
              description: "New message received",
              action: {
                label: "View",
                onClick: () => {
                  // Navigate to support page
                  window.location.href = "/support";
                },
              },
            }
          );
        }
      }
    };

    // Handle new notification events
    const handleNewNotification = (data: unknown) => {
      if (isNewNotificationData(data)) {
        const notification = data.notification as Record<string, unknown>;
        if (
          typeof notification === "object" &&
          notification !== null &&
          "title" in notification &&
          "content" in notification
        ) {
          // Show a toast for the new notification
          toast(
            <div className="flex flex-col">
              <span className="font-medium">
                {notification.title as string}
              </span>
              <span className="text-sm truncate">
                {notification.content as string}
              </span>
            </div>,
            {
              description: "New notification",
            }
          );
        }
      }
    };

    // Handle connection events
    const handleConnected = () => {
      dispatch(fetchUnreadCount());
    };

    // Handle connection errors
    const handleConnectionError = () => {
      scheduleReconnect();
    };

    // Register event listeners
    websocketService.on(SocketEvents.CONNECTED, handleConnected);
    websocketService.on(SocketEvents.NEW_MESSAGE, handleNewMessage);
    websocketService.on(SocketEvents.NEW_NOTIFICATION, handleNewNotification);
    websocketService.on(SocketEvents.ERROR, handleConnectionError);

    // Handle visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // When tab becomes visible, check connection and refresh data
        if (!websocketService.isConnected()) {
          websocketService.connect();
        }
        // Refresh data when returning to tab
        dispatch(fetchUnreadCount());
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Set up a ping interval to keep the connection alive
    const pingInterval = setInterval(() => {
      if (websocketService.isConnected()) {
        websocketService.sendMessage("ping", {});
      } else {
        // Try to reconnect if connection is lost
        websocketService.connect();
      }
    }, 30000); // Every 30 seconds
    // Clean up on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Remove event listeners
      websocketService.off(SocketEvents.CONNECTED, handleConnected);
      websocketService.off(SocketEvents.NEW_MESSAGE, handleNewMessage);
      websocketService.off(
        SocketEvents.NEW_NOTIFICATION,
        handleNewNotification
      );
      websocketService.off(SocketEvents.ERROR, handleConnectionError);
      // Clear intervals and timeouts
      clearInterval(pingInterval);
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      // Disconnect WebSocket
      websocketService.disconnect();
    };
  }, [dispatch, scheduleReconnect]);
};
