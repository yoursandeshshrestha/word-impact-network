import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Calendar, ArrowRight } from "lucide-react";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import { useCourses } from "@/hooks/usePublicCourses";

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
    isEnrolled?: boolean;
  };
}

import placeholderCourseImage from "@/assets/placeholder-image.png";

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { enrollInCourse } = useCourses();

  // Sanitize the HTML content using DOMPurify
  const sanitizedDescription = DOMPurify.sanitize(course.description, {
    ALLOWED_TAGS: ["ul", "li", "h3", "p", "br", "strong", "em"],
    ALLOWED_ATTR: ["data-start", "data-end"],
  });

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      await enrollInCourse(course.id);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while enrolling in the course."
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-md shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100/50">
      {/* Course Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={course.coverImageUrl || placeholderCourseImage}
          alt={course.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800/30 via-gray-800/10 to-transparent"></div>

        {/* Course Information Overlays */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center">
            <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium px-2 py-1 rounded-md">
              {course.durationYears} Year Program
            </span>
          </div>
        </div>

        {/* Instructor */}
        {course.instructor && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white mr-2">
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
        <h3 className="text-lg font-bold text-gray-700 mb-2 line-clamp-2">
          {course.title}
        </h3>

        <div
          className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />

        {/* Course Meta */}
        <div className="flex items-center space-x-4 text-gray-400 text-xs mb-4 pt-3 border-t border-gray-100/50">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-gray-300" />
            <span>{course.durationYears} Years</span>
          </div>

          {course.totalChapters && (
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-gray-300" />
              <span>{course.totalChapters} Chapters</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="flex-1 bg-white/20 backdrop-blur-sm border border-gray-200 hover:bg-white/30 text-gray-700 text-sm text-center py-2.5 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isEnrolling ? "Enrolling..." : "Enroll Now"}
          </button>
          <Link
            href={`/courses/${course.id}`}
            className="flex-1 bg-white/10 backdrop-blur-sm border border-gray-200 hover:bg-white/20 text-gray-600 text-sm text-center py-2.5 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
