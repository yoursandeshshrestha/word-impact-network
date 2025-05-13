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
}

const ChapterForm: React.FC<ChapterFormProps> = ({
  initialData,
  maxCourseYears,
  onSubmit,
  onCancel,
  isLoading,
}) => {
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
    }
  }, [initialData]);

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

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
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
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            ? "Update Chapter"
            : "Create Chapter"}
        </button>
      </div>
    </form>
  );
};

export default ChapterForm;
