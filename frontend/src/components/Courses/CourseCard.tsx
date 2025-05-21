import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Calendar, ArrowRight } from "lucide-react";

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
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full transform hover:-translate-y-2 border border-gray-100">
      {/* Course Image */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={course.coverImageUrl}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

        {/* Course Information Overlays */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {course.durationYears} Year Program
            </span>
          </div>
        </div>

        {/* Instructor */}
        {course.instructor && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-medium">
                  {course.instructor}
                </p>
                <p className="text-white/70 text-xs">Instructor</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
          {course.title}
        </h3>

        <p className="text-gray-600 mb-5 line-clamp-3 flex-grow">
          {course.description}
        </p>

        {/* Course Meta */}
        <div className="flex items-center space-x-4 text-gray-500 text-sm mb-5 border-t pt-5 border-gray-100">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-indigo-500" />
            <span>{course.durationYears} Years</span>
          </div>

          {course.totalChapters && (
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-indigo-500" />
              <span>{course.totalChapters} Chapters</span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <Link
          href={`/courses/${course.id}`}
          className="group/button w-full bg-white border border-gray-200 hover:border-indigo-600 hover:bg-indigo-600 text-gray-700 hover:text-white text-center py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
        >
          <span>View Course Details</span>
          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/button:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
