"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  FileText,
  Video,
  Upload,
  Trash2,
} from "lucide-react";
import {
  Announcement,
  AnnouncementImage,
  AnnouncementFile,
  AnnouncementVideo,
} from "@/types/announcement";
import imageCompression from "browser-image-compression";
import Image from "next/image";

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  id: string;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  announcement,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  // Multiple file states
  const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([]);
  const [fileAttachments, setFileAttachments] = useState<FileWithPreview[]>([]);
  const [videoFiles, setVideoFiles] = useState<FileWithPreview[]>([]);

  // Existing attachments (for editing)
  const [existingImages, setExistingImages] = useState<AnnouncementImage[]>([]);
  const [existingFiles, setExistingFiles] = useState<AnnouncementFile[]>([]);
  const [existingVideos, setExistingVideos] = useState<AnnouncementVideo[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!announcement;

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
      });

      // Load existing attachments
      setExistingImages(announcement.images || []);
      setExistingFiles(announcement.files || []);
      setExistingVideos(announcement.videos || []);
    } else {
      // Reset form when creating new announcement
      setFormData({
        title: "",
        content: "",
      });
      setExistingImages([]);
      setExistingFiles([]);
      setExistingVideos([]);
    }
  }, [announcement]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
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

  const validateDocumentFile = (file: File): string | null => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return "Please upload a valid document file (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV)";
    }

    if (file.size > maxSize) {
      return "File size exceeds 10MB. Please upload a smaller file.";
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
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB

    if (!validTypes.includes(file.type)) {
      return "Please upload a valid video file (MP4, WebM, OGG, QuickTime)";
    }

    if (file.size > maxSize) {
      return "Video size exceeds 5GB. Please upload a smaller video.";
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      const error = validateDocumentFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, files: error }));
        return;
      }

      setFileAttachments((prev) => [
        ...prev,
        {
          file,
          id: generateFileId(),
        },
      ]);
      setErrors((prev) => ({ ...prev, files: "" }));
    }
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
  };

  const removeImage = (id: string) => {
    setImageFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const removeFile = (id: string) => {
    setFileAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const removeVideo = (id: string) => {
    setVideoFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Remove existing attachments
  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((item) => item.id !== id));
  };

  const removeExistingFile = (id: string) => {
    setExistingFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const removeExistingVideo = (id: string) => {
    setExistingVideos((prev) => prev.filter((item) => item.id !== id));
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

    try {
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append("title", formData.title.trim());
      formDataToSubmit.append("content", formData.content.trim());

      // Add images
      imageFiles.forEach((item) => {
        formDataToSubmit.append("images", item.file);
      });

      // Add files
      fileAttachments.forEach((item) => {
        formDataToSubmit.append("files", item.file);
      });

      // Add videos
      videoFiles.forEach((item) => {
        formDataToSubmit.append("videos", item.file);
      });

      // Add existing attachments info for editing
      if (isEditing) {
        // Add existing images to keep
        existingImages.forEach((image) => {
          formDataToSubmit.append("existingImages", image.id);
        });

        // Add existing files to keep
        existingFiles.forEach((file) => {
          formDataToSubmit.append("existingFiles", file.id);
        });

        // Add existing videos to keep
        existingVideos.forEach((video) => {
          formDataToSubmit.append("existingVideos", video.id);
        });
      }

      await onSubmit(formDataToSubmit);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Announcement" : "Create New Announcement"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter announcement title"
                disabled={loading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.content ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter announcement content"
                disabled={loading}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* Images Upload */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                <ImageIcon size={16} className="mr-2" />
                Images (Optional) - {imageFiles.length + existingImages.length}/5 images
              </label>

              <div className="space-y-4">
                {/* Upload Area */}
                {imageFiles.length + existingImages.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="images"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={loading}
                    />
                    <label
                      htmlFor="images"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload images
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        JPEG, PNG, WebP up to 5MB each
                      </span>
                    </label>
                  </div>
                )}

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Existing Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <Image
                            src={image.url}
                            alt={image.fileName}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            disabled={loading}
                          >
                            <X size={12} />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {image.fileName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageFiles.map((item) => (
                      <div key={item.id} className="relative group">
                        <Image
                          src={item.preview!}
                          alt="Preview"
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(item.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          disabled={loading}
                        >
                          <X size={12} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {item.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errors.images && (
                <p className="mt-1 text-sm text-red-600">{errors.images}</p>
              )}
            </div>

            {/* Files Upload */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText size={16} className="mr-2" />
                Documents (Optional) - {fileAttachments.length + existingFiles.length}/5 files
              </label>

              <div className="space-y-4">
                {/* Upload Area */}
                {fileAttachments.length + existingFiles.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="files"
                      name="files"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={loading}
                    />
                    <label
                      htmlFor="files"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload documents
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, XLS, XLSX, TXT, CSV up to 10MB each
                      </span>
                    </label>
                  </div>
                )}

                {/* Existing Files */}
                {existingFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Existing Files
                    </h4>
                    <div className="space-y-2">
                      {existingFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.fileSize)} •{" "}
                                {file.fileType}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              <FileText size={16} />
                            </a>
                            <button
                              type="button"
                              onClick={() => removeExistingFile(file.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              disabled={loading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New File List */}
                {fileAttachments.length > 0 && (
                  <div className="space-y-2">
                    {fileAttachments.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(item.file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errors.files && (
                <p className="mt-1 text-sm text-red-600">{errors.files}</p>
              )}
            </div>

            {/* Videos Upload */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Video size={16} className="mr-2" />
                Videos (Optional) - {videoFiles.length + existingVideos.length}/3 videos
              </label>

              <div className="space-y-4">
                {/* Upload Area */}
                {videoFiles.length + existingVideos.length < 3 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="videos"
                      name="videos"
                      accept="video/*"
                      multiple
                      onChange={handleVideoChange}
                      className="hidden"
                      disabled={loading}
                    />
                    <label
                      htmlFor="videos"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload videos
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        MP4, WebM, OGG, QuickTime up to 100MB each
                      </span>
                    </label>
                  </div>
                )}

                {/* Existing Videos */}
                {existingVideos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Existing Videos
                    </h4>
                    <div className="space-y-2">
                      {existingVideos.map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center space-x-3">
                            <Video className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {video.fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(video.fileSize)}
                                {video.duration &&
                                  ` • ${Math.floor(video.duration / 60)}:${(
                                    video.duration % 60
                                  )
                                    .toString()
                                    .padStart(2, "0")}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={video.vimeoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              <Video size={16} />
                            </a>
                            <button
                              type="button"
                              onClick={() => removeExistingVideo(video.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              disabled={loading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Video List */}
                {videoFiles.length > 0 && (
                  <div className="space-y-2">
                    {videoFiles.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <Video className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(item.file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideo(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errors.videos && (
                <p className="mt-1 text-sm text-red-600">{errors.videos}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? "Updating..." : "Creating..."}
                  </div>
                ) : isEditing ? (
                  "Update Announcement"
                ) : (
                  "Create Announcement"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementForm;
