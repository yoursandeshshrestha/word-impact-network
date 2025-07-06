import React, { useEffect, useState } from "react";
import { Chapter } from "@/redux/features/chaptersSlice";
import { Info, Type, FileText, Hash, Calendar, Save, X } from "lucide-react";

// Add this type for form data
export type ChapterFormData = {
  title: string;
  description: string;
  orderIndex: number;
  courseYear: number;
};

interface ChapterFormProps {
  initialData?: Chapter | null;
  courseId: string;
  maxCourseYears: number;
  onSubmit: (chapterData: ChapterFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  existingChapters?: Array<{ orderIndex: number; courseYear: number }>;
}

const ChapterForm: React.FC<ChapterFormProps> = ({
  initialData,
  maxCourseYears,
  onSubmit,
  onCancel,
  isLoading,
  existingChapters = [],
}) => {
  // Calculate the next available order index for the selected course year
  const getNextOrderIndex = (courseYear: number) => {
    if (initialData) return initialData.orderIndex; // Keep existing order for edits

    // Filter chapters by the selected course year
    const chaptersInYear = existingChapters.filter(
      (chapter) => chapter.courseYear === courseYear
    );

    if (chaptersInYear.length === 0) return 1;

    const maxOrder = Math.max(...chaptersInYear.map((c) => c.orderIndex));
    return maxOrder + 1;
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    orderIndex: 1,
    courseYear: 1,
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    orderIndex: "",
    courseYear: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        orderIndex: initialData.orderIndex || 1,
        courseYear: initialData.courseYear || 1,
      });
    } else {
      // For new chapters, set the next available order index
      setFormData((prev) => ({
        ...prev,
        orderIndex: getNextOrderIndex(prev.courseYear),
      }));
    }
  }, [initialData, existingChapters]);

  // Update order index when course year changes
  useEffect(() => {
    if (!initialData) {
      setFormData((prev) => ({
        ...prev,
        orderIndex: getNextOrderIndex(prev.courseYear),
      }));
    }
  }, [formData.courseYear, initialData, existingChapters]);

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
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "orderIndex" || name === "courseYear"
          ? parseInt(value) || ""
          : value,
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

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = () => {
    const hasValidTitle =
      formData.title.trim().length >= 3 && formData.title.trim().length <= 100;
    const hasValidDescription = formData.description.trim().length >= 10;
    const hasValidOrder = formData.orderIndex > 0;
    const hasValidYear =
      formData.courseYear >= 1 && formData.courseYear <= maxCourseYears;

    return (
      hasValidTitle && hasValidDescription && hasValidOrder && hasValidYear
    );
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      title: "",
      description: "",
      orderIndex: "",
      courseYear: "",
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

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
      valid = false;
    }

    // Validate order index
    if (!formData.orderIndex || formData.orderIndex < 1) {
      newErrors.orderIndex = "Order must be at least 1";
      valid = false;
    }

    // Validate course year
    if (
      !formData.courseYear ||
      formData.courseYear < 1 ||
      formData.courseYear > maxCourseYears
    ) {
      newErrors.courseYear = `Year must be between 1 and ${maxCourseYears}`;
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Format the data before submission
      const formattedData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        orderIndex: Number(formData.orderIndex),
        courseYear: Number(formData.courseYear),
      };

      onSubmit(formattedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          placeholder="Enter chapter title"
          disabled={isLoading}
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
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.description ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-text`}
          placeholder="Enter chapter description"
          disabled={isLoading}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="courseYear"
            className=" text-sm font-medium text-gray-700 flex items-center"
          >
            <Calendar size={16} className="mr-1" /> Year{" "}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="courseYear"
            name="courseYear"
            value={formData.courseYear}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.courseYear ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-pointer`}
            disabled={isLoading}
          >
            {[...Array(maxCourseYears)].map((_, index) => (
              <option key={index + 1} value={index + 1}>
                Year {index + 1}
              </option>
            ))}
          </select>
          {errors.courseYear && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <Info size={14} className="mr-1" /> {errors.courseYear}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 flex items-center">
            <Info size={12} className="mr-1" /> Year of the course curriculum
          </p>
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
            disabled={isLoading}
          />
          {errors.orderIndex && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <Info size={14} className="mr-1" /> {errors.orderIndex}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 flex items-center">
            <Info size={12} className="mr-1" /> Defines the display order of
            chapters
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className={`inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            isLoading
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
          } shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200`}
          disabled={isLoading}
        >
          <X size={16} className="mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isLoading || !isFormValid()
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
          } transition-colors duration-200`}
        >
          <Save size={16} className="mr-2" />
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Chapter"
            : "Create Chapter"}
        </button>
      </div>
    </form>
  );
};

export default ChapterForm;
