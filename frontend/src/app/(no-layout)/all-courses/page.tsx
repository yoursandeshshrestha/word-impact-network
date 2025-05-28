"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAutoCourses } from "@/hooks/useCourses";
import placeholderCourseImage from "@/assets/placeholder-image.png";
import { ChevronLeft, ChevronRight } from "lucide-react";

function CoursesPage() {
  const router = useRouter();
  const { filteredCourses, isLoading, isError, error } = useAutoCourses();

  const [currentPage, setCurrentPage] = useState(1);

  const coursesPerPage = 6;
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  // Remove the unused getCourseCardStyle function since we're not using colors anymore

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/all-courses/${courseId}`);
  };

  const renderPaginationNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            i === currentPage
              ? "bg-slate-800 text-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {i}
        </button>
      );
    }
    return numbers;
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-800 mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Loading courses...</p>
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
            {error || "Failed to load courses"}
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
          <h1 className="text-3xl font-bold text-slate-900">All Courses</h1>
          <p className="text-slate-600 mt-2">
            Browse and search through our collection of courses
          </p>
        </div>

        {/* Course Grid */}
        {currentCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">
              No courses found
            </h3>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Try adjusting your search criteria or browse all available
              courses.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 mb-16">
              {currentCourses.map((course) => (
                <div
                  key={course.id}
                  className="group cursor-pointer"
                  onClick={() => handleCourseClick(course.id)}
                >
                  {/* Course Card */}
                  <div className="overflow-hidden flex items-center bg-white rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md">
                    {/* Course Content */}
                    <div className="flex-1 flex flex-col justify-between p-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-6">
                          {stripHtml(course.description)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course.id);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 self-start shadow-sm hover:shadow-md"
                      >
                        View Course
                      </button>
                    </div>
                    {/* Course Image */}
                    <div className="w-93 h-60 relative flex-shrink-0 bg-slate-100 rounded-2xl mx-6 my-6 flex items-center justify-center overflow-hidden border border-slate-200">
                      <Image
                        src={
                          course.coverImageUrl || placeholderCourseImage
                        }
                        alt={course.title}
                        fill
                        className="object-cover rounded-2xl"
                        sizes="320px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-course.jpg";
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-slate-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {renderPaginationNumbers()}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-slate-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
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
}

export default CoursesPage;
