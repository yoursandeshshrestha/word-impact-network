import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    if (socket?.connected) return;

    // Get token from cookies instead of localStorage
    const getCookie = (name: string) => {
      if (typeof window === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const token = getCookie("accessToken");

    const newSocket = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
      {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
        withCredentials: true,
      }
    );

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("connect_error", (error) => {
      console.error("useSocket: Connection error", error);
      setIsConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("useSocket: Error", error);
      // Error handled silently
    });

    newSocket.on("disconnect", (reason) => {
      console.error("useSocket: Disconnect", reason);
      setIsConnected(false);
    });

    newSocket.on("video_status_update", (data) => {
      console.error("useSocket: Video status update", data);
      // Video status update handled silently
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("useSocket: Connect error", error);
      setIsConnected(false);
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Only connect on client side
    if (typeof window !== "undefined") {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
};
