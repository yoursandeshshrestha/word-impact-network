"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAutoMyLearning } from "@/redux/features/myLearningSlice/useMyLearning";
import Image from "next/image";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import AnnouncementModal from "@/components/Announcements/AnnouncementModal";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { isAuthenticated } from "@/common/services/auth";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import PaymentButton from "@/components/common/PaymentButton";

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
    <div className="overflow-hidden mb-8 flex flex-col md:flex-row items-center bg-white rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md ">
      {/* Course Content */}
      <div className="flex-1 flex flex-col justify-between p-4 md:p-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
            {title}
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6">
            {getShortDescription(description)}
          </p>
          {/* Progress Section */}
          <div className="mb-6 w-full md:w-[500px]">
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-2 text-sm text-slate-600 space-y-1 md:space-y-0">
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
          className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 self-start shadow-sm hover:shadow-md w-full md:w-auto"
        >
          Continue Learning
        </button>
      </div>
      {/* Course Image */}
      <div className="w-full md:w-93 h-48 md:h-60 relative flex-shrink-0 bg-slate-100 rounded-2xl mx-0 md:mx-6 mt-4 md:my-6 flex items-center justify-center overflow-hidden border border-slate-200">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 768px) 100vw, 320px"
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
  const { announcements, loadAnnouncements } = useAnnouncements();
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const hasLoadedRef = useRef(false);
  const user = useSelector((state: RootState) => state.user.user);
  const { hasPaid, isLoading: paymentLoading } = usePaymentStatus();

  // Load announcements when component mounts
  useEffect(() => {
    if (!hasLoadedRef.current && isAuthenticated() && user) {
      hasLoadedRef.current = true;
      loadAnnouncements();
    }
  }, [loadAnnouncements, user]);

  // Show announcement modal on page load if user hasn't seen it
  useEffect(() => {
    if (
      isAuthenticated() &&
      user &&
      announcements &&
      announcements.length > 0 &&
      !sessionStorage.getItem("announcementModalShown")
    ) {
      setShowAnnouncementModal(true);
      sessionStorage.setItem("announcementModalShown", "true");
    }
  }, [announcements, user]);

  const handleContinueLearning = (courseId: string) => {
    router.push(`/my-learning/${courseId}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-auto">
      <div className="px-5 pt-4">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            My Learning
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-2">
            Continue your learning journey with your enrolled courses
          </p>
        </div>

        {/* Payment Button - Show only if user hasn't paid */}
        {!paymentLoading && !hasPaid && courses.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Support Our Mission
                </h3>
                <p className="text-blue-700 text-sm">
                  Make a voluntary contribution to help us continue providing quality education.
                </p>
              </div>
              <PaymentButton variant="primary" size="md" />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#7a9e7e] mx-auto mb-3"></div>
                <p className="text-sm sm:text-base text-slate-600">
                  Loading your courses...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="text-center max-w-lg mx-auto px-4">
                <div className="text-red-500 text-2xl sm:text-3xl mb-3">⚠️</div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                  Something went wrong
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mb-4">
                  {error || "Failed to load your learning courses"}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base transition-colors cursor-pointer shadow-sm hover:shadow-md"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Courses List */}
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                No courses enrolled
              </h3>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
                You haven&apos;t enrolled in any courses yet. Start learning
                today and discover new skills!
              </p>
              <button
                onClick={() => router.push("/courses")}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer shadow-sm hover:shadow-md"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="space-y-8">
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

      {/* Announcement Modal */}
      <AnnouncementModal
        announcements={announcements}
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
      />
    </div>
  );
};

export default MyLearningPage;
