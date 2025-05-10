import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Always show first page
    pages.push(1);

    // Calculate range of visible pages
    const startPage = Math.max(
      2,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

    // Adjust if we're near the start
    if (startPage > 2) {
      pages.push("...");
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Adjust if we're near the end
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center py-4 px-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          px-4 py-2 mx-1 text-sm font-medium rounded-md
          ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }
        `}
      >
        Previous
      </button>

      <div className="hidden sm:flex">
        {generatePageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === "number" ? (
              <button
                onClick={() => onPageChange(page)}
                className={`
                  w-10 h-10 mx-1 text-sm font-medium rounded-md flex items-center justify-center
                  ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }
                `}
              >
                {page}
              </button>
            ) : (
              <span className="w-8 mx-1 text-gray-500 flex items-center justify-center">
                {page}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="sm:hidden flex items-center">
        <span className="text-sm text-gray-600 mx-2">
          {currentPage} / {totalPages}
        </span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          px-4 py-2 mx-1 text-sm font-medium rounded-md
          ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }
        `}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
