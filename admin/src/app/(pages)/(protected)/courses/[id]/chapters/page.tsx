"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChapter } from "@/hooks/useChapter";
import { useCourse } from "@/hooks/useCourses";
import { Chapter } from "@/redux/features/chaptersSlice";
import ChapterList from "@/components/chapter/ChapterList";
import ChapterModal from "@/components/chapter/ChapterModel";
import DeleteChapterModal from "@/components/chapter/DeleteChapterModel";
import Loading from "@/components/common/Loading";
import NoDataFound from "@/components/common/NoDataFound";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, PlusCircle } from "lucide-react";
import { ChapterFormData } from "@/components/chapter/ChapterForm";

interface ChaptersPageProps {
  params: {
    id: string; // courseId
  };
}

const ChaptersPage: React.FC<ChaptersPageProps> = ({ params }) => {
  const { id: courseId } = params;
  const router = useRouter();

  const {
    chapters,
    loading,
    error,
    success,
    message,
    fetchChaptersByCourse,
    addChapter,
    editChapter,
    removeChapter,
    reset,
  } = useChapter();

  const {
    course,
    loading: courseLoading,
    error: courseError,
    fetchCourseById,
  } = useCourse();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetchCourseById(courseId);
    fetchChaptersByCourse(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);

      // Close modals and reset states
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedChapter(null);
      setChapterToDelete(null);

      // Reset status in Redux
      reset();

      // Refresh the chapters list
      fetchChaptersByCourse(courseId);
    }

    if (error) {
      toast.error(error);
      reset();
    }
  }, [success, message, error, reset, courseId, fetchChaptersByCourse]);

  const handleCreateChapter = (chapterData: ChapterFormData) => {
    addChapter(courseId, chapterData);
  };

  const handleEditChapter = (chapterData: ChapterFormData) => {
    if (selectedChapter) {
      editChapter(selectedChapter.id, chapterData);
    }
  };

  const handleDeleteChapter = () => {
    if (chapterToDelete) {
      removeChapter(chapterToDelete.id);
    }
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const openEditModal = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    const chapter = chapters.find((c) => c.id === id);
    if (chapter) {
      setChapterToDelete({ id, title: chapter.title });
      setIsDeleteModalOpen(true);
    }
  };

  if (courseLoading || (loading && chapters.length === 0)) {
    return <Loading />;
  }

  if (courseError || !course) {
    return (
      <NoDataFound message="Course not found or you don't have access to it." />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Course
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <BookOpen size={24} className="mr-2 text-indigo-600" />
          {course.title}: Chapters
        </h1>
        <p className="text-gray-600 mb-4">
          Manage the chapters for this course. A course can have multiple
          chapters organized by year and order.
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Course Duration:</span>{" "}
            {course.durationYears} year{course.durationYears !== 1 ? "s" : ""}
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
          >
            <PlusCircle size={16} className="mr-2" />
            Create Chapter
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <ChapterList
          chapters={chapters}
          courseId={courseId}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      )}

      {/* Create Chapter Modal */}
      <ChapterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateChapter}
        initialData={null}
        courseId={courseId}
        maxCourseYears={course.durationYears}
        isLoading={loading}
        mode="create"
      />

      {/* Edit Chapter Modal */}
      <ChapterModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditChapter}
        initialData={selectedChapter}
        courseId={courseId}
        maxCourseYears={course.durationYears}
        isLoading={loading}
        mode="edit"
      />

      {/* Delete Chapter Modal */}
      <DeleteChapterModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteChapter}
        title={chapterToDelete?.title || ""}
        isLoading={loading}
      />
    </div>
  );
};

export default ChaptersPage;
