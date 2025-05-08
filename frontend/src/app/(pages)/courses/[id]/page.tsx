"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLoading } from "@/common/contexts/LoadingContext";

interface Video {
  id: string;
  title: string;
  description: string;
  backblazeUrl: string; // Updated to match API response
  duration: number;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  passingScore: number;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseYear: number;
  courseId: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  videos: Video[];
  exam: Exam | null;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  coverImageUrl: string;
  isActive: boolean;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    fullName: string;
  };
  chapters: Chapter[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number>(1);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) {
        console.error("No courseId found in params:", params);
        setError("Course ID is missing");
        setLoading(false);
        return;
      }

      console.log("Fetching course with ID:", courseId);

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/v1/courses/${courseId}`
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch course details: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("API response:", responseData);

        if (!responseData.data) {
          throw new Error("No data returned from API");
        }

        setCourse(responseData.data);

        // Find the first video to set as initially selected video
        const firstChapterWithVideos = responseData.data.chapters.find(
          (chapter: Chapter) => chapter.videos && chapter.videos.length > 0
        );

        if (
          firstChapterWithVideos &&
          firstChapterWithVideos.videos.length > 0
        ) {
          setSelectedVideo(firstChapterWithVideos.videos[0]);
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId, params, setLoading]);

  // Format video duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Play selected video
  const playVideo = (video: Video) => {
    setSelectedVideo(video);

    // Give time for the video element to update before attempting to play
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      }
    }, 100);
  };

  console.log("Current state:", {
    error,
    course,
    courseId,
    selectedVideo,
  });

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <div className="mt-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              onClick={() => router.push("/courses")}
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Course not found</h2>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            onClick={() => router.push("/courses")}
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Group chapters by year
  const chaptersByYear: Record<number, Chapter[]> = {};

  // Initialize each year with an empty array
  for (let year = 1; year <= course.durationYears; year++) {
    chaptersByYear[year] = [];
  }

  // Add chapters to their respective years
  if (course.chapters && Array.isArray(course.chapters)) {
    course.chapters.forEach((chapter) => {
      const year = chapter.courseYear || 1; // Default to year 1 if not specified
      if (!chaptersByYear[year]) {
        chaptersByYear[year] = [];
      }
      chaptersByYear[year].push(chapter);
    });
  }

  // Sort chapters by orderIndex within each year
  Object.keys(chaptersByYear).forEach((year) => {
    chaptersByYear[Number(year)].sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    );
  });

  // Calculate total videos count across all chapters
  const totalVideos = course.chapters.reduce(
    (total, chapter) => total + (chapter.videos ? chapter.videos.length : 0),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/courses">
        <span className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg
            className="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
          Back to Courses
        </span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Course details and video player */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {selectedVideo ? (
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <video
                  ref={videoRef}
                  className="absolute top-0 left-0 w-full h-full bg-black"
                  src={selectedVideo.backblazeUrl}
                  poster={course.coverImageUrl}
                  controls
                ></video>
              </div>
            ) : (
              <div className="relative h-64 lg:h-96 w-full">
                {course.coverImageUrl ? (
                  <Image
                    src={course.coverImageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-course.jpg";
                    }}
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
            )}

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
                  {selectedVideo ? selectedVideo.title : course.title}
                </h1>
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded self-start sm:self-auto">
                  {course.durationYears}{" "}
                  {course.durationYears === 1 ? "year" : "years"} course
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">
                  Created by{" "}
                  {course.createdBy?.fullName || "Unknown instructor"}
                </p>
                <p className="text-gray-600">
                  {selectedVideo
                    ? selectedVideo.description
                    : course.description}
                </p>
              </div>

              {selectedVideo && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h2 className="text-xl font-semibold mb-2">
                    About this video
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Duration: {formatDuration(selectedVideo.duration)}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Added:{" "}
                      {new Date(selectedVideo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Course content and video list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Course Content</h2>
              <p className="text-sm text-gray-600 mt-1">
                {course.chapters.length} chapters • {totalVideos} videos
              </p>
            </div>

            {/* Year navigation tabs */}
            {course.durationYears > 1 && (
              <div className="flex flex-wrap border-b border-gray-200">
                {Array.from({ length: course.durationYears }).map((_, idx) => {
                  const year = idx + 1;
                  return (
                    <button
                      key={year}
                      className={`py-2 px-4 font-medium text-sm ${
                        activeYear === year
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveYear(year)}
                    >
                      Year {year}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Chapters accordion with videos */}
            <div className="max-h-[600px] overflow-y-auto">
              {chaptersByYear[activeYear]?.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {chaptersByYear[activeYear].map((chapter) => (
                    <div key={chapter.id} className="py-2 px-4">
                      <h3 className="text-md font-medium text-gray-800 py-2">
                        {chapter.title}
                      </h3>

                      {/* Videos list */}
                      {chapter.videos && chapter.videos.length > 0 ? (
                        <ul className="space-y-2 pl-4 mt-2">
                          {chapter.videos.map((video) => (
                            <li
                              key={video.id}
                              className={`flex items-start rounded-md p-2 cursor-pointer transition-colors ${
                                selectedVideo?.id === video.id
                                  ? "bg-blue-50 border-l-2 border-blue-500"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => playVideo(video)}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <svg
                                  className={`w-5 h-5 ${
                                    selectedVideo?.id === video.id
                                      ? "text-blue-500"
                                      : "text-gray-400"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                              <div className="ml-3 flex-1">
                                <p
                                  className={`text-sm ${
                                    selectedVideo?.id === video.id
                                      ? "font-medium text-blue-700"
                                      : "font-normal text-gray-700"
                                  }`}
                                >
                                  {video.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDuration(video.duration)}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic pl-4 py-2">
                          No videos in this chapter yet
                        </p>
                      )}

                      {/* Exam indicator */}
                      {chapter.exam && (
                        <div className="flex items-center mt-2 pl-4 py-2">
                          <svg
                            className="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {chapter.exam.title}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No chapters available for Year {activeYear} yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
