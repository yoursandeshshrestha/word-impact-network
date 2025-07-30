import React, { useState, useEffect, useRef, useCallback } from "react";
import { Video } from "@/redux/features/videosSlice";
import { X, RefreshCw } from "lucide-react";

interface VimeoPlayerProps {
  video: Video | null;
  onClose: () => void;
}

const VimeoPlayer: React.FC<VimeoPlayerProps> = ({ video, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate Vimeo embed URL with parameters
  const getVimeoEmbedUrl = (embedUrl: string) => {
    return `${embedUrl}&autoplay=1&title=0&byline=0&portrait=0&controls=1&responsive=1`;
  };

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setError("Failed to load video. Please try again.");
    setIsLoading(false);
  }, []);

  // Set up iframe when video changes
  useEffect(() => {
    if (video && iframeRef.current) {
      setIsLoading(true);
      setError(null);
      const embedUrl = getVimeoEmbedUrl(video.embedUrl);
      iframeRef.current.src = embedUrl;
    }
  }, [video]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        iframeRef.current.src = "";
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    // Clean up iframe before closing
    if (iframeRef.current) {
      iframeRef.current.src = "";
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
                  if (iframeRef.current && video) {
                    const embedUrl = getVimeoEmbedUrl(video.embedUrl);
                    iframeRef.current.src = embedUrl;
                  }
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
            <div className="flex flex-col items-center">
              <RefreshCw size={40} className="text-white animate-spin mb-2" />
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* Vimeo iframe */}
        <div className="video-container aspect-video">
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={video.title}
          />
        </div>
      </div>
    </div>
  );
};

export default VimeoPlayer;
