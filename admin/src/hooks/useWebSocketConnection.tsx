import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch } from "./hooks";
import { fetchUnreadCount } from "@/redux/features/messagesSlice";
import { fetchNotifications } from "@/redux/features/notificationsSlice";
import websocketService, { SocketEvents } from "@/services/websocket.service";
import { toast } from "sonner";

// Define the types for message and new message data
interface Message {
  content: string;
  sender: {
    fullName: string;
  };
}

interface NewMessageData {
  payload: {
    message: Message;
  };
}

interface NewNotificationData {
  payload: {
    notification: {
      title: string;
      content: string;
    };
  };
}

// Type guard to check if data is of type NewMessageData
function isNewMessageData(data: unknown): data is NewMessageData {
  if (
    typeof data === "object" &&
    data !== null &&
    "payload" in data &&
    typeof (data as { payload: unknown }).payload === "object" &&
    (data as { payload: unknown }).payload !== null
  ) {
    const payload = (data as { payload: { message: unknown } }).payload;
    if (
      "message" in payload &&
      typeof payload.message === "object" &&
      payload.message !== null &&
      "content" in payload.message &&
      "sender" in payload.message &&
      typeof (payload.message as { content: unknown }).content === "string" &&
      typeof (payload.message as { sender: unknown }).sender === "object" &&
      (payload.message as { sender: unknown }).sender !== null &&
      "fullName" in
        (payload.message as { sender: { fullName: unknown } }).sender &&
      typeof (payload.message as { sender: { fullName: unknown } }).sender
        .fullName === "string"
    ) {
      return true;
    }
  }
  return false;
}

// Type guard to check if data is of type NewNotificationData
function isNewNotificationData(data: unknown): data is NewNotificationData {
  if (
    typeof data === "object" &&
    data !== null &&
    "payload" in data &&
    typeof (data as { payload: unknown }).payload === "object" &&
    (data as { payload: unknown }).payload !== null
  ) {
    const payload = (data as { payload: { notification: unknown } }).payload;
    if (
      "notification" in payload &&
      typeof payload.notification === "object" &&
      payload.notification !== null &&
      "title" in payload.notification &&
      "content" in payload.notification
    ) {
      return true;
    }
  }
  return false;
}

export const useWebSocketConnection = () => {
  const dispatch = useAppDispatch();
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to attempt reconnection with exponential backoff
  const scheduleReconnect = useCallback((attempt = 1) => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    // Exponential backoff: 2^attempt * 1000 ms, capped at 30 seconds
    const delay = Math.min(Math.pow(2, attempt) * 1000, 30000);

    reconnectTimerRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (attempt ${attempt})...`);

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
    dispatch(fetchNotifications({ page: 1, limit: 10 }));

    // Connect to WebSocket
    websocketService.connect();

    // Handle new message notifications
    const handleNewMessage = (data: unknown) => {
      if (isNewMessageData(data)) {
        // Update the unread count
        dispatch(fetchUnreadCount());

        // Show a toast notification
        const message = data.payload.message;
        const sender = message.sender;

        toast(
          <div className="flex flex-col">
            <span className="font-medium">{sender.fullName}</span>
            <span className="text-sm truncate">{message.content}</span>
          </div>,
          {
            description: "New message received",
            action: {
              label: "View",
              onClick: () => {
                // Open the chat
                const chatButton =
                  document.getElementById("global-chat-button");
                if (chatButton) {
                  chatButton.click();
                }
              },
            },
          }
        );
      }
    };

    // Handle new notification events
    const handleNewNotification = (data: unknown) => {
      if (isNewNotificationData(data)) {
        console.log("New notification received", data);

        // Update notifications
        dispatch(fetchNotifications({ page: 1, limit: 10 }));

        // Show a toast for the new notification
        const { title, content } = data.payload.notification;

        toast(
          <div className="flex flex-col">
            <span className="font-medium">{title}</span>
            <span className="text-sm truncate">{content}</span>
          </div>,
          {
            description: "New notification",
          }
        );
      } else {
        // If the shape doesn't match but it's still a notification event
        console.log("New notification received with unexpected format", data);
        dispatch(fetchNotifications({ page: 1, limit: 10 }));
      }
    };

    // Handle connection events
    const handleConnected = () => {
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    };

    // Handle connection errors
    const handleConnectionError = (error: unknown) => {
      console.error("WebSocket connection error:", error);
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
          console.log("Tab became visible, reconnecting WebSocket");
          websocketService.connect();
        }

        // Refresh data when returning to tab
        dispatch(fetchUnreadCount());
        dispatch(fetchNotifications({ page: 1, limit: 10 }));
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
