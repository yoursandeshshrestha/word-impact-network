import React from "react";
import { Chapter } from "@/redux/features/chaptersSlice";
import {
  BookOpen,
  Calendar,
  Clock,
  Edit,
  FileText,
  Hash,
  User,
  Video,
  Award,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/utils/formatters";
import Link from "next/link";

interface ChapterDetailsProps {
  chapter: Chapter | null;
  courseId: string;
  onClose: () => void;
  onEdit: () => void;
}

const ChapterDetails: React.FC<ChapterDetailsProps> = ({
  chapter,
  courseId,
  onClose,
  onEdit,
}) => {
  if (!chapter) return null;

  const videoCount = chapter._count?.videos || chapter.videos?.length || 0;
  const hasExam = !!chapter.exam;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BookOpen size={20} className="mr-2 text-indigo-600" />
              Chapter Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-1">
              {chapter.title}
            </h3>
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                <Hash size={14} className="mr-1" />
                Order: {chapter.orderIndex}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                <Calendar size={14} className="mr-1" />
                Year: {chapter.courseYear}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                <Video size={14} className="mr-1" />
                {videoCount} Video{videoCount !== 1 ? "s" : ""}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                  hasExam
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <Award size={14} className="mr-1" />
                {hasExam ? "Has Exam" : "No Exam"}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                <FileText size={16} className="mr-1" />
                Description
              </h4>
              <p className="text-gray-700 whitespace-pre-line">
                {chapter.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                  <User size={16} className="mr-1" />
                  Created By
                </h4>
                <p className="text-gray-700">
                  {chapter.createdBy?.fullName || "Unknown"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                  <Clock size={16} className="mr-1" />
                  Created At
                </h4>
                <p className="text-gray-700">{formatDate(chapter.createdAt)}</p>
              </div>
              {chapter.course && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                    <BookOpen size={16} className="mr-1" />
                    Course
                  </h4>
                  <Link
                    href={`/courses/${courseId}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                  >
                    {chapter.course.title}
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm cursor-pointer"
            >
              <Edit size={16} className="mr-2" />
              Edit Chapter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterDetails;
