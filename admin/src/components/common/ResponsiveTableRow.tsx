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
}) => {
  const baseClasses = "hover:bg-gray-50 transition-colors duration-150";
  const clickableClasses = onClick ? "cursor-pointer" : "";
  const combinedClasses = `${baseClasses} ${clickableClasses} ${className}`;

  return (
    <tr className={`${combinedClasses}`} onClick={onClick}>
      {children}
    </tr>
  );
};

// Separate component for mobile cards
export const ResponsiveTableMobileCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = "" }) => {
  const baseClasses = "hover:bg-gray-50 transition-colors duration-150";
  const clickableClasses = onClick ? "cursor-pointer" : "";
  const combinedClasses = `${baseClasses} ${clickableClasses} ${className}`;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${combinedClasses}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ResponsiveTableRow;
