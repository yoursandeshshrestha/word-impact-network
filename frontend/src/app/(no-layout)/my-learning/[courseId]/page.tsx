"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAutoCourseDetail,
  useCourseNavigation,
} from "@/redux/features/courseDetail/useCourseDetails";
import {
  BookOpen,
  Clock,
  ChevronRight,
  CheckCircle,
  Lock,
  Play,
  AlertCircle,
  Trophy,
  Target,
} from "lucide-react";
import { CourseDetailData } from "@/redux/features/courseDetail/courseDetailSlice";

interface ChapterItemProps {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseYear: number;
  isLocked: boolean;
  lockReason?: string;
  progress: {
    isCompleted: boolean;
    completedAt: string | null;
    videosCompleted: number;
    totalVideos: number;
    allVideosCompleted: boolean;
    hasExam: boolean;
    examPassed: boolean;
  };
  globalChapterNumber: number;
  onStartChapter: (chapterId: string) => void;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  id,
  title,
  description,
  isLocked,
  lockReason,
  progress,
  globalChapterNumber,
  onStartChapter,
}) => {
  const getStatusIcon = () => {
    if (isLocked) return <Lock className="w-5 h-5 text-slate-400" />;
    if (progress.isCompleted)
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (progress.videosCompleted > 0)
      return <Play className="w-5 h-5 text-indigo-700" />;
    return <Play className="w-5 h-5 text-slate-600" />;
  };

  const getStatusText = () => {
    if (isLocked) return "Locked";
    if (progress.isCompleted) return "Completed";
    if (progress.videosCompleted > 0)
      return `${progress.videosCompleted}/${progress.totalVideos} videos completed`;
    return "Not Started";
  };

  const getStatusColor = () => {
    if (isLocked) return "text-slate-400";
    if (progress.isCompleted) return "text-green-600";
    if (progress.videosCompleted > 0) return "text-indigo-700";
    return "text-slate-500";
  };

  const handleClick = () => {
    if (!isLocked) {
      onStartChapter(id);
    }
  };

  return (
    <div
      className={`border rounded-2xl p-5 mb-4 transition-all duration-300 ${
        isLocked
          ? "bg-slate-50 border-slate-200 cursor-not-allowed"
          : progress.isCompleted
          ? "bg-green-50 border-green-200 hover:border-green-300 cursor-pointer hover:shadow-sm"
          : "bg-white border-slate-200 hover:border-slate-300 cursor-pointer hover:shadow-sm"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isLocked
                  ? "bg-slate-200"
                  : progress.isCompleted
                  ? "bg-green-100"
                  : progress.videosCompleted > 0
                  ? "bg-indigo-100"
                  : "bg-slate-100"
              }`}
            >
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <h3
                className={`text-xl font-bold transition-colors duration-300 ${
                  isLocked ? "text-slate-400" : "text-slate-900"
                }`}
              >
                Chapter {globalChapterNumber}: {title}
              </h3>
              <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
            </div>
          </div>

          {/* Progress Bar for In-Progress Chapters */}
          {!isLocked &&
            progress.videosCompleted > 0 &&
            !progress.isCompleted && (
              <div className="mb-3 ml-13">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-700 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (progress.videosCompleted / progress.totalVideos) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>
                    Videos: {progress.videosCompleted}/{progress.totalVideos}
                  </span>
                  {progress.hasExam && (
                    <span
                      className={
                        progress.examPassed
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    >
                      Exam: {progress.examPassed ? "Passed" : "Pending"}
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Completion Status for Completed Chapters */}
          {progress.isCompleted && (
            <div className="mb-3 ml-13">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>All videos completed</span>
                </div>
              </div>
              {progress.completedAt && (
                <p className="text-xs text-slate-500 mt-1">
                  Completed on{" "}
                  {new Date(progress.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <p
            className={`text-sm leading-relaxed ml-13 ${
              isLocked ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {description.length > 120
              ? `${description.slice(0, 120)}...`
              : description}
          </p>

          {/* Lock Reason */}
          {isLocked && lockReason && (
            <div className="ml-13 mt-3">
              <div className="flex items-start space-x-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700">{lockReason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="ml-4 flex items-center space-x-2">
          {!isLocked && (
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
};

interface Chapter {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseYear: number;
  isLocked: boolean;
  lockReason?: string;
  progress: {
    isCompleted: boolean;
    completedAt: string | null;
    videosCompleted: number;
    totalVideos: number;
    allVideosCompleted: boolean;
    hasExam: boolean;
    examPassed: boolean;
  };
}

interface YearSectionProps {
  year: number;
  totalChapters: number;
  unlockedChapters: number;
  completedChapters: number;
  chapters: Chapter[];
  courseId: string;
  onStartChapter: (chapterId: string) => void;
  startingChapterNumber: number;
}

const YearSection: React.FC<YearSectionProps> = ({
  year,
  totalChapters,
  unlockedChapters,
  completedChapters,
  chapters,
  onStartChapter,
  startingChapterNumber,
}) => {
  const progressPercentage = Math.round(
    (completedChapters / totalChapters) * 100
  );
  const isYearCompleted = completedChapters === totalChapters;

  return (
    <div className="mb-12">
      {/* Year Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
            isYearCompleted
              ? "bg-gradient-to-br from-green-500 to-green-600"
              : completedChapters > 0
              ? "bg-gradient-to-br from-indigo-600 to-indigo-700"
              : "bg-gradient-to-br from-slate-400 to-slate-500"
          }`}
        >
          <span className="text-white font-bold text-lg">{year}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">Year {year}</h2>
            {isYearCompleted && (
              <div className="flex items-center space-x-1 text-green-600">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span>
              {completedChapters}/{totalChapters} chapters completed
            </span>
            <span>•</span>
            <span>
              {unlockedChapters}/{totalChapters} unlocked
            </span>
            {progressPercentage > 0 && (
              <>
                <span>•</span>
                <span className="font-medium">
                  {progressPercentage}% complete
                </span>
              </>
            )}
          </div>

          {/* Year Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mt-3 max-w-md">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isYearCompleted ? "bg-green-500" : "bg-indigo-700"
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="ml-4 border-l-2 border-slate-200 pl-8 relative">
        {chapters.map((chapter, index) => (
          <div key={chapter.id} className="relative">
            {/* Connection line dot */}
            <div
              className={`absolute -left-10 top-6 w-4 h-4 border-2 border-white rounded-full shadow-sm ${
                chapter.isLocked
                  ? "bg-slate-200"
                  : chapter.progress.isCompleted
                  ? "bg-green-500"
                  : chapter.progress.videosCompleted > 0
                  ? "bg-indigo-700"
                  : "bg-slate-100"
              }`}
            ></div>

            <ChapterItem
              id={chapter.id}
              title={chapter.title}
              description={chapter.description}
              orderIndex={chapter.orderIndex}
              courseYear={chapter.courseYear}
              isLocked={chapter.isLocked}
              lockReason={chapter.lockReason}
              progress={chapter.progress}
              globalChapterNumber={startingChapterNumber + index}
              onStartChapter={onStartChapter}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseChapterPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const { courseDetail, isLoading, isError, error } =
    useAutoCourseDetail(courseId);
  const navigation = useCourseNavigation(
    courseDetail || ({} as CourseDetailData)
  );

  const handleStartChapter = (chapterId: string) => {
    router.push(`/my-learning/${courseId}/chapter/${chapterId}`);
  };

  // Strip HTML tags from description
  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (isError || !courseDetail) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            {error || "Failed to load course details"}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/my-learning")}
              className="bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm transition-colors cursor-pointer"
            >
              Back to My Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { course, progress, yearStructure, lockingRules } = courseDetail;
  const nextChapter = navigation.getContinueFromHere();

  // Calculate starting chapter numbers for each year
  let chapterCounter = 1;
  const yearSections = yearStructure.map((yearData) => ({
    ...yearData,
    startingChapterNumber: chapterCounter,
    endingChapterNumber: (chapterCounter += yearData.chapters.length) - 1,
  }));

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-auto">
      <div className="px-5 pt-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => router.push("/my-learning")}
              className="text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium"
            >
              My Learning
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">{course.title}</span>
          </div>
        </nav>

        {/* Course Header */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-600 leading-relaxed mb-6 max-w-4xl">
                {stripHtmlTags(course.description)}
              </p>

              <div className="flex items-center space-x-8 text-sm mb-6">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {course.durationYears}{" "}
                    {course.durationYears === 1 ? "Year" : "Years"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">
                    {progress.totalChapters} Chapters
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">
                    {progress.overallProgress}% Complete
                  </span>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    Overall Progress
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {progress.completedChapters}/{progress.totalChapters}{" "}
                    chapters completed
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress.overallProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Continue Learning CTA */}
              {nextChapter && (
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 rounded-2xl p-6 border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        Continue Learning
                      </h3>
                      <p className="text-slate-600">
                        Chapter{" "}
                        {navigation.getChapterGlobalIndex(nextChapter.id) + 1}:{" "}
                        {nextChapter.title}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartChapter(nextChapter.id)}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-indigo-200 flex items-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>Continue</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Locking Rules Info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-indigo-700 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-indigo-900 mb-2">
                {lockingRules.description}
              </h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                {lockingRules.rules.map((rule, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Course Structure */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Course Structure
            </h2>
            <p className="text-slate-600">
              Progress through each year systematically to build comprehensive
              understanding
            </p>
          </div>

          <div className="space-y-0">
            {yearSections.map((yearData) => (
              <YearSection
                key={yearData.year}
                year={yearData.year}
                totalChapters={yearData.totalChapters}
                unlockedChapters={yearData.unlockedChapters}
                completedChapters={yearData.completedChapters}
                chapters={yearData.chapters}
                courseId={courseId}
                onStartChapter={handleStartChapter}
                startingChapterNumber={yearData.startingChapterNumber}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
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

export default CourseChapterPage;
