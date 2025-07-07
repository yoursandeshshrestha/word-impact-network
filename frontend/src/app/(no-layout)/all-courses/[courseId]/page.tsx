"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAutoCoursePreview } from "@/hooks/coursePreview";
import { useCourseEnrollment } from "@/hooks/useCourseEnrollment";
import { useAutoEnrolledCourses } from "@/hooks/useEnrolledCourses";
import { BookOpen, Play, ChevronRight } from "lucide-react";
import placeholderCourseImage from "@/assets/placeholder-image.png";

function CoursePreviewPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const { enroll, isLoading: isEnrolling } = useCourseEnrollment();
  const { enrolledCourses, isLoading: isLoadingEnrolled } = useAutoEnrolledCourses();

  const { coursePreview, isLoading, isError, error } =
    useAutoCoursePreview(courseId);

  // Check if user is enrolled in this course
  const isEnrolled = enrolledCourses.some(
    (enrolledCourse) => enrolledCourse.course.id === courseId
  );

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleEnroll = async () => {
    if (isEnrolled) {
      return; // Don't enroll if already enrolled
    }
    await enroll(courseId);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-800 mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Loading course preview...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-600 mb-4 text-sm">
            {error || "Failed to load course preview"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!coursePreview) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Course not found
          </h3>
          <p className="text-slate-600">
            The course you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-auto ">
      <div className="px-5 pt-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <span>Courses</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900">{coursePreview.title}</span>
        </div>

        {/* Hero Section */}
        <div className="rounded-2xl overflow-hidden mb-8 bg-gradient-to-t from-slate-950 via-black to-slate-950">
          <div className="relative h-80 flex items-end">
            <Image
              src={coursePreview.coverImageUrl || placeholderCourseImage}
              alt={coursePreview.title}
              fill
              className="object-cover opacity-50"
            />
            <div className="relative z-10 px-8 py-6 w-full">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {coursePreview.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Description */}
            <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-sm">
              <p className="text-slate-600 leading-relaxed">
                {stripHtml(coursePreview.description)}
              </p>
            </div>

            {/* Course Structure */}
            <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Course Structure
              </h2>
              <div className="space-y-4">
                {coursePreview.yearlyStructure.map((year) => (
                  <div key={year.year}>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      Year {year.year}
                    </h3>
                    {year.chapterCount === 0 ? (
                      <p className="text-slate-600 text-sm mb-6">
                        Chapters coming soon
                      </p>
                    ) : (
                      <div className="space-y-3 mb-6">
                        {year.previewChapters.map((chapter, index) => (
                          <div
                            key={chapter.id}
                            className="flex items-start gap-4 bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-600 mb-1">
                                Chapter {index + 1}
                              </h4>
                              <h5 className="text-xl font-bold text-slate-900 mb-3">
                                {chapter.title}
                              </h5>
                              <p className="text-slate-600 leading-relaxed">
                                {chapter.description}
                              </p>
                              {chapter.previewVideo && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-3">
                                    <Play className="w-4 h-4 text-slate-800" />
                                    <div>
                                      <p className="font-medium text-slate-900 text-sm">
                                        {chapter.previewVideo.title}
                                      </p>
                                      <p className="text-slate-600 text-xs">
                                        Duration:{" "}
                                        {formatDuration(
                                          chapter.previewVideo.duration
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Instructor
              </h2>
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {coursePreview.instructor}
                  </h3>
                  <p className="text-slate-600">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Course Details
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-slate-600 mb-2">Duration</h4>
                  <p className="text-slate-900 font-medium">
                    {coursePreview.durationYears} years
                  </p>
                </div>

                <div>
                  <h4 className="text-slate-600 mb-2">Total Chapters</h4>
                  <p className="text-slate-900 font-medium">
                    {coursePreview.totalChapters}
                  </p>
                </div>
              </div>

              <button
                onClick={handleEnroll}
                disabled={isEnrolling || isEnrolled || isLoadingEnrolled}
                className={`w-full text-white cursor-pointer py-3 px-6 rounded-xl transition-colors font-semibold mt-8 shadow-sm ${
                  isEnrolled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-slate-800 hover:bg-slate-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoadingEnrolled
                  ? "Loading..."
                  : isEnrolling
                  ? "Enrolling..."
                  : isEnrolled
                  ? "Enrolled"
                  : "Enroll in Course"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePreviewPage;
