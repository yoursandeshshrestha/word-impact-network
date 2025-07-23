"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchPreviewCourseById,
  clearCurrentCourse,
  enrollInCourse,
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
  AlertTriangle,
  Loader2,
  Inbox,
} from "lucide-react";
import DOMPurify from "dompurify";
import { isAuthenticated } from "@/common/services/auth";
import { useRouter } from "next/navigation";
import placeholderCourseImage from "@/assets/placeholder-image.png";
import PaymentModal from "@/components/common/PaymentModal";

interface VideoData {
  id: string;
  title: string;
  description: string;
  duration: number;
  vimeoId: string;
  vimeoUrl: string;
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
  const router = useRouter();
  const { currentCourse, status, error } = useAppSelector(
    (state) => state.publicCourses
  );

  const [activeYear, setActiveYear] = useState<number>(1);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
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

  const handleEnrollNow = async () => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }

    if (!courseid) return;

    try {
      setIsEnrolling(true);
      await dispatch(enrollInCourse(courseid as string)).unwrap();
      // Show payment modal after successful enrollment
      setShowPaymentModal(true);
    } catch {
      // Error is already handled in Redux
    } finally {
      setIsEnrolling(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    router.push("/my-learning");
  };

  const handlePlayVideo = (videoId: string) => {
    setCurrentVideo(videoId);
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

  // Loading state
  if (status === "loading") {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen pt-32">
          <Loader2 className="w-12 h-12 text-gray-800 animate-spin" />
        </div>
      </>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <>
        <div className="container mx-auto px-4 py-16 pt-32">
          <div className="max-w-md mx-auto text-center py-12 px-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
              <AlertTriangle className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Unable to Load Course
            </h3>
            <p className="text-gray-600 mb-6">
              {error ||
                "Failed to load course details. Please try again later."}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Not found state
  if (!currentCourse) {
    return (
      <>
        <div className="container mx-auto px-4 py-16 pt-32">
          <div className="max-w-md mx-auto text-center py-12 px-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
              <Inbox className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Course Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find the course you were looking for. It may have
              been moved or deleted.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </div>
        </div>
      </>
    );
  }

  const typedCourse = currentCourse as unknown as CourseData;

  // Sanitize the HTML content using DOMPurify
  const sanitizedDescription = DOMPurify.sanitize(typedCourse.description, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "a",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Video Modal */}
      {showVideo && currentVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative bg-black rounded-lg w-full max-w-5xl shadow-lg overflow-hidden"
          >
            <button
              onClick={handleCloseVideo}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close video"
            >
              <X className="w-8 h-8" />
            </button>
            <iframe
              src={`https://player.vimeo.com/video/${currentVideo}?autoplay=1&title=0&byline=0&portrait=0&controls=1&responsive=1`}
              className="w-full rounded-lg aspect-video"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Video player"
            />
          </div>
        </div>
      )}

      {/* Hero Section - Similar to Image 1 */}
      <section className="relative h-80 md:h-96 lg:h-[42rem] flex items-center overflow-hidden ">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={typedCourse.coverImageUrl || placeholderCourseImage}
            alt={typedCourse.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-10">
          <Link
            href="/courses"
            className="inline-flex items-center text-white/90 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>

          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {typedCourse.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content Area - Similar to Image 2 */}
      <section className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
              <div className="h-1 w-24 bg-gray-800 mb-6"></div>

              <div className="prose prose-gray max-w-none">
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-3 border border-gray-200 rounded-md p-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="block text-sm text-gray-500">Duration</span>
                  <span className="font-medium text-gray-900">
                    {typedCourse.durationYears} Years
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-gray-200 rounded-md p-4">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="block text-sm text-gray-500">Chapters</span>
                  <span className="font-medium text-gray-900">
                    {typedCourse.totalChapters}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-gray-200 rounded-md p-4">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="block text-sm text-gray-500">Students</span>
                  <span className="font-medium text-gray-900">
                    {typedCourse.enrollmentCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-gray-200 rounded-md p-4">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="block text-sm text-gray-500">Updated</span>
                  <span className="font-medium text-gray-900">
                    {new Date(typedCourse.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {typedCourse.previewChapter &&
              typedCourse.previewChapter.previewVideo && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Preview
                  </h2>
                  <div className="h-1 w-24 bg-gray-800 mb-6"></div>

                  <div className="relative bg-gray-100 rounded-md overflow-hidden">
                    <div className="aspect-video">
                      <Image
                        src={typedCourse.coverImageUrl}
                        alt={typedCourse.previewChapter.previewVideo.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"></div>
                      <button
                        onClick={() =>
                          handlePlayVideo(
                            typedCourse.previewChapter.previewVideo!.vimeoId
                          )
                        }
                        className="absolute inset-0 flex items-center justify-center z-10"
                        aria-label="Play video"
                      >
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-700 transition-colors">
                          <Play className="w-6 h-6 text-white" fill="white" />
                        </div>
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <h4 className="text-lg font-bold text-white">
                        {typedCourse.previewChapter.previewVideo.title}
                      </h4>
                      <div className="flex items-center">
                        <span className="text-white/80 text-sm">
                          {formatDuration(
                            typedCourse.previewChapter.previewVideo.duration
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Curriculum Section */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Curriculum
              </h2>
              <div className="h-1 w-24 bg-gray-800 mb-6"></div>

              {/* Year Tabs */}
              <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {Array.from(
                  { length: typedCourse.durationYears },
                  (_, i) => i + 1
                ).map((year) => (
                  <button
                    key={year}
                    onClick={() => setActiveYear(year)}
                    className={`py-3 px-5 font-medium transition-colors whitespace-nowrap ${
                      activeYear === year
                        ? "border-b-2 border-gray-800 text-gray-800"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Year {year}
                  </button>
                ))}
              </div>

              {/* Active Year Content */}
              <div>
                {(() => {
                  const yearData = getYearData(activeYear);
                  if (
                    !yearData ||
                    yearData.chapterCount === 0 ||
                    yearData.previewChapters.length === 0
                  ) {
                    return (
                      <div className="text-center py-12 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-gray-600">
                          No chapters available for Year {activeYear} yet.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {yearData.previewChapters.map((chapter, index) => (
                        <div
                          key={chapter.id}
                          className="border border-gray-200 rounded-md overflow-hidden p-4 transition-all hover:border-gray-300 hover:shadow-sm"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="flex items-center mb-2">
                                <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-sm font-bold mr-3">
                                  {index + 1}
                                </div>
                                <h4 className="font-semibold text-gray-900">
                                  {chapter.title}
                                </h4>
                              </div>
                              <p className="text-gray-600 text-sm ml-10">
                                {chapter.description}
                              </p>
                            </div>
                            {chapter.previewVideo && (
                              <button
                                onClick={() =>
                                  handlePlayVideo(chapter.previewVideo!.vimeoId)
                                }
                                className="flex items-center text-gray-600 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors whitespace-nowrap"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {formatDuration(chapter.previewVideo.duration)}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Instructor */}
            {typedCourse.instructor && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Instructor
                </h2>
                <div className="h-1 w-24 bg-gray-800 mb-6"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {typedCourse.instructor}
                    </h3>
                    <p className="text-gray-600">
                      Your instructor is a highly qualified educator with
                      extensive experience in biblical studies and Christian
                      leadership development. They are committed to helping you
                      grow in your understanding of Scripture and equipping you
                      for effective ministry.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Similar to price/enroll card in Image 2 */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-md overflow-hidden sticky top-26">
              <div className="bg-gray-800 p-5 text-white">
                <h2 className="text-xl font-bold mb-1">Course Details</h2>
                <p className="text-white/80 text-sm">
                  Enroll now and start your journey
                </p>
              </div>

              <div className="p-5 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">
                      {typedCourse.durationYears} Years
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Chapters:</span>
                    <span className="font-medium text-gray-900">
                      {typedCourse.totalChapters}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Enrolled Students:</span>
                    <span className="font-medium text-gray-900">
                      {typedCourse.enrollmentCount}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Additional Information
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start text-gray-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>
                        Complete {typedCourse.durationYears}-year curriculum
                      </span>
                    </li>
                    <li className="flex items-start text-gray-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>
                        Access to all course materials, videos, and resources
                      </span>
                    </li>
                    <li className="flex items-start text-gray-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>
                        Learn from experienced instructors with real-world
                        experience
                      </span>
                    </li>
                    <li className="flex items-start text-gray-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>
                        Certificate of completion upon finishing the program.
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleEnrollNow}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-md font-semibold transition-colors flex items-center justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isAuthenticated() ? (
                    <>
                      Enroll Now <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      Login to Enroll <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>

                <p className="text-center text-gray-500 text-sm">
                  Enrollment is free for approved students
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        courseTitle={currentCourse?.title || 'Course'}
      />
    </div>
  );
};

export default CourseDetailPage;
