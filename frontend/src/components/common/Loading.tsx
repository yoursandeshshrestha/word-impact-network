import React from "react";

interface LoadingProps {
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ className = "" }) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div
        className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 ${className}`}
      ></div>
    </div>
  );
};

export default Loading;
