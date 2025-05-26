"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAutoMyLearning } from "@/redux/features/myLearningSlice/useMyLearning";
import Image from "next/image";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  progress: {
    overallProgress: number;
    completedChapters: number;
    totalChapters: number;
    watchedVideos: number;
    totalVideos: number;
  };
  onContinue: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  coverImageUrl,
  progress,
  onContinue,
}) => {
  // Function to strip HTML tags from description
  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getShortDescription = (desc: string) => {
    const plainText = stripHtmlTags(desc);
    return plainText.length > 250
      ? plainText.substring(0, 250) + "..."
      : plainText;
  };

  return (
    <div className="overflow-hidden mb-8 flex items-center bg-white rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md">
      {/* Course Content */}
      <div className="flex-1 flex flex-col justify-between p-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
            {title}
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6">
            {getShortDescription(description)}
          </p>
          {/* Progress Section */}
          <div className="mb-6 w-[500px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Progress
              </span>
              <span className="text-sm font-medium text-slate-900">
                {progress.overallProgress}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-[#7a9e7e] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress.overallProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-slate-600">
              <span>
                {progress.completedChapters}/{progress.totalChapters} chapters
                completed
              </span>
              <span>
                {progress.watchedVideos}/{progress.totalVideos} videos watched
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onContinue(id)}
          className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 self-start shadow-sm hover:shadow-md"
        >
          Continue Learning
        </button>
      </div>
      {/* Course Image */}
      <div className="w-93 h-60 relative flex-shrink-0 bg-slate-100 rounded-2xl mx-6 my-6 flex items-center justify-center overflow-hidden border border-slate-200">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover rounded-2xl"
            sizes="320px"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-course.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl font-bold">
            No Image
          </div>
        )}
      </div>
    </div>
  );
};

const MyLearningPage: React.FC = () => {
  const router = useRouter();
  const { courses, isLoading, isError, error } = useAutoMyLearning();

  const handleContinueLearning = (courseId: string) => {
    router.push(`/my-learning/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#7a9e7e] mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Loading your courses...</p>
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
            {error || "Failed to load your learning courses"}
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

  return (
    <div className="h-[calc(100vh-4rem)] bg-white pt-10 overflow-auto">
      <div className="px-4 py-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Learning</h1>
          <p className="text-slate-600 mt-2">
            Continue your learning journey with your enrolled courses
          </p>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">
              No courses enrolled
            </h3>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
              You haven&apos;t enrolled in any courses yet. Start learning today
              and discover new skills!
            </p>
            <button
              onClick={() => router.push("/courses")}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer shadow-sm hover:shadow-md"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                coverImageUrl={course.coverImageUrl}
                progress={course.progress}
                onContinue={handleContinueLearning}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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

export default MyLearningPage;
