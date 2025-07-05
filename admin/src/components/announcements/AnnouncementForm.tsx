"use client";

import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { Announcement } from "@/types/announcement";
import imageCompression from "browser-image-compression";
import Image from "next/image";

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!announcement;

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
      });
      // Set existing image preview if available
      if (announcement.imageUrl) {
        setImagePreview(announcement.imageUrl);
      }
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Please upload a valid image file (JPEG, PNG, or WebP)",
      }));
      return;
    }

    try {
      // Compression options
      const options = {
        maxSizeMB: 1, // Max file size 1MB
        maxWidthOrHeight: 1920, // Max width/height 1920px
        useWebWorker: true, // Use web worker for better performance
      };

      // Compress the image
      const compressedFile = await imageCompression(file, options);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      setImageFile(compressedFile);
      setErrors((prev) => ({ ...prev, image: "" }));
    } catch (error) {
      console.error("Error compressing image:", error);
      setErrors((prev) => ({
        ...prev,
        image: "Error compressing image. Please try again.",
      }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Create a new FormData object
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append("title", formData.title.trim());
      formDataToSubmit.append("content", formData.content.trim());

      // Add image if provided
      if (imageFile) {
        // Validate file type again before submission
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/webp",
        ];
        if (!validTypes.includes(imageFile.type)) {
          setErrors((prev) => ({
            ...prev,
            image: "Please upload a valid image file (JPEG, PNG, or WebP)",
          }));
          return;
        }

        // Validate file size again before submission
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (imageFile.size > maxSize) {
          setErrors((prev) => ({
            ...prev,
            image: "Image size exceeds 2MB. Please upload a smaller image.",
          }));
          return;
        }

        // Ensure the file has a proper name
        const fileExtension = imageFile.name.split(".").pop()?.toLowerCase();
        const timestamp = new Date().getTime();
        const newFileName = `announcement-${timestamp}.${fileExtension}`;
        const renamedFile = new File([imageFile], newFileName, {
          type: imageFile.type,
        });

        formDataToSubmit.append("image", renamedFile);
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image (Optional)
              </label>

              {imagePreview ? (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-md border border-gray-300"
                    unoptimized={imagePreview.startsWith("data:")}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload an image
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, WebP up to 2MB
                    </span>
                  </label>
                </div>
              )}

              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
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
