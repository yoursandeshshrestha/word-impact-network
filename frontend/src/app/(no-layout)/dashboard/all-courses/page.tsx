"use client";

import React from "react";
import { useCourses } from "@/redux/features/courses/hooks/useCourses";
import CourseCard from "@/components/Courses/CourseCard";
import { Course } from "@/types/course";

export default function AllCoursesPage() {
  const { courses, loading, error } = useCourses();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">Error loading courses</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Ensure courses is an array
  const coursesList = Array.isArray(courses) ? courses : [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        All available courses
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesList.map((course: Course) => (
          <CourseCard
            key={course.id}
            course={{
              id: course.id,
              title: course.title,
              description: course.description,
              durationYears: course.durationYears,
              coverImageUrl: course.coverImageUrl,
              instructor: course.createdBy.fullName,
            }}
          />
        ))}
      </div>

      {coursesList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No courses available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
