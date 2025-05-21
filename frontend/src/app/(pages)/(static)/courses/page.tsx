"use client";

import React, { useEffect } from "react";
import { useCourses } from "@/hooks/usePublicCourses";
import CourseCard from "@/components/Courses/CourseCard";

const CoursesPage = () => {
  const { courses, error, loadCourses, isLoading, isError, isSuccess } =
    useCourses();

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section id="course-listings" className="py-20 bg-white mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">
              Available Programs
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 tracking-wide">
              Our Educational Courses
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              World Impact Network offers comprehensive educational programs
              designed to equip Christian leaders with biblical knowledge and
              leadership skills for effective ministry.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
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
                Unable to Load Courses
              </h3>
              <p className="text-red-600 mb-6">
                {error || "Failed to load courses. Please try again later."}
              </p>
              <button
                onClick={() => loadCourses()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {isSuccess && courses.length === 0 && (
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
                No Courses Available
              </h3>
              <p className="text-gray-600">
                No courses are available at the moment. Please check back later
                as we continue to develop our curriculum.
              </p>
            </div>
          )}

          {/* Course Grid */}
          {isSuccess && courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    durationYears: course.durationYears,
                    coverImageUrl: course.coverImageUrl,
                    instructor: course.instructor,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CoursesPage;
