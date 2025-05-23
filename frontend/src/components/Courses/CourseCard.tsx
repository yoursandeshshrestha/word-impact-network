import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Calendar, ArrowRight } from "lucide-react";
import DOMPurify from "dompurify";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    durationYears: number;
    coverImageUrl: string;
    totalChapters?: number;
    enrollmentCount?: number;
    instructor?: string;
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Sanitize the HTML content using DOMPurify
  const sanitizedDescription = DOMPurify.sanitize(course.description, {
    ALLOWED_TAGS: ["ul", "li", "h3", "p", "br", "strong", "em"],
    ALLOWED_ATTR: ["data-start", "data-end"],
  });

  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-200">
      {/* Course Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={course.coverImageUrl}
          alt={course.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Course Information Overlays */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center">
            <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-md">
              {course.durationYears} Year Program
            </span>
          </div>
        </div>

        {/* Instructor */}
        {course.instructor && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white mr-2">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white text-sm font-medium line-clamp-1">
                  {course.instructor}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        <div
          className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />

        {/* Course Meta */}
        <div className="flex items-center space-x-4 text-gray-500 text-xs mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
            <span>{course.durationYears} Years</span>
          </div>

          {course.totalChapters && (
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-gray-400" />
              <span>{course.totalChapters} Chapters</span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <Link
          href={`/courses/${course.id}`}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white text-sm text-center py-2.5 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
        >
          <span>View Course Details</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
