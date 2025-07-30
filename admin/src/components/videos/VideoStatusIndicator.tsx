import React from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, Play } from "lucide-react";

interface VideoStatusIndicatorProps {
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
  errorMessage?: string;
  jobStatus?: {
    id: string;
    status: string;
    progress: number;
    failedReason?: string;
  };
}

const VideoStatusIndicator: React.FC<VideoStatusIndicatorProps> = ({
  status,
  errorMessage,
  jobStatus,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "UPLOADING":
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "Uploading",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-200",
        };
      case "PROCESSING":
        return {
          icon: <Play className="w-4 h-4" />,
          text: "Processing",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          borderColor: "border-blue-200",
        };
      case "READY":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Ready",
          color: "text-green-600",
          bgColor: "bg-green-100",
          borderColor: "border-green-200",
        };
      case "FAILED":
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: "Failed",
          color: "text-red-600",
          bgColor: "bg-red-100",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Unknown",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.borderColor} ${config.color}`}
    >
      {config.icon}
      <span className="ml-1">{config.text}</span>

      {status === "PROCESSING" && jobStatus?.progress !== undefined && (
        <span className="ml-2 text-xs">
          ({Math.round(jobStatus.progress)}%)
        </span>
      )}

      {(status === "FAILED" || errorMessage) && (
        <div className="ml-2 text-xs">
          {errorMessage || jobStatus?.failedReason}
        </div>
      )}
    </div>
  );
};

export default VideoStatusIndicator;
