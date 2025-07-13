import React from "react";
import NewsForm from "./NewsForm";
import { News } from "@/types/news";
import { X } from "lucide-react";

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  news: News | null;
  isLoading: boolean;
  mode: "create" | "edit";
}

const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  news,
  isLoading,
  mode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex justify-center items-start sm:items-center p-1 sm:p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto my-2 sm:my-0 max-h-[98vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
            {mode === "create" ? "Create New News" : "Edit News"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full p-1 transition-colors duration-200"
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={20} className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <NewsForm
            news={news}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
