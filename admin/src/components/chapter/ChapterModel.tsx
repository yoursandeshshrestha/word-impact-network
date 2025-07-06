import React from "react";
import ChapterForm, { ChapterFormData } from "./ChapterForm";
import { Chapter } from "@/redux/features/chaptersSlice";
import { X } from "lucide-react";

interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chapterData: ChapterFormData) => void;
  initialData: Chapter | null;
  courseId: string;
  maxCourseYears: number;
  isLoading: boolean;
  mode: "create" | "edit";
  existingChapters?: Array<{ orderIndex: number; courseYear: number }>;
}

const ChapterModal: React.FC<ChapterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  courseId,
  maxCourseYears,
  isLoading,
  mode,
  existingChapters = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            {mode === "create" ? "Create New Chapter" : "Edit Chapter"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer"
          >
            <span className="sr-only">Close</span>
            <X size={24} />
          </button>
        </div>

        <ChapterForm
          initialData={initialData}
          courseId={courseId}
          maxCourseYears={maxCourseYears}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          existingChapters={existingChapters}
        />
      </div>
    </div>
  );
};

export default ChapterModal;
