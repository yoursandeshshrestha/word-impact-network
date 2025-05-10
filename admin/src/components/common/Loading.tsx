import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fullPage?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "medium",
  text = "Loading...",
  fullPage = false,
  className = "",
}) => {
  // Calculate spinner size based on the size prop
  const getSpinnerSize = () => {
    switch (size) {
      case "small":
        return "h-4 w-4";
      case "large":
        return "h-8 w-8";
      case "medium":
      default:
        return "h-6 w-6";
    }
  };

  // Calculate text size based on the size prop
  const getTextSize = () => {
    switch (size) {
      case "small":
        return "text-xs";
      case "large":
        return "text-lg";
      case "medium":
      default:
        return "text-sm";
    }
  };

  // For full page loading
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="flex flex-col items-center justify-center p-6 rounded-lg">
          <Loader2
            className={`${getSpinnerSize()} text-indigo-600 animate-spin mb-3`}
          />
          <p className={`${getTextSize()} font-medium text-gray-700`}>{text}</p>
        </div>
      </div>
    );
  }

  // For inline loading
  return (
    <div
      className={`flex flex-col items-center justify-center py-8 ${className}`}
    >
      <Loader2
        className={`${getSpinnerSize()} text-indigo-600 animate-spin mb-2`}
      />
      <p className={`${getTextSize()} font-medium text-gray-600`}>{text}</p>
    </div>
  );
};

export default Loading;
