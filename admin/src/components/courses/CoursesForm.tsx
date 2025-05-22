import React, { useEffect, useState, useRef } from "react";
import { Course } from "@/redux/features/coursesSlice";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { Editor } from "@tinymce/tinymce-react";
import {
  Upload,
  X,
  Info,
  Calendar,
  BookOpen,
  Type,
  FileText,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";

interface CourseFormProps {
  initialData?: Course | null;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const editorRef = useRef<Editor | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationYears: 1,
    isActive: true,
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    durationYears: "",
    coverImage: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        durationYears: initialData.durationYears || 1,
        isActive: initialData.isActive ?? true,
      });

      if (initialData.coverImageUrl) {
        setCoverImagePreview(initialData.coverImageUrl);
      }
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle rich text editor content change
  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({ ...prev, description: content }));

    // Clear error when editor content is changed
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Please upload a valid image file (JPEG, PNG, or WebP)",
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
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      setCoverImage(compressedFile);
      setErrors((prev) => ({ ...prev, coverImage: "" }));
    } catch (error) {
      console.error("Error compressing image:", error);
      setErrors((prev) => ({
        ...prev,
        coverImage: "Error compressing image. Please try again.",
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      title: "",
      description: "",
      durationYears: "",
      coverImage: "",
    };

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      valid = false;
    }

    // Validate description - check for empty HTML content
    const descriptionContent = formData.description
      .replace(/<(.|\n)*?>/g, "")
      .trim();
    if (!descriptionContent) {
      newErrors.description = "Description is required";
      valid = false;
    }

    // Validate duration years
    if (!formData.durationYears || formData.durationYears < 1) {
      newErrors.durationYears = "Duration must be at least 1 year";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Create a new FormData object
        const formDataToSubmit = new FormData();

        // Add text fields
        formDataToSubmit.append("title", formData.title.trim());
        formDataToSubmit.append("description", formData.description);
        formDataToSubmit.append(
          "durationYears",
          formData.durationYears.toString()
        );
        formDataToSubmit.append("isActive", formData.isActive.toString());

        // Add cover image if provided
        if (coverImage) {
          // Validate file type again before submission
          const validTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
          ];
          if (!validTypes.includes(coverImage.type)) {
            setErrors((prev) => ({
              ...prev,
              coverImage:
                "Please upload a valid image file (JPEG, PNG, or WebP)",
            }));
            return;
          }

          // Validate file size again before submission
          const maxSize = 2 * 1024 * 1024; // 2MB
          if (coverImage.size > maxSize) {
            setErrors((prev) => ({
              ...prev,
              coverImage:
                "Image size exceeds 2MB. Please upload a smaller image.",
            }));
            return;
          }

          // Ensure the file has a proper name
          const fileExtension = coverImage.name.split(".").pop()?.toLowerCase();
          const timestamp = new Date().getTime();
          const newFileName = `course-cover-${timestamp}.${fileExtension}`;
          const renamedFile = new File([coverImage], newFileName, {
            type: coverImage.type,
          });

          formDataToSubmit.append("coverImage", renamedFile);
        }

        // If editing and no new image was provided, keep the existing URL
        if (initialData?.coverImageUrl && !coverImage) {
          formDataToSubmit.append("coverImageUrl", initialData.coverImageUrl);
        }

        // If editing, include the course ID
        if (initialData?.id) {
          formDataToSubmit.append("id", initialData.id);
        }

        onSubmit(formDataToSubmit);
      } catch (error) {
        console.error("Error preparing form data:", error);
        setErrors((prev) => ({
          ...prev,
          coverImage: "Error preparing form data. Please try again.",
        }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="text-sm font-medium text-gray-700 flex items-center"
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
          placeholder="Enter course title"
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
          className="text-sm font-medium text-gray-700 flex items-center"
        >
          <FileText size={16} className="mr-1" /> Description{" "}
          <span className="text-red-500 ml-1">*</span>
        </label>

        {/* Rich Text Editor */}
        <div
          className={`mt-1 border ${
            errors.description ? "border-red-500" : "border-gray-300"
          } rounded-md overflow-hidden`}
        >
          <Editor
            apiKey="hwqbciee1qbh3165r74nw7fwh4n3z4vq2l2043ic44b2gv43" // Replace with your TinyMCE API key
            onInit={(evt, editor) => (editorRef.current = editor)}
            initialValue={formData.description}
            onEditorChange={handleEditorChange}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              placeholder: "Enter course description",
            }}
          />
        </div>

        {errors.description && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.description}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="durationYears"
          className="text-sm font-medium text-gray-700 flex items-center"
        >
          <Calendar size={16} className="mr-1" /> Duration (Years){" "}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="number"
          id="durationYears"
          name="durationYears"
          min="1"
          max="10"
          value={formData.durationYears}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.durationYears ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-text`}
        />
        {errors.durationYears && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.durationYears}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="coverImage"
          className="text-sm font-medium text-gray-700 flex items-center"
        >
          <BookOpen size={16} className="mr-1" /> Cover Image
        </label>

        <div className="mt-1 flex items-center">
          <input
            type="file"
            id="coverImage"
            name="coverImage"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleImageChange}
            className="sr-only"
            aria-describedby="file-description"
          />

          <label
            htmlFor="coverImage"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
          >
            <Upload size={16} className="mr-2" />
            {coverImagePreview ? "Change Image" : "Upload Image"}
          </label>

          <span
            id="file-description"
            className="ml-2 text-xs text-gray-500 flex items-center"
          >
            <Info size={12} className="mr-1" />
            JPEG, PNG, WebP (max 2MB)
          </span>
        </div>

        {errors.coverImage && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.coverImage}
          </p>
        )}

        {coverImagePreview && (
          <div className="mt-2 relative h-48 w-full sm:w-96 rounded-md overflow-hidden">
            <Image
              src={coverImagePreview}
              alt="Cover image preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setCoverImage(null);
                setCoverImagePreview(null);
              }}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 rounded-full p-1 text-white hover:bg-opacity-100 transition-all duration-200 cursor-pointer"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            {formData.isActive ? (
              <CheckCircle2 size={16} className="mr-1 text-green-500" />
            ) : (
              <XCircle size={16} className="mr-1 text-red-500" />
            )}
            Course Status
          </label>
          <span
            className={`text-sm font-medium ${
              formData.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {formData.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={formData.isActive}
          onClick={handleToggleActive}
          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2 ${
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

        <p className="mt-1 text-xs text-gray-500 flex items-center">
          <Info size={12} className="mr-1" />
          {formData.isActive
            ? "Students can enroll in this course"
            : "Course is hidden from students"}
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
        >
          <X size={16} className="mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
        >
          <Save size={16} className="mr-2" />
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Course"
            : "Create Course"}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
