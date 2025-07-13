"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  Trash2,
  Save,
  Type,
  FileText,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { News, NewsImage, NewsVideo } from "@/types/news";
import imageCompression from "browser-image-compression";
import Image from "next/image";

interface NewsFormProps {
  news?: News | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  id: string;
}

const NewsForm: React.FC<NewsFormProps> = ({
  news,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  });

  // Multiple file states
  const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([]);
  const [videoFiles, setVideoFiles] = useState<FileWithPreview[]>([]);

  // Existing attachments (for editing)
  const [existingImages, setExistingImages] = useState<NewsImage[]>([]);
  const [existingVideos, setExistingVideos] = useState<NewsVideo[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!news;

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title,
        description: news.description || "",
        isActive: news.isActive,
      });

      // Load existing attachments
      setExistingImages(news.images || []);
      setExistingVideos(news.videos || []);
    } else {
      // Reset form when creating new news
      setFormData({
        title: "",
        description: "",
        isActive: true,
      });
      setExistingImages([]);
      setExistingVideos([]);
    }
  }, [news]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const validateImageFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, or WebP)";
    }

    if (file.size > maxSize) {
      return "Image size exceeds 5MB. Please upload a smaller image.";
    }

    return null;
  };

  const validateVideoFile = (file: File): string | null => {
    const validTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      return "Please upload a valid video file (MP4, WebM, OGG, QuickTime)";
    }

    if (file.size > maxSize) {
      return "Video size exceeds 100MB. Please upload a smaller video.";
    }

    return null;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      const error = validateImageFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, images: error }));
        return;
      }

      try {
        // Compress image
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageFiles((prev) => [
            ...prev,
            {
              file: compressedFile,
              preview: reader.result as string,
              id: generateFileId(),
            },
          ]);
        };
        reader.readAsDataURL(compressedFile);

        setErrors((prev) => ({ ...prev, images: "" }));
      } catch (error) {
        console.error("Error compressing image:", error);
        setErrors((prev) => ({
          ...prev,
          images: "Error compressing image. Please try again.",
        }));
      }
    }

    // Reset the input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      const error = validateVideoFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, videos: error }));
        return;
      }

      setVideoFiles((prev) => [
        ...prev,
        {
          file,
          id: generateFileId(),
        },
      ]);

      setErrors((prev) => ({ ...prev, videos: "" }));
    }

    // Reset the input value to allow selecting the same file again
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImageFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const removeVideo = (id: string) => {
    setVideoFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((image) => image.id !== id));
  };

  const removeExistingVideo = (id: string) => {
    setExistingVideos((prev) => prev.filter((video) => video.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title.trim());
    formDataToSend.append("description", formData.description.trim());
    formDataToSend.append("isActive", formData.isActive.toString());

    // Add new images
    imageFiles.forEach((fileWithPreview) => {
      formDataToSend.append("images", fileWithPreview.file);
    });

    // Add new videos
    videoFiles.forEach((fileWithPreview) => {
      formDataToSend.append("videos", fileWithPreview.file);
    });

    // Add existing attachments (for editing)
    if (isEditing) {
      existingImages.forEach((image) => {
        formDataToSend.append("existingImages", image.id);
      });

      existingVideos.forEach((video) => {
        formDataToSend.append("existingVideos", video.id);
      });
    }

    await onSubmit(formDataToSend);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
      {/* Title Field */}
      <div>
        <label
          htmlFor="title"
          className=" text-sm font-medium text-gray-700 mb-2 flex items-center"
        >
          <Type size={16} className="mr-2 flex-shrink-0" />
          Title <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`block w-full rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200 ${
            errors.title
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          } shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0`}
          placeholder="Enter news title"
        />
        {errors.title && (
          <p className="mt-2 text-sm text-red-500 flex items-start">
            <Info size={14} className="mr-1 mt-0.5 flex-shrink-0" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor="description"
          className=" text-sm font-medium text-gray-700 mb-2 flex items-center"
        >
          <FileText size={16} className="mr-2 flex-shrink-0" />
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="block w-full rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
          placeholder="Enter news description (optional)"
        />
      </div>

      {/* Status */}
      {/* News Status Field */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            {formData.isActive ? (
              <CheckCircle2
                size={16}
                className="mr-2 text-green-500 flex-shrink-0"
              />
            ) : (
              <XCircle size={16} className="mr-2 text-red-500 flex-shrink-0" />
            )}
            News Status
          </label>
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              formData.isActive
                ? "text-green-700 bg-green-100"
                : "text-red-700 bg-red-100"
            }`}
          >
            {formData.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={formData.isActive}
          onClick={() =>
            setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
          }
          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            formData.isActive ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span className="sr-only">
            {formData.isActive ? "Active" : "Inactive"}
          </span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
              formData.isActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>

        <p className="mt-2 text-xs text-gray-500 flex items-start">
          <Info size={12} className="mr-1 mt-0.5 flex-shrink-0" />
          {formData.isActive
            ? "News will be visible to users"
            : "News will be hidden from users"}
        </p>
      </div>

      {/* Images Section */}
      <div>
        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
          <ImageIcon size={16} className="mr-2 flex-shrink-0" />
          Images
        </label>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Existing Images
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((image) => (
                <div key={image.id} className="relative group">
                  <Image
                    src={image.url}
                    alt={image.fileName}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {image.fileName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        {imageFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              New Images
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imageFiles.map((fileWithPreview) => (
                <div key={fileWithPreview.id} className="relative group">
                  <Image
                    src={fileWithPreview.preview!}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(fileWithPreview.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {fileWithPreview.file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="images"
            className="cursor-pointer flex flex-col items-center"
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Upload Images
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              PNG, JPG, WebP up to 5MB each
            </span>
          </label>
        </div>
        {errors.images && (
          <p className="mt-2 text-sm text-red-500 flex items-start">
            <Info size={14} className="mr-1 mt-0.5 flex-shrink-0" />
            {errors.images}
          </p>
        )}
      </div>

      {/* Videos Section */}
      <div>
        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Video size={16} className="mr-2 flex-shrink-0" />
          Videos
        </label>

        {/* Existing Videos */}
        {existingVideos.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Existing Videos
            </h4>
            <div className="space-y-2">
              {existingVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {video.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(video.fileSize)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingVideo(video.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Videos */}
        {videoFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              New Videos
            </h4>
            <div className="space-y-2">
              {videoFiles.map((fileWithPreview) => (
                <div
                  key={fileWithPreview.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {fileWithPreview.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileWithPreview.file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(fileWithPreview.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="videos"
            multiple
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />
          <label
            htmlFor="videos"
            className="cursor-pointer flex flex-col items-center"
          >
            <Video className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Upload Videos
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              MP4, WebM, OGG up to 100MB each
            </span>
          </label>
        </div>
        {errors.videos && (
          <p className="mt-2 text-sm text-red-500 flex items-start">
            <Info size={14} className="mr-1 mt-0.5 flex-shrink-0" />
            {errors.videos}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
        >
          <X size={16} className="mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200 w-full sm:w-auto"
        >
          <Save size={16} className="mr-2" />
          {loading ? "Saving..." : isEditing ? "Update News" : "Create News"}
        </button>
      </div>
    </form>
  );
};

export default NewsForm;
