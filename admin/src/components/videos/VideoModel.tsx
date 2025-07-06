import React from "react";
import VideoForm from "./VideoForm";
import { Video as VideoIcon, X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: {
    title: string;
    description: string | null;
    orderIndex: number;
  } | null;
  isLoading: boolean;
  uploadProgress: number;
  isUploading: boolean;
  mode: "create" | "edit";
  onUploadStateChange?: (isUploading: boolean) => void;
  existingVideos?: Array<{ orderIndex: number }>;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  uploadProgress,
  isUploading,
  mode,
  onUploadStateChange,
  existingVideos = [],
}) => {
  if (!isOpen) return null;

  const handleCloseAttempt = () => {
    if (isLoading || isUploading) {
      // Prevent closing if upload is in progress
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <VideoIcon size={20} className="mr-2 text-indigo-600" />
            {mode === "create" ? "Upload New Video" : "Edit Video"}
          </h2>
          <button
            type="button"
            onClick={handleCloseAttempt}
            className={`text-gray-400 hover:text-gray-500 focus:outline-none ${
              isUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            disabled={isUploading}
          >
            <span className="sr-only">Close</span>
            <X size={24} />
          </button>
        </div>

        {isUploading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> Upload in progress. Please do not
                  close this window or navigate away from this page.
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  If your session expires during upload, you may need to refresh
                  the page and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        <VideoForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={handleCloseAttempt}
          isLoading={isLoading}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          onUploadStateChange={onUploadStateChange}
          existingVideos={existingVideos}
        />
      </div>
    </div>
  );
};

export default VideoModal;
