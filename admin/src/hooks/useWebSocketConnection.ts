// src/hooks/useWebSocketConnection.ts
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { fetchUnreadCount } from "@/redux/features/messagesSlice";
import websocketService from "@/services/websocket.service";

export const useWebSocketConnection = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("Setting up WebSocket connection");

    // Fetch initial unread count
    dispatch(fetchUnreadCount());

    // Connect to WebSocket
    websocketService.connect();

    // Handle visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // If tab becomes visible and connection is lost, reconnect
        if (!websocketService.isConnected()) {
          console.log("Tab became visible, reconnecting WebSocket");
          websocketService.connect();
        }

        // Also fetch latest unread count when returning to tab
        dispatch(fetchUnreadCount());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up on unmount
    return () => {
      console.log("Cleaning up WebSocket connection");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      websocketService.disconnect();
    };
  }, [dispatch]);
};
