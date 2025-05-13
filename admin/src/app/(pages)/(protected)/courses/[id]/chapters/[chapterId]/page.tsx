"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChapter } from "@/hooks/useChapter";
import { useCourse } from "@/hooks/useCourses";
import ChapterModal from "@/components/chapter/ChapterModel";
import DeleteChapterModal from "@/components/chapter/DeleteChapterModel";
import Loading from "@/components/common/Loading";
import NoDataFound from "@/components/common/NoDataFound";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Trash2,
  Video,
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
import { ChapterFormData } from "@/components/chapter/ChapterForm";
interface ChapterDetailPageProps {
  params: {
    id: string; // courseId
    chapterId: string;
  };
}

const ChapterDetailPage: React.FC<ChapterDetailPageProps> = ({ params }) => {
  const { id: courseId, chapterId } = params;
  const router = useRouter();

  const {
    chapter,
    loading,
    error,
    success,
    message,
    fetchChapterById,
    editChapter,
    removeChapter,
    reset,
  } = useChapter();

  const { course, loading: courseLoading, fetchCourseById } = useCourse();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos"); // 'videos' or 'exam'

  useEffect(() => {
    fetchChapterById(chapterId);
    fetchCourseById(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, courseId]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);

      // If chapter was deleted, navigate back to chapters page
      if (message.toLowerCase().includes("delete")) {
        router.push(`/courses/${courseId}/chapters`);
        return;
      }

      // Close modals
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);

      // Reset status in Redux
      reset();

      // Refresh the chapter
      fetchChapterById(chapterId);
    }

    if (error) {
      toast.error(error);
      reset();
    }
  }, [
    success,
    message,
    error,
    reset,
    courseId,
    chapterId,
    fetchChapterById,
    router,
  ]);

  const handleEditChapter = (chapterData: ChapterFormData) => {
    if (chapter) {
      editChapter(chapterId, chapterData);
    }
  };

  const handleDeleteChapter = () => {
    if (chapter) {
      removeChapter(chapterId);
    }
  };

  const handleAddVideo = () => {
    // Will be implemented later
    toast.info("Video upload functionality will be implemented soon");
  };

  const handleAddExam = () => {
    // Will be implemented later
    toast.info("Exam creation functionality will be implemented soon");
  };

  if (loading || courseLoading) {
    return <Loading />;
  }

  if (error || !chapter) {
    return (
      <NoDataFound message="Chapter not found or you don't have access to it." />
    );
  }

  const videoCount = chapter.videos?.length || 0;
  const hasExam = !!chapter.exam;

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
                  <Video size={12} className="mr-1" />
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

              <p className="text-gray-600 mb-4">{chapter.description}</p>

              <div className="flex items-center text-sm text-gray-500">
                <Clock size={14} className="mr-1" />
                Created {formatDate(chapter.createdAt)}
              </div>
            </div>

            <div className="flex md:flex-col gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
              >
                <Edit size={16} className="mr-2" />
                Edit Chapter
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer transition-colors duration-200"
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
              <Video size={16} className="mr-2" />
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
                  <Video size={18} className="mr-2 text-indigo-600" />
                  Videos
                </h2>
                <button
                  onClick={handleAddVideo}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Video
                </button>
              </div>

              {videoCount === 0 ? (
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
                // Video list will be implemented later
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Video size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Video management functionality will be implemented soon.
                  </p>
                </div>
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
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Create Exam
                  </button>
                )}
              </div>

              {!hasExam ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <MessageCircle
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Exam Created Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create an exam to test students&apos; knowledge after
                    completing this chapter.
                  </p>
                  <button
                    onClick={handleAddExam}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
                  >
                    <Award size={16} className="mr-2" />
                    Create Exam
                  </button>
                </div>
              ) : (
                // Exam management will be implemented later
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Award size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Exam management functionality will be implemented soon.
                  </p>
                </div>
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
        isLoading={loading}
        mode="edit"
      />

      {/* Delete Chapter Modal */}
      <DeleteChapterModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteChapter}
        title={chapter.title}
        isLoading={loading}
      />
    </div>
  );
};

export default ChapterDetailPage;
