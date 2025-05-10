import React from "react";

interface PaginationControlsProps {
  total: number;
  currentCount: number;
  limit: number;
  onLimitChange: (limit: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  total,
  currentCount,
  limit,
  onLimitChange,
}) => {
  return (
    <div className="border-t border-gray-200">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50">
        <div className="text-sm text-gray-500">
          Showing {currentCount} of {total} items
        </div>

        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">Show:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
