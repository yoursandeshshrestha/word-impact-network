"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCourse } from "@/hooks/useCourses";
import Loading from "@/components/common/Loading";
import { formatDate } from "@/utils/formatters";
import CourseModal from "@/components/courses/CoursesModel";
import DeleteCourseModal from "@/components/courses/DeleteCoursesModel";
import Image from "next/image";
import { toast } from "sonner";
import {
  ChevronLeft,
  Edit,
  Trash2,
  BookOpen,
  Video,
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
} from "lucide-react";

interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ params }) => {
  const { id } = params;
  const router = useRouter();

  const {
    course,
    loading,
    error,
    success,
    message,
    fetchCourseById,
    editCourse,
    removeCourse,
    reset,
  } = useCourse();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "content">(
    "overview"
  );

  useEffect(() => {
    fetchCourseById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);

      // Close modals
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);

      // Reset status in Redux
      reset();
    }

    if (error) {
      toast.error(error);
      reset();
    }
  }, [success, message, error, reset]);

  const handleEditCourse = (formData: FormData) => {
    if (course) {
      editCourse(course.id, formData);
    }
  };

  const handleDeleteCourse = () => {
    if (course) {
      removeCourse(course.id);
      // Navigate back to courses page after deletion
      router.push("/courses");
    }
  };

  // Count total videos
  const totalVideos =
    course?.chapters?.reduce(
      (total, chapter) => total + (chapter.videos?.length || 0),
      0
    ) || 0;

  // Count total exams
  const totalExams =
    course?.chapters?.reduce(
      (total, chapter) => total + (chapter.exam ? 1 : 0),
      0
    ) || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loading />
      </div>
    );
  }

  if (!course && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-50 text-red-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Course Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The course you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={() => router.push("/courses")}
            className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="p-6 flex justify-between items-center">
          <button
            onClick={() => router.push("/courses")}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none transition-colors duration-200"
          >
            <ChevronLeft size={18} className="mr-1" />
            Back to Courses
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <Edit size={16} className="mr-1.5" />
              Edit
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <Trash2 size={16} className="mr-1.5" />
              Delete
            </button>
          </div>
        </div>
      </header>

      {/* Course hero banner - improved with background image */}
      <section
        className="relative text-white pb-6"
        style={{
          backgroundImage: `url(${
            course?.coverImageUrl || "/placeholder-image.jpg"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/50 z-0"></div>

        <div className="p-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Course preview image - in a card */}
            <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
              <div className="rounded-lg overflow-hidden border-4 border-white/20 shadow-2xl aspect-video relative">
                {course?.coverImageUrl ? (
                  <Image
                    src={course.coverImageUrl}
                    alt={course.title}
                    width={400}
                    height={225}
                    className="object-cover w-full"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-image.jpg";
                      target.onerror = null;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center aspect-video">
                    <BookOpen size={64} className="text-white opacity-70" />
                  </div>
                )}
              </div>
            </div>

            {/* Course details */}
            <div className="w-full lg:w-2/3 xl:w-3/4">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    course?.isActive
                      ? "bg-green-500/90 text-white"
                      : "bg-red-500/90 text-white"
                  }`}
                >
                  {course?.isActive ? (
                    <>
                      <CheckCircle size={12} className="mr-1.5" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle size={12} className="mr-1.5" />
                      Inactive
                    </>
                  )}
                </span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/90 text-white">
                  <Clock size={12} className="mr-1.5" />
                  {course?.durationYears}{" "}
                  {course?.durationYears === 1 ? "Year" : "Years"} Curriculum
                </span>

                <span className="text-xs text-gray-300 font-medium ml-auto">
                  Last updated: {formatDate(course?.updatedAt || "")}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-md">
                {course?.title}
              </h1>

              <p className="text-gray-100 mb-6 text-lg max-w-3xl leading-relaxed drop-shadow-sm line-clamp-3 md:line-clamp-none">
                {course?.description}
              </p>

              <div className="w-fit flex flex-wrap items-center gap-6 mb-6 bg-black/30 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <User size={20} className="text-blue-300 mr-2" />
                  <span className="text-gray-100">
                    Created by{" "}
                    <span className="text-white font-medium">
                      {course?.createdBy?.fullName || "Unknown"}
                    </span>
                  </span>
                </div>

                <div className="flex items-center">
                  <Calendar size={20} className="text-blue-300 mr-2" />
                  <span className="text-gray-100">
                    {formatDate(course?.createdAt || "")}
                  </span>
                </div>

                <div className="flex items-center">
                  <BookOpen size={20} className="text-blue-300 mr-2" />
                  <span className="text-gray-100">
                    <span className="text-white font-medium">
                      {course?.chapters?.length || 0}
                    </span>{" "}
                    Chapters
                  </span>
                </div>

                <div className="flex items-center">
                  <Video size={20} className="text-blue-300 mr-2" />
                  <span className="text-gray-100">
                    <span className="text-white font-medium">
                      {totalVideos}
                    </span>{" "}
                    Videos
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={() => router.push(`/courses/${course?.id}/chapters`)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <Plus size={18} className="mr-2" />
                  Add Chapter
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 border border-white/30 rounded-md shadow-lg text-base font-medium text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <Edit size={18} className="mr-2" />
                  Edit Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content tabs and navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex items-center ${
                activeTab === "content"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Course Content
              <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {course?.chapters?.length || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "overview" ? (
          <div className="max-w-4xl">
            {/* Top stats section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Clock size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Course Duration
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {course?.durationYears}{" "}
                  {course?.durationYears === 1 ? "Year" : "Years"}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <BookOpen size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Total Chapters
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {course?.chapters?.length || 0}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <div className="bg-purple-100 p-3 rounded-full mb-4">
                  <Video size={24} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Learning Materials
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {totalVideos}{" "}
                  <span className="text-sm font-normal">Videos</span> •{" "}
                  {totalExams}{" "}
                  <span className="text-sm font-normal">Exams</span>
                </p>
              </div>
            </div>

            {/* About this course */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About This Course
              </h2>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-line leading-relaxed">
                  {course?.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* What you'll learn section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                What You&apos;ll Learn
              </h2>

              {course?.chapters && course.chapters.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.chapters.slice(0, 6).map((chapter) => (
                      <div key={chapter.id} className="flex">
                        <CheckCircle
                          size={20}
                          className="text-green-500 mr-3 flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700">{chapter.title}</span>
                      </div>
                    ))}
                  </div>

                  {course.chapters.length > 6 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setActiveTab("content")}
                        className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
                      >
                        See more chapters
                        <ArrowRight size={16} className="ml-1" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">
                  No chapters added yet. Add your first chapter to start
                  building your course.
                </p>
              )}
            </div>

            {/* Course creator */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Course Creator
              </h2>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-4">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {course?.createdBy?.fullName || "Unknown"}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Created on {formatDate(course?.createdAt || "")}
                  </p>
                  <p className="text-gray-600">
                    Last updated on {formatDate(course?.updatedAt || "")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl">
            {/* Chapter list header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Course Content
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {course?.chapters?.length || 0} chapters •{" "}
                  {course?.durationYears || 0}{" "}
                  {course?.durationYears === 1 ? "year" : "years"} of curriculum
                </span>
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  onClick={() => router.push(`/courses/${course?.id}/chapters`)}
                >
                  <Plus size={16} className="mr-1.5" />
                  Add Chapter
                </button>
              </div>
            </div>

            {/* Year navigation */}
            {course?.durationYears &&
            course.durationYears > 0 &&
            course?.chapters &&
            course.chapters.length > 0 ? (
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    Jump to year:
                  </span>
                  {[...Array(course.durationYears)].map((_, index) => {
                    const yearNumber = index + 1;
                    const chaptersInYear =
                      course.chapters?.filter(
                        (ch) => ch.courseYear === yearNumber
                      ) || [];

                    return (
                      <button
                        key={yearNumber}
                        className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                        onClick={() => {
                          document
                            .getElementById(`year-${yearNumber}`)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }}
                      >
                        Year {yearNumber}
                        <span className="ml-1.5 bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-xs">
                          {chaptersInYear.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Course content by year with accordion style */}
            <div className="space-y-6">
              {[...Array(course?.durationYears)].map((_, yearIndex) => {
                const yearNumber = yearIndex + 1;
                const chaptersInYear =
                  course?.chapters?.filter(
                    (ch) => ch.courseYear === yearNumber
                  ) || [];

                if (chaptersInYear.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={yearNumber}
                    id={`year-${yearNumber}`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        Year {yearNumber}
                        <span className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs">
                          {chaptersInYear.length}{" "}
                          {chaptersInYear.length === 1 ? "chapter" : "chapters"}
                        </span>
                      </h3>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {chaptersInYear
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((chapter) => (
                          <div
                            key={chapter.id}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <button
                              className="w-full p-4 flex items-start text-left"
                              onClick={() =>
                                router.push(
                                  `/courses/${course?.id}/chapters/${chapter.id}`
                                )
                              }
                            >
                              <div className="flex-shrink-0 mr-4 flex flex-col items-center">
                                <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center">
                                  {chapter.orderIndex}
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                  <h4 className="font-medium text-gray-900 text-base group-hover:text-blue-600 flex items-center">
                                    {chapter.title}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-2 md:mt-0">
                                    {chapter.videos &&
                                      chapter.videos.length > 0 && (
                                        <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          <Video size={12} className="mr-1" />
                                          {chapter.videos.length}{" "}
                                          {chapter.videos.length === 1
                                            ? "video"
                                            : "videos"}
                                        </span>
                                      )}
                                    {chapter.exam && (
                                      <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                        <FileText size={12} className="mr-1" />
                                        Exam
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {chapter.description}
                                </p>
                              </div>

                              <div className="flex-shrink-0 ml-4 self-center">
                                <ArrowRight
                                  size={16}
                                  className="text-gray-400"
                                />
                              </div>
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state for no chapters */}
            {(!course?.chapters || course.chapters.length === 0) && (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-lg shadow-sm">
                <BookOpen size={64} className="text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  No Chapters Yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Get started by creating your first chapter for this course.
                </p>
                <button
                  className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  onClick={() => router.push(`/courses/${course?.id}/chapters`)}
                >
                  <Plus size={18} className="mr-2" />
                  Create First Chapter
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Course Modal */}
      {course && (
        <CourseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditCourse}
          initialData={course}
          isLoading={loading}
          mode="edit"
        />
      )}

      {/* Delete Course Modal */}
      {course && (
        <DeleteCourseModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteCourse}
          title={course.title}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;
