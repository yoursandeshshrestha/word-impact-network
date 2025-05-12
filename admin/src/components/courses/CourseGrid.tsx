import React, { useState } from "react";
import { Course } from "@/redux/features/coursesSlice";
import CourseCard from "./CourseCard";
import NoDataFound from "../common/NoDataFound";
import Pagination from "../common/Pagination";

interface CourseGridProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Show 8 courses per page

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = courses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  if (courses.length === 0) {
    return (
      <NoDataFound message="No courses found. Create a new course to get started." />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
