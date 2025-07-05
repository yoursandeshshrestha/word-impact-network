"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { getAuthToken } from "@/utils/auth";
import Image from "next/image";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  onRemoveImage?: () => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImageUrl,
  onRemoveImage,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("coverImage", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const data = await response.json();
      onImageUploaded(data.data.url);
      setUploadProgress(100);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await uploadImage(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    if (onRemoveImage) {
      onRemoveImage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Current image display */}
      {currentImageUrl && !isUploading && (
        <div className="relative">
          <Image
            src={currentImageUrl}
            alt="Current"
            className="w-full h-48 object-cover rounded-md border border-gray-300"
            onError={() => setError("Failed to load image")}
          />
          {onRemoveImage && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              disabled={disabled}
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Upload area */}
      {!currentImageUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            disabled || isUploading
              ? "border-gray-300 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={!disabled && !isUploading ? triggerFileInput : undefined}
        >
          {isUploading ? (
            <div className="space-y-3">
              <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Uploading...
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {disabled
                    ? "Upload disabled"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Upload button for when image is already uploaded */}
      {currentImageUrl && !isUploading && (
        <button
          type="button"
          onClick={triggerFileInput}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={disabled}
        >
          <Upload size={16} />
          Replace Image
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
