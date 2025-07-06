import { useEffect, useRef, useCallback, useState } from "react";
import { useAppDispatch } from "./hooks";
import {
  fetchUnreadCount,
  addNewMessage,
} from "@/redux/features/messagesSlice";
import { fetchNotifications } from "@/redux/features/notificationsSlice";
import websocketService, { SocketEvents } from "@/services/SocketIOService";
import { toast } from "sonner";
import { AuthService } from "@/utils/auth";

// Define the types for message and new message data
interface Message {
  id?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  sender: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  };
}

interface NewMessageData {
  message: Message;
  notification?: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  };
}

interface NewNotificationData {
  notification: {
    title: string;
    content: string;
  };
}

// Type guard to check if data is of type NewMessageData
function isNewMessageData(data: unknown): data is NewMessageData {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "object" &&
    (data as { message: unknown }).message !== null
  ) {
    const message = (data as { message: Message }).message;
    if (
      "content" in message &&
      "sender" in message &&
      typeof message.content === "string" &&
      typeof message.sender === "object" &&
      message.sender !== null
    ) {
      const sender = message.sender;
      return "fullName" in sender && typeof sender.fullName === "string";
    }
  }
  return false;
}

// Type guard to check if data is of type NewNotificationData
function isNewNotificationData(data: unknown): data is NewNotificationData {
  if (
    typeof data === "object" &&
    data !== null &&
    "notification" in data &&
    typeof (data as { notification: unknown }).notification === "object" &&
    (data as { notification: unknown }).notification !== null
  ) {
    const notification = (data as { notification: unknown }).notification;
    if (
      typeof notification === "object" &&
      notification !== null &&
      "title" in notification &&
      "content" in notification
    ) {
      return true;
    }
  }
  return false;
}

export const useWebSocketConnection = () => {
  const dispatch = useAppDispatch();
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dispatchRef = useRef(dispatch);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hookId = useRef(`hook-${Date.now()}-${Math.random()}`);

  // Update the ref when dispatch changes
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await AuthService.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Function to attempt reconnection with exponential backoff
  const scheduleReconnect = useCallback(
    (attempt = 1) => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      // Exponential backoff: 2^attempt * 1000 ms, capped at 30 seconds
      const delay = Math.min(Math.pow(2, attempt) * 1000, 30000);

      reconnectTimerRef.current = setTimeout(() => {
        console.log(`Attempting to reconnect (attempt ${attempt})...`);

        if (!websocketService.isConnected() && isAuthenticated) {
          websocketService.connect();

          // Schedule next reconnect attempt if still not connected
          if (!websocketService.isConnected()) {
            scheduleReconnect(attempt + 1);
          }
        }
      }, delay);
    },
    [isAuthenticated]
  );

  useEffect(() => {
    // Only proceed if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Fetch initial unread counts
    dispatchRef.current(fetchUnreadCount());
    dispatchRef.current(fetchNotifications({ page: 1, limit: 10 }));

    // Connect to WebSocket
    websocketService.connect();

    // Handle new message notifications
    const handleNewMessage = (data: unknown) => {
      if (isNewMessageData(data)) {
        // Add the new message to the current conversation if we're in one
        const message = data.message;
        dispatchRef.current(
          addNewMessage({
            id: message.id || `temp-${Date.now()}`,
            content: message.content,
            isRead: false,
            createdAt: message.createdAt || new Date().toISOString(),
            updatedAt: message.updatedAt || new Date().toISOString(),
            sender: message.sender,
            isFromUser: false, // This is a message from student to admin
          })
        );

        // Show a toast notification (disabled temporarily to fix multiple toasts)
        // const sender = message.sender;
        // toast(
        //   <div className="flex flex-col">
        //     <span className="font-medium">{sender.fullName}</span>
        //     <span className="text-sm truncate">{message.content}</span>
        //   </div>,
        //   {
        //     description: "New message received",
        //     action: {
        //       label: "View",
        //       onClick: () => {
        //         // Open the chat
        //         const chatButton =
        //           document.getElementById("global-chat-button");
        //         if (chatButton) {
        //           chatButton.click();
        //         }
        //       },
        //     },
        //   }
        // );
      }
    };

    // Handle new notification events
    const handleNewNotification = (data: unknown) => {
      if (isNewNotificationData(data)) {
        // Show a toast for the new notification
        const { title, content } = data.notification;

        toast(
          <div className="flex flex-col">
            <span className="font-medium">{title}</span>
            <span className="text-sm truncate">{content}</span>
          </div>,
          {
            description: "New notification",
          }
        );
      }
    };

    // Handle connection events
    const handleConnected = () => {
      dispatchRef.current(fetchUnreadCount());
      dispatchRef.current(fetchNotifications({ page: 1, limit: 10 }));
    };

    // Handle connection errors
    const handleConnectionError = (error: unknown) => {
      console.error("WebSocket connection error:", error);
      scheduleReconnect();
    };

    // Register event listeners with unique identifiers
    const connectedHandler = () => {
      handleConnected();
    };

    const newMessageHandler = (data: unknown) => {
      handleNewMessage(data);
    };

    const newNotificationHandler = (data: unknown) => {
      handleNewNotification(data);
    };

    const errorHandler = (error: unknown) => {
      console.log(`[${hookId.current}] Error event`);
      handleConnectionError(error);
    };

    websocketService.on(SocketEvents.CONNECTED, connectedHandler);
    websocketService.on(SocketEvents.NEW_MESSAGE, newMessageHandler);
    websocketService.on(SocketEvents.NEW_NOTIFICATION, newNotificationHandler);
    websocketService.on(SocketEvents.ERROR, errorHandler);

    // Handle visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        // When tab becomes visible, check connection and refresh data
        if (!websocketService.isConnected()) {
          console.log("Tab became visible, reconnecting WebSocket");
          websocketService.connect();
        }

        // Refresh data when returning to tab
        dispatchRef.current(fetchUnreadCount());
        dispatchRef.current(fetchNotifications({ page: 1, limit: 10 }));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up a ping interval to keep the connection alive
    const pingInterval = setInterval(() => {
      if (websocketService.isConnected() && isAuthenticated) {
        websocketService.sendMessage("ping", {});
      } else if (!websocketService.isConnected() && isAuthenticated) {
        // Try to reconnect if connection is lost
        websocketService.connect();
      }
    }, 30000); // Every 30 seconds

    // Clean up on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Remove event listeners
      websocketService.off(SocketEvents.CONNECTED, connectedHandler);
      websocketService.off(SocketEvents.NEW_MESSAGE, newMessageHandler);
      websocketService.off(
        SocketEvents.NEW_NOTIFICATION,
        newNotificationHandler
      );
      websocketService.off(SocketEvents.ERROR, errorHandler);

      // Clear intervals and timeouts
      clearInterval(pingInterval);
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      // Disconnect WebSocket
      websocketService.disconnect();
    };
  }, [scheduleReconnect, isAuthenticated]);
};
