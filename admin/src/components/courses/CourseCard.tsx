import React from "react";
import { formatDate } from "@/utils/formatters";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Edit, Trash2, File } from "lucide-react";
import { Course } from "@/redux/features/coursesSlice";
import placeholderCourseImage from "@/assets/placeholder-image.png";

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full">
      <Link href={`/courses/${course.id}`}>
        <div className="relative h-48 w-full bg-gray-200">
          {course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl || placeholderCourseImage}
              alt={course.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <File className="h-16 w-16 text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                course.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {course.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4 flex-grow flex flex-col">
        <Link href={`/courses/${course.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-indigo-600">
            {course.title}
          </h3>
        </Link>

        <div
          className="text-sm text-gray-600 mb-3 line-clamp-2 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: course.description }}
        />

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Created on {formatDate(course.createdAt)}</span>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4 mr-1" />
          <span>
            {course.durationYears} Year{course.durationYears !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Footer always stays at the bottom */}
        <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-3">
          <span className="text-sm text-gray-500">
            {course.createdBy?.fullName || "Unknown"}
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(course)}
              className="text-indigo-600 hover:text-indigo-900"
              aria-label="Edit course"
            >
              <Edit className="h-5 w-5" />
            </button>

            <button
              onClick={() => onDelete(course.id)}
              className="text-red-600 hover:text-red-900"
              aria-label="Delete course"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
