import React, { useState, useEffect, useRef, useCallback } from "react";
import { Video } from "@/redux/features/videosSlice";
import { X, RefreshCw } from "lucide-react";

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up video and event listeners when component mounts
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement && video) {
      // Set up event listeners
      const handleCanPlay = () => {
        setIsLoading(false);
        // Try to autoplay
        videoElement.play().catch((err) => {
          console.error("Autoplay failed:", err);
        });
      };

      const handleError = () => {
        console.error("Video error:", videoElement.error);
        setError("Failed to play video. Please try again.");
        setIsLoading(false);
      };

      // Add event listeners
      videoElement.addEventListener("canplay", handleCanPlay);
      videoElement.addEventListener("error", handleError);

      // Clean up event listeners on unmount
      return () => {
        videoElement.removeEventListener("canplay", handleCanPlay);
        videoElement.removeEventListener("error", handleError);
      };
    }
  }, [video]);

  // This crucial cleanup function runs when component unmounts
  useEffect(() => {
    const videoElement = videoRef.current;
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute("src");
        videoElement.load();
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    // Pause video and clean up resources before closing
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [handleClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 overflow-y-auto h-full w-full z-50 flex justify-center items-center"
      onClick={handleClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-black rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 z-20 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 cursor-pointer transition-colors duration-200"
          onClick={handleClose}
        >
          <X size={24} />
        </button>

        {/* Title overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent z-10">
          <h3 className="text-white text-lg font-semibold">{video.title}</h3>
          {video.description && (
            <p className="text-gray-300 text-sm">{video.description}</p>
          )}
        </div>

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10">
            <div className="bg-red-900 bg-opacity-80 p-6 rounded-lg max-w-md text-center">
              <p className="text-white mb-4">{error}</p>
              <button
                className="bg-white text-red-900 px-4 py-2 rounded-md font-medium hover:bg-gray-100"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
            <div className="flex flex-col items-center">
              <RefreshCw size={40} className="text-white animate-spin mb-2" />
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* Native HTML5 Video Player */}
        <div className="video-container aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            playsInline
            preload="auto"
            poster={video.thumbnailUrl || ""}
            autoPlay // Attempt autoplay
            src={video.vimeoId}
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
