import React, { useState, useRef } from "react";
import {
  Upload,
  Info,
  Type,
  FileText,
  Hash,
  Clock,
  Save,
  X,
  Video as VideoIcon,
} from "lucide-react";
import { formatDuration } from "@/utils/formatters";

interface VideoFormProps {
  initialData?: {
    title: string;
    description: string | null;
    orderIndex: number;
  } | null;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  uploadProgress: number;
  isUploading: boolean;
}

const VideoForm: React.FC<VideoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  uploadProgress,
  isUploading,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    orderIndex: initialData?.orderIndex || 1,
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    orderIndex: "",
    video: "",
  });

  // Hidden video element to calculate duration
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "orderIndex" ? parseInt(value) || "" : value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
    ];

    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        video: "Please upload a valid video file (MP4, WebM, OGG, QuickTime)",
      }));
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        video: "Video size exceeds 500MB. Please upload a smaller video.",
      }));
      return;
    }

    // Create a URL for the video to calculate its duration
    const videoURL = URL.createObjectURL(file);
    const video = videoRef.current;

    if (video) {
      video.src = videoURL;
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        URL.revokeObjectURL(videoURL);
      };
      video.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          video: "Failed to load video. Please try another file.",
        }));
        URL.revokeObjectURL(videoURL);
      };
    }

    setVideoFile(file);

    // Clear any previous error
    setErrors((prev) => ({ ...prev, video: "" }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      title: "",
      description: "",
      orderIndex: "",
      video: "",
    };

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      valid = false;
    }

    // Order index should be a positive number
    if (!formData.orderIndex || formData.orderIndex < 1) {
      newErrors.orderIndex = "Order must be at least 1";
      valid = false;
    }

    // Video is required for new uploads
    if (!initialData && !videoFile) {
      newErrors.video = "Please upload a video file";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Create a new FormData object
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append("title", formData.title.trim());
      formDataToSubmit.append("description", formData.description.trim() || "");
      formDataToSubmit.append("orderIndex", formData.orderIndex.toString());

      // Add video file if provided
      if (videoFile) {
        formDataToSubmit.append("video", videoFile);

        // Add duration if available
        if (videoDuration) {
          formDataToSubmit.append(
            "duration",
            Math.round(videoDuration).toString()
          );
        }
      }

      onSubmit(formDataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden video element for duration calculation */}
      <video ref={videoRef} className="hidden" />

      <div>
        <label
          htmlFor="title"
          className=" text-sm font-medium text-gray-700 flex items-center"
        >
          <Type size={16} className="mr-1" /> Title{" "}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.title ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-text`}
          placeholder="Enter video title"
          disabled={isLoading || isUploading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.title}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className=" text-sm font-medium text-gray-700 flex items-center"
        >
          <FileText size={16} className="mr-1" /> Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.description ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-text`}
          placeholder="Enter video description (optional)"
          disabled={isLoading || isUploading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.description}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="orderIndex"
          className=" text-sm font-medium text-gray-700 flex items-center"
        >
          <Hash size={16} className="mr-1" /> Order{" "}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="number"
          id="orderIndex"
          name="orderIndex"
          min="1"
          value={formData.orderIndex}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.orderIndex ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-text`}
          disabled={isLoading || isUploading}
        />
        {errors.orderIndex && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.orderIndex}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 flex items-center">
          <Info size={12} className="mr-1" /> Defines the display order of
          videos
        </p>
      </div>

      <div>
        <label
          htmlFor="video"
          className=" text-sm font-medium text-gray-700 flex items-center"
        >
          <VideoIcon size={16} className="mr-1" />
          {initialData ? "Replace Video (optional)" : "Upload Video"}
          {!initialData && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="mt-1 flex items-center">
          <input
            type="file"
            id="video"
            name="video"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleVideoChange}
            className="sr-only"
            disabled={isLoading || isUploading}
          />

          <label
            htmlFor="video"
            className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
              isLoading || isUploading
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
          >
            <Upload size={16} className="mr-2" />
            {videoFile ? "Change Video" : "Select Video"}
          </label>

          {videoFile && (
            <span className="ml-2 text-sm text-gray-500 flex items-center">
              {videoFile.name.slice(0, 30)} (
              {Math.round((videoFile.size / 1024 / 1024) * 10) / 10} MB)
              {videoDuration && (
                <span className="ml-2 flex items-center text-gray-600">
                  <Clock size={14} className="mr-1" />
                  {formatDuration(videoDuration)}
                </span>
              )}
            </span>
          )}
        </div>

        {errors.video && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.video}
          </p>
        )}

        <p className="mt-1 text-xs text-gray-500 flex items-center">
          <Info size={12} className="mr-1" />
          Supported formats: MP4, WebM, OGG, QuickTime (max 5GB)
        </p>

        {/* Upload progress bar */}
        {isUploading && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1 flex justify-between">
              <span>Uploading... {uploadProgress}%</span>
              <span>
                {uploadProgress < 100 ? "Please wait" : "Processing video..."}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className={`inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            isLoading || isUploading
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
          } shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200`}
          disabled={isLoading || isUploading}
        >
          <X size={16} className="mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isLoading || isUploading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
          } transition-colors duration-200`}
        >
          <Save size={16} className="mr-2" />
          {isLoading || isUploading
            ? "Processing..."
            : initialData
            ? "Update Video"
            : "Upload Video"}
        </button>
      </div>
    </form>
  );
};

export default VideoForm;
