"use client";

import React, { useEffect } from "react";
import { useCourses } from "@/hooks/usePublicCourses";
import CourseCard from "@/components/Courses/CourseCard";
import Image from "next/image";
import { AlertTriangle, BookOpen, Loader2 } from "lucide-react";

import backgroundImage from "@/assets/graduation-cap-image.jpg";

const CoursesPage = () => {
  const { courses, error, loadCourses, isLoading, isError, isSuccess } =
    useCourses();

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Banner with Next.js Image */}
      <section className="relative h-[500px]">
        <Image
          src={backgroundImage}
          alt="Educational Programs Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        <div className="container mx-auto px-6 h-full flex items-center justify-center relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Our Educational Programs
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Comprehensive biblical education designed to equip Christian
              leaders with knowledge and skills for effective ministry.
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {/* Section Title */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Available Courses
            </h2>
            <div className="h-1 w-16 bg-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Explore our selection of courses designed to deepen your
              understanding and prepare you for ministry.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 mb-4 text-gray-800 animate-spin" />
              <p className="text-gray-500">Loading courses...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="max-w-md mx-auto text-center py-12 px-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to Load Courses
              </h3>
              <p className="text-gray-600 mb-6">
                {error || "Failed to load courses. Please try again later."}
              </p>
              <button
                onClick={() => loadCourses()}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State - No Courses */}
          {isSuccess && courses.length === 0 && (
            <div className="max-w-md mx-auto text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Courses Available Yet
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                We&apos;re currently developing our course catalog. Please check
                back soon as we continue to build our curriculum.
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
                    totalChapters: course.totalChapters,
                    enrollmentCount: course.enrollmentCount,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;
