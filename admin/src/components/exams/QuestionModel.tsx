import React from "react";
import QuestionForm from "./QuestionForm";
import { Question } from "@/redux/features/examsSlice";
import { HelpCircle, X } from "lucide-react";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Question) => void;
  initialData?: Omit<
    Question,
    "id" | "examId" | "createdAt" | "updatedAt"
  > | null;
  isLoading: boolean;
  mode: "create" | "edit";
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  mode,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (
    formData: Omit<Question, "id" | "examId" | "createdAt" | "updatedAt">
  ) => {
    const completeQuestion: Question = {
      ...formData,
      id: "", // Assign a unique ID if needed
      examId: "", // Assign the relevant exam ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(completeQuestion);
  };

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <HelpCircle size={20} className="mr-2 text-indigo-600" />
            {mode === "create" ? "Add New Question" : "Edit Question"}
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

        <QuestionForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default QuestionModal;
