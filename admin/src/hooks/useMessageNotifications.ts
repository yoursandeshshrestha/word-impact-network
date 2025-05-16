// src/hooks/useMessageNotifications.ts
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { fetchUnreadCount } from "@/redux/features/messagesSlice";
import websocketService, { SocketEvents } from "@/services/websocket.service";

export const useMessageNotifications = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Fetch initial unread count
    dispatch(fetchUnreadCount());

    // Connect to WebSocket
    websocketService.connect();

    // Register event handler for new messages
    const handleNewMessage = () => {
      // When a new message arrives, update the unread count
      dispatch(fetchUnreadCount());
    };

    websocketService.on(SocketEvents.NEW_MESSAGE, handleNewMessage);

    // // Set up polling as fallback
    // const intervalId = setInterval(() => {
    //   dispatch(fetchUnreadCount());
    // }, 30000); // Every 30 seconds

    // Set up visibility change detection to update when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        dispatch(fetchUnreadCount());

        if (!websocketService.isConnected()) {
          websocketService.connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up on unmount
    return () => {
      websocketService.off(SocketEvents.NEW_MESSAGE, handleNewMessage);
      websocketService.disconnect();
      // clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);
};
