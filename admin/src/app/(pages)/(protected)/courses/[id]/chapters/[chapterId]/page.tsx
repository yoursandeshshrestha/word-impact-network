"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChapter } from "@/hooks/useChapter";
import { useCourse } from "@/hooks/useCourses";
import { useVideo } from "@/hooks/useVideo";
import { useExam } from "@/hooks/useExam";
import { Video as VideoIcon } from "lucide-react";
import ChapterModal from "@/components/chapter/ChapterModel";
import DeleteChapterModal from "@/components/chapter/DeleteChapterModel";
import VideoModal from "@/components/videos/VideoModel";
import DeleteVideoModal from "@/components/videos/DeleteVideoModal";
import VimeoPlayer from "@/components/videos/VimeoPlayer";
import VideoCard from "@/components/videos/VideoCard";
import Loading from "@/components/common/Loading";
import NoDataFound from "@/components/common/NoDataFound";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Trash2,
  Award,
  Calendar,
  Hash,
  PlusCircle,
  Play,
  MessageCircle,
  FilePlus,
  Clock,
} from "lucide-react";
import { formatDate } from "@/utils/formatters";
import Link from "next/link";
import { Chapter } from "@/redux/features/chaptersSlice";
import { Video as VideoType } from "@/redux/features/videosSlice";
import { Exam } from "@/redux/features/examsSlice";

interface ChapterDetailPageProps {
  params: Promise<{
    id: string; // courseId
    chapterId: string;
  }>;
}

// Define ChapterFormData type
interface ChapterFormData {
  title: string;
  description: string;
  courseYear: number;
  orderIndex: number;
}

// Ensure the chapter object includes an exam property of type Exam
interface ChapterWithExam extends Chapter {
  exam?: Exam;
}

const ChapterDetailPage: React.FC<ChapterDetailPageProps> = ({ params }) => {
  const unwrappedParams = React.use(params);
  const { id: courseId, chapterId } = unwrappedParams;
  const router = useRouter();

  const {
    chapter,
    chapters: allChapters,
    loading: chapterLoading,
    error: chapterError,
    success: chapterSuccess,
    message: chapterMessage,
    fetchChapterById,
    fetchChaptersByCourse,
    editChapter,
    removeChapter,
    reset: resetChapter,
  } = useChapter() as {
    chapter: ChapterWithExam;
    chapters: Chapter[];
    loading: boolean;
    error: string | null;
    success: boolean;
    message: string;
    fetchChapterById: (id: string) => void;
    fetchChaptersByCourse: (courseId: string) => void;
    editChapter: (id: string, data: ChapterWithExam) => void;
    removeChapter: (id: string) => void;
    reset: () => void;
  };

  const { course, loading: courseLoading, fetchCourseById } = useCourse();

  const {
    videos,
    loading: videoLoading,
    error: videoError,
    success: videoSuccess,
    message: videoMessage,
    uploadProgress,
    isUploading,
    shouldCloseModal,
    shouldCloseDeleteModal,
    fetchVideosByChapter,
    uploadVideo,
    uploadVideoWithVimeo,
    editVideo,
    removeVideo,
    reset: resetVideo,
    resetStatusOnly,
    clearVideosList,
    closeModal,
    closeDeleteModal,
  } = useVideo();

  const {
    loading: examLoading,
    error: examError,
    success: examSuccess,
    message: examMessage,
    createNewExam,
    removeExam,
    reset: resetExam,
  } = useExam();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos"); // 'videos' or 'exam'

  // Video-specific state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isDeleteVideoModalOpen, setIsDeleteVideoModalOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<VideoType | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [videoToPlay, setVideoToPlay] = useState<VideoType | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  useEffect(() => {
    fetchChapterById(chapterId);
    fetchCourseById(courseId);
    fetchVideosByChapter(chapterId);
    fetchChaptersByCourse(courseId);

    // Cleanup when component unmounts
    return () => {
      clearVideosList();
      closeModal();
      closeDeleteModal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, courseId]);

  useEffect(() => {
    // Handle chapter-related success/error
    if (chapterSuccess && chapterMessage) {
      toast.success(chapterMessage);

      // If chapter was deleted, navigate back to chapters page
      if (chapterMessage.toLowerCase().includes("delete")) {
        router.push(`/courses/${courseId}/chapters`);
        return;
      }

      // Close modals
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);

      // Reset status in Redux
      resetChapter();

      // Refresh the chapter
      fetchChapterById(chapterId);
    }

    if (chapterError) {
      toast.error(chapterError);
      resetChapter();
    }

    // Handle video-related success/error
    if (videoSuccess && videoMessage) {
      toast.success(videoMessage);
      // Don't reset immediately - let the modal close first
      // The video is already in Redux state
    }

    if (videoError) {
      toast.error(videoError);
      resetVideo();
    }

    // Handle exam-related success/error
    if (examSuccess && examMessage) {
      toast.success(examMessage);
      resetExam();

      // Refresh the chapter to get the updated exam status
      fetchChapterById(chapterId);
    }

    if (examError) {
      toast.error(examError);
      resetExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chapterSuccess,
    chapterMessage,
    chapterError,
    videoSuccess,
    videoMessage,
    videoError,
    examSuccess,
    examMessage,
    examError,
    resetChapter,
    resetExam,
    courseId,
    chapterId,
    fetchChapterById,
    router,
  ]);

  // Handle modal closing based on Redux state
  useEffect(() => {
    if (shouldCloseModal) {
      setIsVideoModalOpen(false);
      setVideoToEdit(null);
      setIsVideoUploading(false);
      closeModal();
      // Reset only status flags, not the videos array
      resetStatusOnly();
    }
  }, [shouldCloseModal, closeModal, resetStatusOnly]);

  // Handle delete modal closing based on Redux state
  useEffect(() => {
    if (shouldCloseDeleteModal) {
      setIsDeleteVideoModalOpen(false);
      setVideoToDelete(null);
      closeDeleteModal();
      // Reset only status flags, not the videos array
      resetStatusOnly();
    }
  }, [shouldCloseDeleteModal, closeDeleteModal, resetStatusOnly]);

  const handleEditChapter = (chapterData: ChapterFormData) => {
    if (chapter) {
      const updatedChapter: ChapterWithExam = {
        ...chapter,
        ...chapterData,
      };
      editChapter(chapterId, updatedChapter);
    }
  };

  const handleDeleteChapter = () => {
    if (chapter) {
      removeChapter(chapterId);
    }
  };

  // Video management handlers
  const handleAddVideo = () => {
    setVideoToEdit(null);
    setIsVideoModalOpen(true);
  };

  const handleEditVideo = (video: VideoType) => {
    setVideoToEdit(video);
    setIsVideoModalOpen(true);
  };

  const handleDeleteVideo = (id: string) => {
    const video = videos.find((v) => v.id === id);
    if (video) {
      setVideoToDelete({ id, title: video.title });
      setIsDeleteVideoModalOpen(true);
    }
  };

  const handlePlayVideo = (video: VideoType) => {
    setVideoToPlay(video);
    setIsVideoPlayerOpen(true);
  };

  const handleUploadVideo = (formData: FormData) => {
    // Check if this is a direct-to-Vimeo upload (has vimeoId)
    const vimeoId = formData.get("vimeoId");
    if (vimeoId) {
      uploadVideoWithVimeo(chapterId, formData);
    } else {
      uploadVideo(chapterId, formData);
    }
  };

  const handleUpdateVideo = (formData: FormData) => {
    if (videoToEdit) {
      editVideo(videoToEdit.id, formData);
    }
  };

  const handleDeleteVideoConfirm = () => {
    if (videoToDelete) {
      removeVideo(videoToDelete.id);
    }
  };

  // Exam management handlers
  const handleAddExam = () => {
    // Create a basic exam with default values
    createNewExam(chapterId, {
      title: `${chapter?.title || "Chapter"} Exam`,
      description: `Exam for ${chapter?.title || "this chapter"}`,
      timeLimit: 60, // Default time limit in minutes
    });
  };

  if (chapterLoading || courseLoading) {
    return <Loading />;
  }

  if (chapterError || !chapter) {
    return (
      <NoDataFound message="Chapter not found or you don't have access to it." />
    );
  }

  const videoCount = videos.length;
  const hasExam = !!chapter.exam;

  // Debug logging

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href={`/courses/${courseId}/chapters`}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Chapters
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <BookOpen size={24} className="mr-2 text-indigo-600" />
                {chapter.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Calendar size={12} className="mr-1" />
                  Year {chapter.courseYear}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Hash size={12} className="mr-1" />
                  Order {chapter.orderIndex}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <VideoIcon size={12} className="mr-1" />
                  {videoCount} Video{videoCount !== 1 ? "s" : ""}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    hasExam
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <Award size={12} className="mr-1" />
                  {hasExam ? "Has Exam" : "No Exam"}
                </span>
              </div>

              <p className="text-gray-600 mb-4 w-[80%]">
                {chapter.description}
              </p>

              <div className="flex items-center text-sm text-gray-500">
                <Clock size={14} className="mr-1" />
                Created {formatDate(chapter.createdAt)}
              </div>
            </div>

            <div className="flex md:flex-col gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <Edit size={16} className="mr-2" />
                Edit Chapter
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Chapter
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("videos")}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "videos"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              } cursor-pointer transition-colors duration-200`}
            >
              <VideoIcon size={16} className="mr-2" />
              Videos
            </button>
            <button
              onClick={() => setActiveTab("exam")}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "exam"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              } cursor-pointer transition-colors duration-200`}
            >
              <Award size={16} className="mr-2" />
              Exam
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "videos" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <VideoIcon size={18} className="mr-2 text-indigo-600" />
                  Videos
                </h2>
                <button
                  onClick={handleAddVideo}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
                  disabled={isUploading}
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Video
                </button>
              </div>

              {videoLoading && <Loading />}

              {!videoLoading && videoCount === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Play size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Videos Added Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start adding videos to this chapter for students to learn
                    from.
                  </p>
                  <button
                    onClick={handleAddVideo}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
                  >
                    <FilePlus size={16} className="mr-2" />
                    Upload Your First Video
                  </button>
                </div>
              ) : (
                !videoLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...videos]
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((video) => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          onEdit={handleEditVideo}
                          onDelete={handleDeleteVideo}
                          onPlay={handlePlayVideo}
                        />
                      ))}
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "exam" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Award size={18} className="mr-2 text-indigo-600" />
                  Exam
                </h2>
                {!hasExam && (
                  <button
                    onClick={handleAddExam}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
                    disabled={examLoading}
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Create Exam
                  </button>
                )}
              </div>

              {examLoading && <Loading />}

              {!examLoading && !hasExam ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <MessageCircle
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Exam Created Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create an exam to test students knowledge after completing
                    this chapter.
                  </p>
                  <button
                    onClick={handleAddExam}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
                    disabled={examLoading}
                  >
                    <Award size={16} className="mr-2" />
                    Create Exam
                  </button>
                </div>
              ) : (
                !examLoading &&
                hasExam && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {chapter.exam?.title || "Chapter Exam"}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {chapter.exam?.description ||
                            "Test your knowledge of this chapter"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Clock size={12} className="mr-1" />
                            {chapter.exam?.timeLimit
                              ? `${chapter.exam.timeLimit} minutes`
                              : "No time limit"}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Passing Score: {chapter.exam?.passingScore || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/courses/${courseId}/chapters/${chapterId}/exam/${chapter.exam?.id}`
                            )
                          }
                          className="inline-flex items-center px-3 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
                        >
                          <Award size={16} className="mr-2" />
                          Manage Exam
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>
                          {chapter.exam?.questions?.length || 0} question
                          {(chapter.exam?.questions?.length || 0) !== 1
                            ? "s"
                            : ""}
                        </span>
                        <button
                          onClick={() => {
                            if (chapter.exam) {
                              removeExam(chapter.exam.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 inline-flex items-center cursor-pointer transition-colors duration-200"
                          disabled={examLoading}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete Exam
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Chapter Modal */}
      <ChapterModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditChapter}
        initialData={chapter}
        courseId={courseId}
        maxCourseYears={course?.durationYears || 1}
        isLoading={chapterLoading}
        mode="edit"
        existingChapters={allChapters.map((chapter) => ({
          orderIndex: chapter.orderIndex,
          courseYear: chapter.courseYear,
        }))}
      />

      {/* Delete Chapter Modal */}
      <DeleteChapterModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteChapter}
        title={chapter.title}
        isLoading={chapterLoading}
      />

      {/* Video Modal (Add/Edit) */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setVideoToEdit(null);
        }}
        onSubmit={videoToEdit ? handleUpdateVideo : handleUploadVideo}
        initialData={
          videoToEdit
            ? {
                title: videoToEdit.title,
                description: videoToEdit.description,
                orderIndex: videoToEdit.orderIndex,
              }
            : null
        }
        isLoading={videoLoading}
        uploadProgress={uploadProgress}
        isUploading={isUploading || isVideoUploading}
        mode={videoToEdit ? "edit" : "create"}
        onUploadStateChange={setIsVideoUploading}
        existingVideos={videos}
      />

      {/* Delete Video Modal */}
      <DeleteVideoModal
        isOpen={isDeleteVideoModalOpen}
        onClose={() => setIsDeleteVideoModalOpen(false)}
        onConfirm={handleDeleteVideoConfirm}
        title={videoToDelete?.title || ""}
        isLoading={videoLoading}
      />

      {/* Video Player */}
      {isVideoPlayerOpen && videoToPlay && (
        <VimeoPlayer
          video={videoToPlay}
          onClose={() => {
            setIsVideoPlayerOpen(false);
            setVideoToPlay(null);
          }}
        />
      )}
    </div>
  );
};

export default ChapterDetailPage;
