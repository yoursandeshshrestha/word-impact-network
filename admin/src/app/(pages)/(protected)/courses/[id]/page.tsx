"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCourse } from "@/hooks/useCourses";
import Loading from "@/components/common/Loading";
import { formatDate } from "@/utils/formatters";
import CourseModal from "@/components/courses/CoursesModel";
import DeleteCourseModal from "@/components/courses/DeleteCoursesModel";
import Image from "next/image";
import { toast } from "sonner";

interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ params }) => {
  const { id } = params;
  const router = useRouter();

  const {
    course,
    loading,
    error,
    success,
    message,
    fetchCourseById,
    editCourse,
    removeCourse,
    reset,
  } = useCourse();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchCourseById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);

      // Close modals
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);

      // Reset status in Redux
      reset();
    }

    if (error) {
      toast.error(error);
      reset();
    }
  }, [success, message, error, reset]);

  const handleEditCourse = (formData: FormData) => {
    if (course) {
      editCourse(course.id, formData);
    }
  };

  const handleDeleteCourse = () => {
    if (course) {
      removeCourse(course.id);
      // Navigate back to courses page after deletion
      router.push("/courses");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!course && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-gray-50 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The course you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={() => router.push("/courses")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => router.push("/courses")}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Courses
        </button>
      </div>

      {course && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-64 w-full bg-gray-200">
            {course.coverImageUrl ? (
              <Image
                src={course.coverImageUrl}
                alt={course.title}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg"; // Fallback image
                  target.onerror = null; // Prevent infinite loop
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 14v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m3-3h6m-6 0H4m2-3h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course.title}
                </h1>
                <div className="mt-2 flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {course.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    {course.durationYears} Year
                    {course.durationYears !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                {course.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-gray-200 pt-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Course Details
                </h2>
                <dl className="space-y-3">
                  <div className="flex">
                    <dt className="text-sm font-medium text-gray-500 w-32">
                      Created By:
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {course.createdBy?.fullName || "Unknown"}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="text-sm font-medium text-gray-500 w-32">
                      Created On:
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(course.createdAt)}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="text-sm font-medium text-gray-500 w-32">
                      Last Updated:
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(course.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Course Structure
                </h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    This course has {course.durationYears} year
                    {course.durationYears !== 1 ? "s" : ""} of curriculum.
                  </p>
                  <button
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() =>
                      router.push(`/courses/${course.id}/chapters`)
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Manage Chapters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {course && (
        <CourseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditCourse}
          initialData={course}
          isLoading={loading}
          mode="edit"
        />
      )}

      {/* Delete Course Modal */}
      {course && (
        <DeleteCourseModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteCourse}
          title={course.title}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;
