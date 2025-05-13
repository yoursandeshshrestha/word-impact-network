import React from "react";
import { Chapter } from "@/redux/features/chaptersSlice";
import { formatDate } from "@/utils/formatters";
import Link from "next/link";
import {
  BookOpen,
  Edit,
  Trash2,
  Video,
  Award,
  Calendar,
  Hash,
  ChevronRight,
} from "lucide-react";

interface ChapterCardProps {
  chapter: Chapter;
  courseId: string;
  onEdit: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  courseId,
  onEdit,
  onDelete,
}) => {
  const videoCount = chapter._count?.videos || 0;
  const hasExam = !!chapter.exam;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <BookOpen size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {chapter.title}
              </h3>
              <div className="flex items-center mt-1 space-x-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <Hash size={14} className="mr-1" />
                  Order: {chapter.orderIndex}
                </span>
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Year: {chapter.courseYear}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(chapter)}
              className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
              aria-label="Edit chapter"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(chapter.id)}
              className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 cursor-pointer"
              aria-label="Delete chapter"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {chapter.description}
        </p>

        <div className="flex flex-wrap items-center justify-between mt-3">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Video size={16} className="mr-1 text-indigo-500" />
              {videoCount} Video{videoCount !== 1 ? "s" : ""}
            </span>
            <span
              className={`flex items-center ${
                hasExam ? "text-green-600" : "text-gray-400"
              }`}
            >
              <Award size={16} className="mr-1" />
              {hasExam ? "Has Exam" : "No Exam"}
            </span>
          </div>

          <Link
            href={`/courses/${courseId}/chapters/${chapter.id}`}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 cursor-pointer"
          >
            Manage Content
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created by: {chapter.createdBy?.fullName || "Unknown"}</span>
          <span>Created on: {formatDate(chapter.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
