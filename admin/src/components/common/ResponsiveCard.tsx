import React from "react";

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  hover = false,
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg",
  };

  const hoverClasses = hover
    ? "hover:shadow-lg transition-shadow duration-200"
    : "";

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${hoverClasses}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default ResponsiveCard;
