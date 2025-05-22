import React from "react";
import ExamForm from "./ExamForm";
import { Exam } from "@/redux/features/examsSlice";
import { Award, X } from "lucide-react";

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Exam) => void;
  initialData?: Omit<
    Exam,
    "id" | "adminId" | "chapterId" | "createdAt" | "updatedAt" | "questions"
  > | null;
  isLoading: boolean;
  mode: "create" | "edit";
}

const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  mode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Award size={20} className="mr-2 text-indigo-600" />
            {mode === "create" ? "Create New Exam" : "Edit Exam"}
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

        <ExamForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ExamModal;
