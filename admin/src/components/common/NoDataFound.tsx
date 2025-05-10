import React from "react";
import { FileQuestion, SearchX, Database } from "lucide-react";

interface NoDataFoundProps {
  title?: string;
  message?: string;
  icon?: "file" | "search" | "database";
  className?: string;
}

/**
 * A reusable component to display when no data is found
 *
 * @param {string} title - Main title to display
 * @param {string} message - Secondary message with more details
 * @param {string} icon - Icon type to display: "file", "search", or "database"
 * @param {string} className - Additional CSS classes
 */
const NoDataFound: React.FC<NoDataFoundProps> = ({
  title = "No Data Found",
  message = "",
  icon = "search",
  className = "",
}) => {
  // Select the appropriate icon
  const IconComponent = {
    file: FileQuestion,
    search: SearchX,
    database: Database,
  }[icon];

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
    >
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <IconComponent size={40} className="text-gray-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-500 max-w-sm">{message}</p>}
    </div>
  );
};

export default NoDataFound;
