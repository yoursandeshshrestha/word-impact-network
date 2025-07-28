"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { useAppDispatch } from "@/hooks/useReduxHooks";
import { useAutoChapterDetail } from "@/redux/features/chapterDetail/useChapterDetail";
import {
  trackVideoProgress,
  markVideoAsCompleted,
} from "@/redux/features/chapterDetail/chapterDetailSlice";
import {
  ChevronRight,
  Play,
  Lock,
  FileText,
  CheckCircle,
  Check,
} from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Add Vimeo Player types
declare global {
  interface Window {
    Vimeo: {
      Player: new (
        element: string | HTMLElement,
        options?: Record<string, unknown>
      ) => VimeoPlayer;
    };
  }
}

interface VimeoPlayer {
  on(event: string, callback: (data: Record<string, unknown>) => void): void;
  getCurrentTime(): Promise<number>;
  getDuration(): Promise<number>;
  getPaused(): Promise<boolean>;
  destroy(): void;
}

interface VimeoTimeUpdateData {
  percent: number;
  seconds: number;
  duration: number;
}

interface VideoItemProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  orderIndex: number;
  vimeoId: string;
  isLocked: boolean;
  progress: {
    watchedPercent: number;
    isCompleted: boolean;
  };
  isCurrentlyPlaying: boolean;
  onPlayVideo: (video: {
    id: string;
    title: string;
    vimeoId: string;
    embedUrl: string;
  }) => void;
  onMarkAsCompleted: (videoId: string, videoTitle: string) => void;
  isMarkingAsCompleted?: boolean;
  embedUrl: string;
}

const VideoItem: React.FC<VideoItemProps> = ({
  id,
  title,
  description,
  duration,
  orderIndex,
  vimeoId,
  embedUrl,
  isLocked,
  progress,
  isCurrentlyPlaying,
  onPlayVideo,
  onMarkAsCompleted,
  isMarkingAsCompleted = false,
}) => {
  // Format duration from seconds to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Truncate description to 100 words
  const getTruncatedDescription = (desc: string) => {
    const words = desc.split(" ");
    if (words.length <= 100) return desc;
    return words.slice(0, 100).join(" ") + "...";
  };

  const getStatusText = () => {
    if (isLocked) return "Locked";
    if (isCurrentlyPlaying) return "Now Playing";
    if (progress.isCompleted) return "Completed";
    if (progress.watchedPercent > 0)
      return `${progress.watchedPercent}% watched`;
    return "Not Started";
  };

  const getStatusColor = () => {
    if (isLocked) return "text-slate-400";
    if (isCurrentlyPlaying) return "text-indigo-700";
    if (progress.isCompleted) return "text-green-600";
    if (progress.watchedPercent > 0) return "text-yellow-600";
    return "text-slate-500";
  };

  const handleClick = () => {
    if (!isLocked) {
      onPlayVideo({ id, title, vimeoId, embedUrl });
    }
  };

  return (
    <div
      className={`p-5 rounded-xl transition-all duration-200 border ${
        isLocked
          ? "bg-slate-50 border-slate-200 cursor-not-allowed"
          : isCurrentlyPlaying
          ? "bg-indigo-50 border-indigo-200 cursor-pointer"
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
              isLocked
                ? "bg-slate-200"
                : isCurrentlyPlaying
                ? "bg-indigo-100"
                : progress.isCompleted
                ? "bg-green-100"
                : "bg-slate-100"
            }`}
          >
            {isLocked ? (
              <Lock className="w-5 h-5 text-slate-400" />
            ) : progress.isCompleted ? (
              <FileText className="w-5 h-5 text-green-600" />
            ) : (
              <Play
                className={`w-5 h-5 ${
                  isCurrentlyPlaying ? "text-indigo-700" : "text-slate-600"
                }`}
              />
            )}
          </div>
          <div className="flex-1">
            <h4
              className={`font-bold transition-colors duration-200 text-lg mb-1 ${
                isLocked
                  ? "text-slate-400"
                  : isCurrentlyPlaying
                  ? "text-indigo-700"
                  : "text-slate-900"
              }`}
            >
              {orderIndex}.{orderIndex} {title}
            </h4>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        <div className="text-sm text-slate-600 font-medium">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      {!isLocked && progress.watchedPercent > 0 && (
        <div className="mb-3 ml-13">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress.isCompleted ? "bg-green-500" : "bg-indigo-700"
              }`}
              style={{ width: `${progress.watchedPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Video Description */}
      <div className="ml-13">
        <p
          className={`text-sm leading-relaxed ${
            isLocked ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {getTruncatedDescription(description)}
        </p>
      </div>

      {/* Manual Completion Button */}
      {!isLocked && !progress.isCompleted && (
        <div className="ml-13 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsCompleted(id, title);
            }}
            disabled={isMarkingAsCompleted}
            className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isMarkingAsCompleted
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isMarkingAsCompleted ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Marking...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Mark as Completed</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const ChapterDetailPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const courseId = params?.courseId as string;
  const chapterId = params?.chapterId as string;

  const { chapterDetail, isLoading, isError, error } = useAutoChapterDetail(
    courseId,
    chapterId
  );

  // State for video player
  const [currentVideo, setCurrentVideo] = useState<{
    id: string;
    title: string;
    vimeoId: string;
    embedUrl: string;
  } | null>(null);

  // State for tracking manual completion
  const [markingAsCompleted, setMarkingAsCompleted] = useState<string | null>(
    null
  );

  // State for confirmation modal
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    videoId: string | null;
    videoTitle: string;
  }>({
    isOpen: false,
    videoId: null,
    videoTitle: "",
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayVideo = (video: {
    id: string;
    title: string;
    vimeoId: string;
    embedUrl: string;
  }) => {
    setCurrentVideo(video);
  };

  const handleMarkAsCompleted = (videoId: string, videoTitle: string) => {
    setConfirmationModal({
      isOpen: true,
      videoId,
      videoTitle,
    });
  };

  const handleConfirmMarkAsCompleted = async () => {
    if (!confirmationModal.videoId) return;

    try {
      setMarkingAsCompleted(confirmationModal.videoId);
      await dispatch(
        markVideoAsCompleted({
          videoId: confirmationModal.videoId,
          videoTitle: confirmationModal.videoTitle,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to mark video as completed:", error);
    } finally {
      setMarkingAsCompleted(null);
      setConfirmationModal({ isOpen: false, videoId: null, videoTitle: "" });
    }
  };

  const handleCloseConfirmationModal = () => {
    setConfirmationModal({ isOpen: false, videoId: null, videoTitle: "" });
  };

  const handleVideoProgress = async () => {
    if (playerRef.current && currentVideo) {
      try {
        const currentTime = await playerRef.current.getCurrentTime();
        const duration = await playerRef.current.getDuration();
        const watchedPercent = Math.round((currentTime / duration) * 100);

        dispatch(
          trackVideoProgress({
            courseId,
            chapterId,
            videoId: currentVideo.id,
            currentTime: Math.round(currentTime),
            duration: Math.round(duration),
            watchedPercent,
          })
        );
      } catch (error) {
        console.error("Error tracking video progress:", error);
      }
    }
  };

  // Initialize Vimeo Player when iframe is ready
  useEffect(() => {
    if (currentVideo && iframeRef.current && window.Vimeo) {
      // Destroy previous player if exists
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      // Create new player
      const player = new window.Vimeo.Player(iframeRef.current);
      playerRef.current = player;

      // Set up event listeners
      player.on("play", () => {
        // Start progress tracking when video starts playing
        progressIntervalRef.current = setInterval(handleVideoProgress, 5000); // Track every 5 seconds
      });

      player.on("pause", () => {
        // Continue tracking even when paused to capture final progress
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        progressIntervalRef.current = setInterval(handleVideoProgress, 10000); // Slower tracking when paused
      });

      player.on("ended", () => {
        // Send final progress update when video ends
        handleVideoProgress();
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      });

      // Track progress on timeupdate (more frequent updates)
      player.on("timeupdate", (data) => {
        const { percent, seconds } = data as unknown as VimeoTimeUpdateData;
        // Only update if there's significant progress (every 10% or 30 seconds)
        const currentPercent = Math.round(percent * 100);
        const lastUpdate = sessionStorage.getItem(
          `lastProgress_${currentVideo.id}`
        );
        const lastPercent = lastUpdate ? parseInt(lastUpdate) : 0;
        if (currentPercent >= lastPercent + 10 || seconds >= 30) {
          sessionStorage.setItem(
            `lastProgress_${currentVideo.id}`,
            currentPercent.toString()
          );
          handleVideoProgress();
        }
      });

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const handleViewExam = () => {
    if (chapterDetail?.exam && !chapterDetail.exam.isLocked) {
      router.push(
        `/my-learning/${courseId}/chapter/${chapterId}/exam/${chapterDetail.exam.id}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading chapter details...</p>
        </div>
      </div>
    );
  }

  if (isError || !chapterDetail) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            {error || "Failed to load chapter details"}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push(`/my-learning/${courseId}`)}
              className="bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm transition-colors cursor-pointer"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { chapter, course, videos, exam, progress } = chapterDetail;

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-auto">
      {/* Load Vimeo Player SDK */}
      <Script
        src="https://player.vimeo.com/api/player.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log("Vimeo Player SDK loaded");
        }}
      />

      <div className="px-5 pt-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <button
              onClick={() => router.push("/my-learning")}
              className="hover:text-slate-900 transition-colors"
            >
              My Courses
            </button>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => router.push(`/my-learning/${courseId}`)}
              className="hover:text-slate-900 transition-colors"
            >
              {course.title}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{chapter.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Chapter Info & Videos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chapter Header */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {chapter.title}
                  </h1>
                  <p className="text-slate-600 leading-relaxed">
                    {chapter.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      (progress.videosCompleted / progress.totalVideos) * 100
                    )}
                    %
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (progress.videosCompleted / progress.totalVideos) * 100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  {progress.videosCompleted} of {progress.totalVideos} videos
                  completed
                </span>
                <span>Year {chapter.courseYear}</span>
              </div>
            </div>

            {/* Videos List */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">
                  Videos ({videos.length})
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Watch videos in order to unlock the next content
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {videos.map((video) => (
                  <VideoItem
                    key={video.id}
                    {...video}
                    isCurrentlyPlaying={currentVideo?.id === video.id}
                    onPlayVideo={(video) =>
                      handlePlayVideo({
                        id: video.id,
                        title: video.title,
                        vimeoId: video.vimeoId,
                        embedUrl: video.embedUrl,
                      })
                    }
                    onMarkAsCompleted={handleMarkAsCompleted}
                    isMarkingAsCompleted={markingAsCompleted === video.id}
                  />
                ))}
              </div>
            </div>

            {/* Exam Section */}
            {exam && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {exam.title}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {exam.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                        <span>Passing Score: {exam.passingScore}%</span>
                        <span>Time Limit: {exam.timeLimit} minutes</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {exam.isLocked ? (
                      <div className="text-center">
                        <Lock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg inline-block border border-yellow-200">
                          Complete all videos to unlock the exam
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg inline-block border border-green-200">
                          Exam unlocked
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleViewExam}
                    disabled={exam.isLocked}
                    className={`px-6 py-3 rounded-xl font-semibold transition-colors duration-200 ml-6 ${
                      exam.isLocked
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {exam.isLocked ? "Locked" : "Take Exam"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Video Player */}
          <div className="md:sticky md:top-22 h-fit ">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {currentVideo ? (
                <>
                  <div className="aspect-video bg-black">
                    <iframe
                      ref={iframeRef}
                      src={`${currentVideo.embedUrl}?autoplay=1&title=0&byline=0&portrait=0&controls=1&responsive=1`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={currentVideo.title}
                    />
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Select a video to start learning
                    </h3>
                    <p className="text-slate-600">
                      Choose any video from the list to begin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .video-js-custom .vjs-control-bar {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .video-js-custom .vjs-big-play-button {
          background: rgba(99, 102, 241, 0.8);
          border: none;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          line-height: 80px;
          font-size: 24px;
          margin-top: -40px;
          margin-left: -40px;
        }

        .video-js-custom .vjs-big-play-button:hover {
          background: rgba(99, 102, 241, 1);
        }

        .video-js-custom .vjs-play-progress {
          background: #6366f1;
        }

        .video-js-custom .vjs-volume-level {
          background: #6366f1;
        }

        .video-js-custom .vjs-playback-rate .vjs-playback-rate-value {
          font-size: 1.2em;
          line-height: 1.4;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleConfirmMarkAsCompleted}
        title="Mark Video as Completed"
        message={`Are you sure you want to mark "${confirmationModal.videoTitle}" as completed? This will unlock the next video in the sequence.`}
        confirmText="Mark as Completed"
        cancelText="Cancel"
        type="warning"
        isLoading={markingAsCompleted === confirmationModal.videoId}
      />
    </div>
  );
};

export default ChapterDetailPage;
