import React, { useState, useEffect, useRef } from "react";
import { Video } from "@/redux/features/videosSlice";
import ReactPlayer from "react-player";
import { X, Volume2, VolumeX, Maximize, RefreshCw } from "lucide-react";

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true); // Set to true for autoplay
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference to the container element for fullscreen
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if we're in fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update fullscreen state when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (!video) return null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    const player = (e.target as HTMLInputElement)
      .previousSibling as unknown as ReactPlayer;
    if (player && player.seekTo) {
      player.seekTo(parseFloat((e.target as HTMLInputElement).value));
    }
  };

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    // Only update time if not seeking
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleError = (error: Error) => {
    console.error("Video playback error:", error);
    setError("Failed to play video. Please try again.");
    setIsPlaying(false);
  };

  const handleReady = () => {
    setIsReady(true);
    setError(null);
    // Autoplay once the player is ready
    setIsPlaying(true);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Use the container ref for fullscreen
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  const secondsToTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ":" : ""}${m < 10 && h > 0 ? "0" + m : m}:${
      s < 10 ? "0" + s : s
    }`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className={`relative max-w-4xl w-full max-h-[90vh] bg-black ${
          isFullscreen ? "h-full" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 z-20 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 cursor-pointer transition-colors duration-200"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Title overlay */}
        <div
          className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent z-10 ${
            isFullscreen ? "py-6" : ""
          }`}
        >
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
                  setIsReady(false);
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
            <div className="flex flex-col items-center">
              <RefreshCw size={40} className="text-white animate-spin mb-2" />
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* ReactPlayer component */}
        <div className="relative pt-[56.25%] /* 16:9 Aspect Ratio */">
          <ReactPlayer
            url={video.backblazeUrl}
            className="absolute top-0 left-0"
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={volume}
            muted={isMuted}
            onReady={handleReady}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={handleError}
            onProgress={handleProgress}
            onDuration={handleDuration}
            playsinline
            controls={false}
            config={{
              file: {
                attributes: {
                  crossOrigin: "anonymous",
                  autoPlay: true, // HTML5 autoplay attribute
                },
                forceVideo: true,
              },
            }}
          />
        </div>

        {/* Custom controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 ${
            isFullscreen ? "pb-6" : ""
          }`}
        >
          {/* Progress bar */}
          <div className="flex items-center w-full mb-2">
            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={
                handleSeekMouseUp as unknown as (
                  e: React.MouseEvent<HTMLInputElement>
                ) => void
              }
              className="w-full h-1 bg-gray-600 rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${
                  played * 100
                }%, #4b5563 ${played * 100}%, #4b5563 100%)`,
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause button */}
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-indigo-300 cursor-pointer transition-colors duration-200"
              >
                {isPlaying ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon
                      points="5 3 19 12 5 21 5 3"
                      fill="currentColor"
                    ></polygon>
                  </svg>
                )}
              </button>

              {/* Time display */}
              <div className="text-white text-sm">
                {secondsToTime(played * duration)} / {secondsToTime(duration)}
              </div>

              {/* Volume controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleMute}
                  className="text-white hover:text-indigo-300 cursor-pointer transition-colors duration-200"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Fullscreen button with active state */}
              <button
                onClick={handleToggleFullscreen}
                className={`text-white hover:text-indigo-300 cursor-pointer transition-colors duration-200 ${
                  isFullscreen ? "text-indigo-300" : ""
                }`}
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
