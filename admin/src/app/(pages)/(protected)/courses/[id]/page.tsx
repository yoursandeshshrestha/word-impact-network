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
  User,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  Calendar,
  PieChart,
  GraduationCap,
  Info,
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
  const [yearFilter, setYearFilter] = useState<number | null>(null);

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

  // Filter chapters by year if yearFilter is set
  const filteredChapters = yearFilter
    ? course?.chapters?.filter((ch) => ch.courseYear === yearFilter)
    : course?.chapters;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600 animate-pulse">
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  if (!course && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center border border-gray-100">
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
            className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => router.push("/courses")}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors duration-200"
            >
              <ChevronLeft size={18} className="mr-1" />
              Back to Courses
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Edit size={16} className="mr-1.5 text-gray-500" />
                Edit
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                <Trash2 size={16} className="mr-1.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Course hero banner - improved with background image */}
      <section
        className="relative text-white py-16"
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Course preview image - in a card */}
            <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
              <div className="rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl aspect-video relative group">
                {course?.coverImageUrl ? (
                  <div className="relative">
                    <Image
                      src={course.coverImageUrl}
                      alt={course.title}
                      width={400}
                      height={225}
                      className="object-cover w-full transition-transform duration-500 group-hover:scale-105"
                      priority
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-image.jpg";
                        target.onerror = null;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center aspect-video">
                    <BookOpen size={64} className="text-white opacity-70" />
                  </div>
                )}
              </div>

              {/* Quick action buttons below the image */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => router.push(`/courses/${course?.id}/chapters`)}
                  className="flex-1 inline-flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none transition-all duration-200"
                >
                  <Plus size={18} className="mr-2" />
                  Add Chapter
                </button>
              </div>
            </div>

            {/* Course details */}
            <div className="w-full lg:w-2/3 xl:w-3/4">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    course?.isActive
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
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

                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                  <Calendar size={12} className="mr-1.5" />
                  {course?.durationYears}{" "}
                  {course?.durationYears === 1 ? "Year" : "Years"} Curriculum
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-md">
                {course?.title}
              </h1>

              {/* Course description preview */}
              <div className="bg-black/30 p-4 rounded-lg backdrop-blur-sm mb-6 mt-3">
                <p className="text-gray-300 line-clamp-3 italic">
                  {course?.description
                    ? course.description.replace(/<[^>]*>/g, "")
                    : "No description provided for this course."}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <button
                  onClick={() => router.push(`/courses/${course?.id}/chapters`)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <Plus size={18} className="mr-2" />
                  Add Chapter
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 border border-white/30 rounded-lg shadow-lg text-base font-medium text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
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
      <div className="sticky top-16 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-2">
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
              <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {course?.chapters?.length || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* About this course */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BookOpen size={20} className="text-blue-600 mr-2" />
                  About This Course
                </h2>
                <div
                  className="prose prose-lg max-w-none text-gray-700 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
                  dangerouslySetInnerHTML={{
                    __html: course?.description || "No description provided.",
                  }}
                />
              </div>

              {/* What you'll learn section */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <GraduationCap size={20} className="text-blue-600 mr-2" />
                  What Students Will Learn
                </h2>

                {course?.chapters && course.chapters.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.chapters.slice(0, 8).map((chapter) => (
                        <div
                          key={chapter.id}
                          className="flex p-3 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        >
                          <CheckCircle
                            size={20}
                            className="text-green-500 mr-3 flex-shrink-0 mt-0.5"
                          />
                          <span className="text-gray-700">{chapter.title}</span>
                        </div>
                      ))}
                    </div>

                    {course.chapters.length > 8 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab("content")}
                          className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center bg-blue-50 px-4 py-2 rounded-lg"
                        >
                          View all {course.chapters.length} chapters
                          <ArrowRight size={16} className="ml-1" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
                    <p className="flex items-center">
                      <Info size={18} className="mr-2 flex-shrink-0" />
                      No chapters added yet. Add your first chapter to start
                      building your course.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {/* Top stats section - redesigned as sidebar cards */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PieChart size={20} className="text-blue-600 mr-2" />
                  Course Details
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Calendar size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600">Duration</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {course?.durationYears}{" "}
                      {course?.durationYears === 1 ? "Year" : "Years"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <BookOpen size={16} className="text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">Chapters</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {course?.chapters?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Video size={16} className="text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-600">Videos</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {totalVideos}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3">
                        <FileText size={16} className="text-orange-600" />
                      </div>
                      <span className="text-sm text-gray-600">Exams</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {totalExams}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course creator */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User size={20} className="text-blue-600 mr-2" />
                  Course Creator
                </h3>
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-4">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {course?.createdBy?.fullName || "Unknown"}
                    </h4>
                    <p className="text-gray-600 mt-1 text-sm">
                      Created on {formatDate(course?.createdAt || "")}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Last updated on {formatDate(course?.updatedAt || "")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Chapter list header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <BookOpen size={24} className="text-blue-600 mr-2" />
                Course Content
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  {yearFilter !== null && (
                    <button
                      onClick={() => setYearFilter(null)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                    >
                      <XCircle size={12} className="mr-1" />
                      Clear filter
                    </button>
                  )}
                  <span className="text-sm text-gray-600">
                    {course?.chapters?.length || 0} chapters •{" "}
                    {course?.durationYears || 0}{" "}
                    {course?.durationYears === 1 ? "year" : "years"}
                  </span>
                </div>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  onClick={() => router.push(`/courses/${course?.id}/chapters`)}
                >
                  <Plus size={16} className="mr-1.5" />
                  Add Chapter
                </button>
              </div>
            </div>

            {/* Year filter pills - enhanced */}
            {course?.durationYears && course.durationYears > 0 ? (
              <div className="mb-6 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    Filter by year:
                  </span>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      yearFilter === null
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => setYearFilter(null)}
                  >
                    All Years
                  </button>
                  {[...Array(course.durationYears)].map((_, index) => {
                    const yearNumber = index + 1;
                    const chaptersInYear =
                      course.chapters?.filter(
                        (ch) => ch.courseYear === yearNumber
                      ) || [];

                    return (
                      <button
                        key={yearNumber}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          yearFilter === yearNumber
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setYearFilter(yearNumber)}
                      >
                        Year {yearNumber}
                        <span
                          className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                            yearFilter === yearNumber
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {chaptersInYear.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Course content by year with improved accordion style */}
            <div className="space-y-6">
              {filteredChapters && filteredChapters.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-100">
                    {filteredChapters
                      .sort((a, b) => {
                        // First sort by year
                        if (a.courseYear !== b.courseYear) {
                          return a.courseYear - b.courseYear;
                        }
                        // Then by order index
                        return a.orderIndex - b.orderIndex;
                      })
                      .map((chapter, index) => (
                        <div
                          key={chapter.id}
                          className={`transition-colors duration-150 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50`}
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
                              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg h-10 w-10 flex items-center justify-center shadow-md">
                                {chapter.orderIndex}
                              </div>
                              {yearFilter === null && (
                                <div className="mt-1 text-xs font-medium text-gray-500">
                                  Year {chapter.courseYear}
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <h4 className="font-medium text-gray-900 text-base hover:text-blue-600 flex items-center">
                                  {chapter.title}
                                </h4>
                                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                                  {chapter.videos &&
                                    chapter.videos.length > 0 && (
                                      <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                                        <Video size={12} className="mr-1" />
                                        {chapter.videos.length}
                                      </span>
                                    )}
                                  {chapter.exam && (
                                    <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                      <FileText size={12} className="mr-1" />
                                      Exam
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {chapter.description ||
                                  "No description provided."}
                              </p>
                            </div>

                            <div className="flex-shrink-0 ml-4 self-center">
                              <div className="p-2 rounded-full bg-blue-100 text-blue-600 transition-transform duration-200 transform group-hover:translate-x-1">
                                <ArrowRight size={16} />
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="bg-blue-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <BookOpen size={48} className="text-blue-600" />
                  </div>

                  {yearFilter !== null ? (
                    <>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        No Chapters in Year {yearFilter}
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        There are no chapters assigned to Year {yearFilter}. You
                        can add new chapters or try a different year filter.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <button
                          className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200"
                          onClick={() => setYearFilter(null)}
                        >
                          <ArrowRight size={16} className="mr-1.5 rotate-180" />
                          View All Years
                        </button>
                        <button
                          className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all duration-200"
                          onClick={() =>
                            router.push(`/courses/${course?.id}/chapters`)
                          }
                        >
                          <Plus size={16} className="mr-1.5" />
                          Add Chapter
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        No Chapters Yet
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Get started by creating your first chapter for this
                        course.
                      </p>
                      <button
                        className="inline-flex items-center px-5 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        onClick={() =>
                          router.push(`/courses/${course?.id}/chapters`)
                        }
                      >
                        <Plus size={18} className="mr-2" />
                        Create First Chapter
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer - New section */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                Last updated: {formatDate(course?.updatedAt || "")}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/courses")}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Back to Courses
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Edit Course
              </button>
            </div>
          </div>
        </div>
      </footer>

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
