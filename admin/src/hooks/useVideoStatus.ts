import { useEffect, useRef } from "react";
import { useSocket } from "./useSocket";
import { SocketEvents } from "@/types";

interface VideoStatusUpdate {
  videoId: string;
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
  progress?: number;
  errorMessage?: string;
}

export const useVideoStatus = (videoId: string) => {
  const { socket, isConnected } = useSocket();
  const statusRef = useRef<VideoStatusUpdate | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleVideoStatusUpdate = (data: VideoStatusUpdate) => {
      if (data.videoId === videoId) {
        statusRef.current = data;
        // You can add a callback here to update the parent component
      }
    };

    socket.on(SocketEvents.VIDEO_STATUS_UPDATE, handleVideoStatusUpdate);

    return () => {
      socket.off(SocketEvents.VIDEO_STATUS_UPDATE, handleVideoStatusUpdate);
    };
  }, [socket, isConnected, videoId]);

  return statusRef.current;
};
