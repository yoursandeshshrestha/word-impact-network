"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useCourse } from "@/hooks/useCourses";
import { Course } from "@/redux/features/coursesSlice";
import CourseGrid from "@/components/courses/CourseGrid";
import SearchBar from "@/components/courses/SearchBar";
import Loading from "@/components/common/Loading";
import CourseModal from "@/components/courses/CoursesModel";
import DeleteCourseModal from "@/components/courses/DeleteCoursesModel";

const CoursesPage = () => {
  const {
    courses,
    loading,
    error,
    success,
    message,
    fetchCourses,
    addCourse,
    editCourse,
    removeCourse,
    reset,
  } = useCourse();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (success && message) {
      // Close modals and reset states
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedCourse(null);
      setCourseToDelete(null);

      // Reset status in Redux
      reset();
    }

    if (error) {
      reset();
    }
  }, [success, message, error, reset]);

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;

    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (course) {
      setCourseToDelete({ id, title: course.title });
      setIsDeleteModalOpen(true);
    }
  };

  const handleCreateCourse = async (formData: FormData) => {
    // Close modal immediately
    setIsCreateModalOpen(false);
    // Start the operation
    await addCourse(formData);
  };

  const handleEditCourse = async (formData: FormData) => {
    const courseId = formData.get("id");
    if (courseId) {
      // Close modal immediately
      setIsEditModalOpen(false);
      // Start the operation
      await editCourse(courseId.toString(), formData);
    }
  };

  const handleDeleteCourse = async () => {
    if (courseToDelete) {
      await removeCourse(courseToDelete.id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create Course
        </button>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && <Loading />}

      {!loading && (
        <CourseGrid
          courses={filteredCourses}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      )}

      {/* Create Course Modal */}
      <CourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCourse}
        initialData={null}
        isLoading={loading}
        mode="create"
      />

      {/* Edit Course Modal */}
      <CourseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditCourse}
        initialData={selectedCourse}
        isLoading={loading}
        mode="edit"
      />

      {/* Delete Course Modal */}
      <DeleteCourseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCourse}
        title={courseToDelete?.title || ""}
        isLoading={loading}
      />
    </div>
  );
};

export default CoursesPage;
