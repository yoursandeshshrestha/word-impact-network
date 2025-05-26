"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAutoChapterDetail } from "@/redux/features/chapterDetail/useChapterDetail";
import { useAppDispatch } from "@/hooks/useReduxHooks";
import { trackVideoProgress } from "@/redux/features/chapterDetail/chapterDetailSlice";
import {
  ChevronRight,
  Play,
  Clock,
  FileText,
  CheckCircle,
  Lock,
} from "lucide-react";

interface VideoItemProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  orderIndex: number;
  backblazeUrl: string;
  isLocked: boolean;
  progress: {
    watchedPercent: number;
    isCompleted: boolean;
  };
  isCurrentlyPlaying: boolean;
  onPlayVideo: (video: {
    id: string;
    title: string;
    backblazeUrl: string;
  }) => void;
}

const VideoItem: React.FC<VideoItemProps> = ({
  id,
  title,
  description,
  duration,
  orderIndex,
  backblazeUrl,
  isLocked,
  progress,
  isCurrentlyPlaying,
  onPlayVideo,
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
      onPlayVideo({ id, title, backblazeUrl });
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
              <CheckCircle className="w-5 h-5 text-green-600" />
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
    </div>
  );
};

const ChapterDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
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
    backblazeUrl: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayVideo = (video: {
    id: string;
    title: string;
    backblazeUrl: string;
  }) => {
    setCurrentVideo(video);
    setIsPlaying(true);
  };

  const handleVideoProgress = () => {
    if (videoRef.current && currentVideo) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
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
    }
  };

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      progressIntervalRef.current = setInterval(handleVideoProgress, 10000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentVideo]);

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    handleVideoProgress();
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    handleVideoProgress();
  };

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
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br pt-10 from-slate-50 to-white overflow-auto">
      <div className="px-4 py-6">
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
              {course?.title || "Course"}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">
              {chapter
                ? `Chapter ${chapter.orderIndex}: ${chapter.title}`
                : "Loading..."}
            </span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Side - Chapter Content */}
          <div className="space-y-6">
            {/* Chapter Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                {chapter
                  ? `Chapter ${chapter.orderIndex}: ${chapter.title}`
                  : "Loading Chapter..."}
              </h1>

              <p className="text-slate-600 leading-relaxed mb-6">
                {chapter?.description || "Loading chapter description..."}
              </p>

              {/* Progress Overview */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    Chapter Progress
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {progress?.videosCompleted || 0}/
                    {progress?.totalVideos || 0} videos completed
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-700 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        progress?.totalVideos
                          ? (progress.videosCompleted / progress.totalVideos) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Videos Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Videos</h2>

              {videos && videos.length > 0 ? (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <VideoItem
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      description={video.description}
                      duration={video.duration}
                      orderIndex={video.orderIndex}
                      backblazeUrl={video.backblazeUrl}
                      isLocked={video.isLocked}
                      progress={video.progress}
                      isCurrentlyPlaying={currentVideo?.id === video.id}
                      onPlayVideo={handlePlayVideo}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎥</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    No videos available
                  </h3>
                  <p className="text-slate-600">
                    No videos available for this chapter yet
                  </p>
                </div>
              )}
            </div>

            {/* Exam Section */}
            {exam && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Exam</h2>

                <div
                  className={`rounded-xl p-6 border ${
                    exam.isLocked
                      ? "bg-slate-50 border-slate-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            exam.isLocked ? "bg-slate-200" : "bg-green-100"
                          }`}
                        >
                          {exam.isLocked ? (
                            <Lock className="w-5 h-5 text-slate-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <h3
                          className={`text-xl font-bold ${
                            exam.isLocked ? "text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {exam.title}
                        </h3>
                      </div>

                      <p
                        className={`text-sm mb-3 ml-13 leading-relaxed ${
                          exam.isLocked ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {exam.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm ml-13">
                        <div
                          className={`flex items-center space-x-1 ${
                            exam.isLocked ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span>{exam.timeLimit} minutes</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${
                            exam.isLocked ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>Passing Score: {exam.passingScore}%</span>
                        </div>
                      </div>

                      {exam.isLocked && (
                        <div className="mt-3 ml-13">
                          <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg inline-block border border-yellow-200">
                            Complete all videos to unlock the exam
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
              </div>
            )}
          </div>

          {/* Right Side - Video Player */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {currentVideo ? (
                <div className="aspect-video bg-black">
                  <video
                    ref={videoRef}
                    src={currentVideo.backblazeUrl}
                    className="w-full h-full"
                    controls
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onEnded={handleVideoEnded}
                    onTimeUpdate={handleVideoProgress}
                  />
                </div>
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
    </div>
  );
};

export default ChapterDetailPage;
