import React from "react";

interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isLoading: boolean;
}

const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Delete Course
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete the course &quot;{title}
                &quot;? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCourseModal;
