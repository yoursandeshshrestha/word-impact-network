"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchPreviewCourseById,
  clearCurrentCourse,
} from "@/redux/features/publicCourses/publicCourses";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Play,
  X,
  ChevronRight,
  Award,
  Presentation,
} from "lucide-react";

interface VideoData {
  id: string;
  title: string;
  description: string;
  duration: number;
  backblazeUrl: string;
}

interface ChapterData {
  id: string;
  title: string;
  description: string;
  previewVideo?: VideoData;
}

interface YearData {
  year: number;
  chapterCount: number;
  previewChapters: ChapterData[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  coverImageUrl: string;
  totalChapters: number;
  enrollmentCount: number;
  instructor: string;
  createdAt: string;
  yearlyStructure: YearData[];
  previewChapter: ChapterData;
}

const CourseDetailPage = () => {
  const { courseid } = useParams();
  const dispatch = useAppDispatch();
  const { currentCourse, status, error } = useAppSelector(
    (state) => state.publicCourses
  );

  const [activeYear, setActiveYear] = useState<number>(1);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (courseid) {
      dispatch(fetchPreviewCourseById(courseid as string));
    }

    // Clean up on unmount
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, courseid]);

  // Helper function to format video duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleEnrollNow = () => {
    alert("You've successfully enrolled in this course!");
    // In a real implementation, you would call an API endpoint to enroll the user
  };

  const handlePlayVideo = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
    setShowVideo(true);
  };

  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideo(false);
    setCurrentVideo(null);
  };

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleCloseVideo();
      }
    };

    if (showVideo) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVideo]);

  // Get data for a specific year
  const getYearData = (yearNum: number): YearData | undefined => {
    if (!currentCourse?.yearlyStructure) return undefined;
    return currentCourse.yearlyStructure.find((year) => year.year === yearNum);
  };

  // Get color scheme for specific year
  const getYearColorScheme = (yearNum: number) => {
    const schemes = [
      { gradient: "from-[#2c3e50] to-[#1a2530]", accent: "bg-indigo-400" },
      { gradient: "from-[#7a9e7e] to-[#5a7e5e]", accent: "bg-green-300" },
      { gradient: "from-[#b7773a] to-[#915926]", accent: "bg-amber-300" },
      { gradient: "from-[#2c3e50] to-[#1a2530]", accent: "bg-indigo-400" },
    ];

    // Ensure index is between 0-3
    const index = (yearNum - 1) % 4;
    return schemes[index];
  };

  // Get year icon
  const getYearIcon = (yearNum: number) => {
    const icons = [
      <BookOpen key={1} size={24} className="text-white" />,
      <Users key={2} size={24} className="text-white" />,
      <Presentation key={3} size={24} className="text-white" />,
      <Award key={4} size={24} className="text-white" />,
    ];

    // Ensure index is between 0-3
    const index = (yearNum - 1) % 4;
    return icons[index];
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen pt-32">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="container mx-auto px-4 py-10 pt-32">
        <div className="max-w-md mx-auto text-center py-12 px-8 bg-red-50 rounded-xl border border-red-100 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Unable to Load Course
          </h3>
          <p className="text-red-600 mb-6">
            {error || "Failed to load course details. Please try again later."}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="container mx-auto px-4 py-10 pt-32">
        <div className="max-w-md mx-auto text-center py-12 px-8 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Course Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find the course you were looking for. It may have
            been moved or deleted.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const typedCourse = currentCourse as unknown as CourseData;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Video Modal */}
      {showVideo && currentVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative bg-black rounded-lg w-full max-w-5xl shadow-2xl"
          >
            <button
              onClick={handleCloseVideo}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
              <span className="sr-only">Close video</span>
            </button>
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full rounded-lg"
              src={currentVideo}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Hero Section with Parallax Effect */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={typedCourse.coverImageUrl}
            alt={typedCourse.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-gray-900/70"></div>
        </div>
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-32">
          <Link
            href="/courses"
            className="inline-flex items-center text-white/90 hover:text-white mb-8 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>

          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <span className="text-white/90 font-medium text-sm">
                {typedCourse.durationYears}-Year Program
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              {typedCourse.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
              {typedCourse.description.substring(0, 150)}
              {typedCourse.description.length > 150 ? "..." : ""}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleEnrollNow}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors flex items-center shadow-lg"
              >
                Enroll Now <ChevronRight className="w-4 h-4 ml-2" />
              </button>
              {typedCourse.previewChapter?.previewVideo && (
                <button
                  onClick={() =>
                    handlePlayVideo(
                      typedCourse.previewChapter.previewVideo!.backblazeUrl
                    )
                  }
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-medium rounded-md transition-colors flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" /> Watch Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2">
              {/* Course Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-indigo-700 mb-3" />
                    <span className="font-bold text-lg text-gray-800">
                      {typedCourse.durationYears} Years
                    </span>
                    <span className="text-gray-500 text-sm">Duration</span>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-lg">
                    <BookOpen className="w-8 h-8 text-indigo-700 mb-3" />
                    <span className="font-bold text-lg text-gray-800">
                      {typedCourse.totalChapters}
                    </span>
                    <span className="text-gray-500 text-sm">Chapters</span>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-lg">
                    <Users className="w-8 h-8 text-indigo-700 mb-3" />
                    <span className="font-bold text-lg text-gray-800">
                      {typedCourse.enrollmentCount}
                    </span>
                    <span className="text-gray-500 text-sm">Students</span>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-lg">
                    <Clock className="w-8 h-8 text-indigo-700 mb-3" />
                    <span className="font-bold text-lg text-gray-800">
                      {new Date(typedCourse.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500 text-sm">Last Updated</span>
                  </div>
                </div>
              </div>

              {/* Course Overview */}
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <div className="text-center mb-8">
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">
                    Course Overview
                  </span>
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">
                    About This Course
                  </h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {typedCourse.description}
                </p>

                {/* Preview Chapter */}
                {typedCourse.previewChapter && (
                  <div className="mt-10">
                    <div className="text-center mb-8">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">
                        Featured Preview
                      </span>
                      <h3 className="text-2xl font-bold mb-2 text-gray-800">
                        {typedCourse.previewChapter.title}
                      </h3>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        {typedCourse.previewChapter.description}
                      </p>
                    </div>

                    {typedCourse.previewChapter.previewVideo && (
                      <div className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                        <div className="aspect-video">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10"></div>
                          <Image
                            src={typedCourse.coverImageUrl}
                            alt={typedCourse.previewChapter.previewVideo.title}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() =>
                              handlePlayVideo(
                                typedCourse.previewChapter.previewVideo!
                                  .backblazeUrl
                              )
                            }
                            className="absolute inset-0 flex items-center justify-center z-20"
                          >
                            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                          <h4 className="text-xl font-bold text-white mb-2">
                            {typedCourse.previewChapter.previewVideo.title}
                          </h4>
                          <p className="text-white/80">
                            {formatDuration(
                              typedCourse.previewChapter.previewVideo.duration
                            )}{" "}
                            • Preview
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Yearly Structure */}
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <div className="text-center mb-8">
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">
                    Program Structure
                  </span>
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">
                    Course Curriculum
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Our comprehensive {typedCourse.durationYears}-year program
                    is designed to progressively build your knowledge and skills
                    through a carefully structured curriculum.
                  </p>
                </div>

                {/* Year Tabs */}
                <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                  {Array.from(
                    { length: typedCourse.durationYears },
                    (_, i) => i + 1
                  ).map((year) => (
                    <button
                      key={year}
                      onClick={() => setActiveYear(year)}
                      className={`py-3 px-6 font-medium transition-colors ${
                        activeYear === year
                          ? "border-b-2 border-indigo-700 text-indigo-700"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Year {year}
                    </button>
                  ))}
                </div>

                {/* Active Year Content */}
                <div className="mb-8">
                  {(() => {
                    const yearData = getYearData(activeYear);
                    if (!yearData) {
                      return (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">
                            No chapters available for Year {activeYear} yet.
                          </p>
                        </div>
                      );
                    }

                    if (
                      yearData.chapterCount === 0 ||
                      yearData.previewChapters.length === 0
                    ) {
                      return (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">
                            No chapters available for Year {activeYear} yet.
                          </p>
                        </div>
                      );
                    }

                    const yearColorScheme = getYearColorScheme(activeYear);

                    return (
                      <div>
                        <div
                          className={`bg-gradient-to-br ${yearColorScheme.gradient} text-white p-6 rounded-xl mb-6`}
                        >
                          <div className="flex items-center mb-4">
                            <div className="bg-white/10 p-3 rounded-full mr-4">
                              {getYearIcon(activeYear)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">
                                Year {activeYear}
                              </h3>
                              <div
                                className={`w-12 h-1 ${yearColorScheme.accent} rounded-full mt-2`}
                              ></div>
                            </div>
                          </div>
                          <p className="opacity-90">
                            {activeYear === 1
                              ? "Foundation in Biblical Studies"
                              : activeYear === 2
                              ? "Ministry Leadership Skills"
                              : activeYear === 3
                              ? "Outreach & Evangelism"
                              : "Applied Ministry & Capstone"}
                          </p>
                        </div>

                        <div className="space-y-4">
                          {yearData.previewChapters.map((chapter, index) => (
                            <div
                              key={chapter.id}
                              className="border border-gray-200 hover:border-indigo-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow transition-all p-5"
                            >
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                  <div className="flex items-center mb-2">
                                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mr-3">
                                      {index + 1}
                                    </span>
                                    <h4 className="font-semibold text-gray-800 text-lg">
                                      {chapter.title}
                                    </h4>
                                  </div>
                                  <p className="text-gray-600 ml-9">
                                    {chapter.description}
                                  </p>
                                </div>
                                {chapter.previewVideo && (
                                  <button
                                    onClick={() =>
                                      handlePlayVideo(
                                        chapter.previewVideo!.backblazeUrl
                                      )
                                    }
                                    className="flex items-center text-white bg-indigo-700 hover:bg-indigo-600 px-5 py-2 rounded-md transition-colors whitespace-nowrap ml-9 md:ml-0"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Watch Preview •{" "}
                                    {formatDuration(
                                      chapter.previewVideo.duration
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Instructor */}
              {typedCourse.instructor && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="text-center mb-8">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">
                      Meet Your Instructor
                    </span>
                    <h2 className="text-3xl font-bold mb-0 text-gray-800">
                      {typedCourse.instructor}
                    </h2>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                      <Users className="w-12 h-12 text-indigo-700" />
                    </div>
                    <p className="text-gray-600 max-w-2xl">
                      Your instructor is a highly qualified educator with
                      extensive experience in biblical studies and Christian
                      leadership development. They are committed to helping you
                      grow in your understanding of Scripture and equipping you
                      for effective ministry.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-20 p-6">
                <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">
                    Ready to Begin Your Journey?
                  </h3>
                  <p className="text-white/80 text-sm mb-0">
                    Enroll now and start your spiritual growth
                  </p>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">
                        {typedCourse.durationYears} Years
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Total Chapters:</span>
                      <span className="font-medium text-gray-900">
                        {typedCourse.totalChapters}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Enrolled Students:</span>
                      <span className="font-medium text-gray-900">
                        {typedCourse.enrollmentCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(typedCourse.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>
                        Complete {typedCourse.durationYears}-year curriculum
                      </span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Access to all course materials</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Learn from experienced instructors</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Certificate upon completion</span>
                    </li>
                  </ul>

                  <button
                    onClick={handleEnrollNow}
                    className="w-full bg-indigo-700 hover:bg-indigo-600 text-white py-3 rounded-md font-semibold text-lg transition-colors flex items-center justify-center"
                  >
                    Enroll Now <ChevronRight className="w-4 h-4 ml-2" />
                  </button>

                  <p className="text-center text-gray-500 text-sm mt-3">
                    Enrollment is free for approved students
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;
