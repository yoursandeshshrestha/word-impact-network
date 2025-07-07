import React, { useState, useRef, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { formatDuration } from "@/utils/formatters";
import * as tus from "tus-js-client";
import { api } from "@/lib/api";

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
  onUploadStateChange?: (isUploading: boolean) => void;
  existingVideos?: Array<{ orderIndex: number }>;
}

const VideoForm: React.FC<VideoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  uploadProgress,
  isUploading,
  onUploadStateChange,
  existingVideos = [],
}) => {
  // Calculate the next available order index
  const getNextOrderIndex = () => {
    if (initialData) return initialData.orderIndex; // Keep existing order for edits

    if (existingVideos.length === 0) return 1;

    const maxOrder = Math.max(...existingVideos.map((v) => v.orderIndex));
    return maxOrder + 1;
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    orderIndex: getNextOrderIndex(),
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploadingToVimeo, setIsUploadingToVimeo] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    orderIndex: "",
    video: "",
  });

  // Hidden video element to calculate duration
  const videoRef = useRef<HTMLVideoElement>(null);

  // Notify parent of upload state changes
  useEffect(() => {
    if (onUploadStateChange) {
      onUploadStateChange(isUploading || isUploadingToVimeo);
    }
  }, [isUploading, isUploadingToVimeo, onUploadStateChange]);

  // Initialize validation on mount
  useEffect(() => {
    // Check title validation
    if (formData.title.trim() && formData.title.trim().length < 3) {
      setErrors((prev) => ({
        ...prev,
        title: "Title must be at least 3 characters long",
      }));
    } else if (formData.title.trim() && formData.title.trim().length > 100) {
      setErrors((prev) => ({
        ...prev,
        title: "Title must not exceed 100 characters",
      }));
    }

    // Check description validation
    if (
      formData.description.trim() &&
      formData.description.trim().length < 10
    ) {
      setErrors((prev) => ({
        ...prev,
        description: "Description must be at least 10 characters long",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "orderIndex" ? parseInt(value) || "" : value,
    }));

    // Real-time validation for title and description
    if (name === "title") {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, title: "Title is required" }));
      } else if (value.trim().length < 3) {
        setErrors((prev) => ({
          ...prev,
          title: "Title must be at least 3 characters long",
        }));
      } else if (value.trim().length > 100) {
        setErrors((prev) => ({
          ...prev,
          title: "Title must not exceed 100 characters",
        }));
      } else {
        setErrors((prev) => ({ ...prev, title: "" }));
      }
    } else if (name === "description") {
      if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          description: "Description is required",
        }));
      } else if (value.trim().length < 10) {
        setErrors((prev) => ({
          ...prev,
          description: "Description must be at least 10 characters long",
        }));
      } else {
        setErrors((prev) => ({ ...prev, description: "" }));
      }
    } else {
      // Clear error when other fields are edited
      if (errors[name as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
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

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        video: "Video size exceeds 2GB. Please upload a smaller video.",
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

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = () => {
    const hasValidTitle =
      formData.title.trim().length >= 3 && formData.title.trim().length <= 100;
    const hasValidDescription = formData.description.trim().length >= 10;
    const hasValidOrder = formData.orderIndex > 0;
    const hasVideo = initialData || videoFile; // Video is required for new uploads

    return hasValidTitle && hasValidDescription && hasValidOrder && hasVideo;
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
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
      valid = false;
    } else if (formData.title.trim().length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
      valid = false;
    }

    // Validate description (now required)
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
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

    if (!validateForm()) return;

    // Editing existing video: keep old logic
    if (initialData) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("title", formData.title.trim());
      formDataToSubmit.append("description", formData.description.trim() || "");
      formDataToSubmit.append("orderIndex", formData.orderIndex.toString());
      if (videoFile) {
        formDataToSubmit.append("video", videoFile);
        if (videoDuration) {
          formDataToSubmit.append(
            "duration",
            Math.round(videoDuration).toString()
          );
        }
      }
      onSubmit(formDataToSubmit);
      // Clear upload status after submitting
      setUploadStatus("");
      return;
    }

    // New upload: direct-to-Vimeo
    if (!videoFile) return;

    setIsUploadingToVimeo(true);
    setUploadStatus("Creating upload session...");

    try {
      // 1. Get Vimeo upload URL from backend
      setUploadStatus("Creating upload session...");
      const response = await api.post<{ uploadLink: string; videoId: string }>(
        "/vimeo/create-upload",
        {
          title: formData.title.trim(),
          description: formData.description.trim() || "",
          size: videoFile.size,
        }
      );
      if (!response.data) throw new Error("Failed to get Vimeo upload URL");
      const { uploadLink, videoId } = response.data;

      // 2. Upload directly to Vimeo using TUS
      setUploadStatus("Uploading to Vimeo...");
      await new Promise((resolve, reject) => {
        const upload = new tus.Upload(videoFile, {
          uploadUrl: uploadLink,
          chunkSize: 5 * 1024 * 1024, // 5MB
          retryDelays: [0, 1000, 3000, 5000],
          metadata: {
            filename: videoFile.name,
            filetype: videoFile.type,
          },
          onError: (error) => {
            setErrors((prev) => ({
              ...prev,
              video: error.message || "Vimeo upload failed",
            }));
            reject(error);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const progress = Math.round((bytesUploaded / bytesTotal) * 100);
            setUploadStatus(`Uploading to Vimeo... ${progress}%`);
          },
          onSuccess: () => {
            setUploadStatus("Processing video...");
            resolve(undefined);
          },
        });
        upload.start();
      });

      // 3. Submit video info to backend using the new Vimeo endpoint
      setUploadStatus("Saving video information...");
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("title", formData.title.trim());
      formDataToSubmit.append("description", formData.description.trim() || "");
      formDataToSubmit.append("orderIndex", formData.orderIndex.toString());
      if (videoDuration) {
        formDataToSubmit.append(
          "duration",
          Math.round(videoDuration).toString()
        );
      }
      formDataToSubmit.append("vimeoId", videoId);
      onSubmit(formDataToSubmit);
      // Clear upload status after submitting
      setUploadStatus("");
    } catch (err: unknown) {
      let message = "Vimeo upload failed";
      if (err instanceof Error) message = err.message;
      setErrors((prev) => ({
        ...prev,
        video: message,
      }));
    } finally {
      setIsUploadingToVimeo(false);
      setUploadStatus("");
      if (onUploadStateChange) onUploadStateChange(false);
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
          disabled={isLoading || isUploading || isUploadingToVimeo}
        />
        <div className="mt-1 flex justify-between items-center">
          {errors.title && (
            <p className="text-sm text-red-500 flex items-center">
              <Info size={14} className="mr-1" /> {errors.title}
            </p>
          )}
          <p
            className={`text-xs flex items-center ${
              formData.title.trim().length < 3 ||
              formData.title.trim().length > 100
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {formData.title.trim().length}/100 characters (min: 3)
            {formData.title.trim().length >= 3 &&
              formData.title.trim().length <= 100 && (
                <span className="ml-1">✓</span>
              )}
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className=" text-sm font-medium text-gray-700 flex items-center"
        >
          <FileText size={16} className="mr-1" /> Description{" "}
          <span className="text-red-500 ml-1">*</span>
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
          placeholder="Enter video description"
          disabled={isLoading || isUploading || isUploadingToVimeo}
        />
        <div className="mt-1 flex justify-between items-center">
          {errors.description && (
            <p className="text-sm text-red-500 flex items-center">
              <Info size={14} className="mr-1" /> {errors.description}
            </p>
          )}
          <p
            className={`text-xs flex items-center ${
              formData.description.trim().length < 10
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {formData.description.trim().length}/10 characters minimum
            {formData.description.trim().length >= 10 && (
              <span className="ml-1">✓</span>
            )}
          </p>
        </div>
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
          disabled={isLoading || isUploading || isUploadingToVimeo}
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
            disabled={isLoading || isUploading || isUploadingToVimeo}
          />

          <label
            htmlFor="video"
            className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
              isLoading || isUploading || isUploadingToVimeo
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
          Supported formats: MP4, WebM, OGG, QuickTime (max 2GB)
        </p>

        {/* Upload progress bar */}
        {(isUploading || isUploadingToVimeo) && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1 flex justify-between">
              <span>
                {isUploadingToVimeo
                  ? uploadStatus || "Uploading to Vimeo..."
                  : `Uploading... ${uploadProgress}%`}
              </span>
              <span>
                {isUploadingToVimeo
                  ? "Please wait"
                  : uploadProgress < 100
                  ? "Please wait"
                  : "Processing video..."}
              </span>
            </div>
            {!isUploadingToVimeo && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className={`inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            isLoading || isUploading || isUploadingToVimeo
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
          } shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200`}
          disabled={isLoading || isUploading || isUploadingToVimeo}
        >
          <X size={16} className="mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            isLoading || isUploading || isUploadingToVimeo || !isFormValid()
          }
          className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isLoading || isUploading || isUploadingToVimeo || !isFormValid()
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
          } transition-colors duration-200`}
        >
          {isLoading || isUploading || isUploadingToVimeo ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <Save size={16} className="mr-2" />
          )}
          {isUploadingToVimeo
            ? uploadStatus || "Uploading to Vimeo..."
            : isLoading || isUploading
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
