import React from "react";

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  mobileCardContent?: React.ReactNode;
}

const ResponsiveTableRow: React.FC<ResponsiveTableRowProps> = ({
  children,
  onClick,
  className = "",
  mobileCardContent,
}) => {
  const baseClasses = "hover:bg-gray-50 transition-colors duration-150";
  const clickableClasses = onClick ? "cursor-pointer" : "";
  const combinedClasses = `${baseClasses} ${clickableClasses} ${className}`;

  return (
    <>
      {/* Desktop Table Row */}
      <tr
        className={`hidden xl:table-row ${combinedClasses}`}
        onClick={onClick}
      >
        {children}
      </tr>

      {/* Mobile Card */}
      {mobileCardContent && (
        <div
          className={`xl:hidden bg-white border border-gray-200 rounded-lg p-4 ${combinedClasses}`}
          onClick={onClick}
        >
          {mobileCardContent}
        </div>
      )}
    </>
  );
};

export default ResponsiveTableRow;
