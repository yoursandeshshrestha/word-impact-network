import React, { useEffect, useState } from "react";
import { Exam } from "@/redux/features/examsSlice";
import { Info, Type, FileText, Clock, BarChart, Save, X } from "lucide-react";

interface ExamFormProps {
  initialData?: Omit<
    Exam,
    "id" | "adminId" | "chapterId" | "createdAt" | "updatedAt" | "questions"
  > | null;
  onSubmit: (formData: Exam) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ExamForm: React.FC<ExamFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: 60, // Default time limit 60 minutes
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    timeLimit: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        timeLimit: initialData.timeLimit || 60,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? parseInt(value) : "") : value,
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
      timeLimit: "",
    };

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      valid = false;
    }

    // Validate time limit (can be null for no limit)
    if (
      formData.timeLimit !== null &&
      formData.timeLimit !== undefined &&
      formData.timeLimit < 0
    ) {
      newErrors.timeLimit =
        "Time limit must be a positive number or zero for no limit";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        timeLimit: formData.timeLimit === 0 ? null : formData.timeLimit,
        id: "",
        chapterId: "",
        adminId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
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
          placeholder="Enter exam title"
          disabled={isLoading}
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
          placeholder="Enter exam description (optional)"
          disabled={isLoading}
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
            htmlFor="timeLimit"
            className=" text-sm font-medium text-gray-700 flex items-center"
          >
            <Clock size={16} className="mr-1" /> Time Limit (minutes)
          </label>
          <input
            type="number"
            id="timeLimit"
            name="timeLimit"
            min="0"
            value={formData.timeLimit}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.timeLimit ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-text`}
            disabled={isLoading}
          />
          {errors.timeLimit && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <Info size={14} className="mr-1" /> {errors.timeLimit}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 flex items-center">
            <Info size={12} className="mr-1" /> Set to 0 for no time limit
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
          disabled={isLoading}
          className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isLoading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
          } transition-colors duration-200`}
        >
          <Save size={16} className="mr-2" />
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Exam"
            : "Create Exam"}
        </button>
      </div>
    </form>
  );
};

export default ExamForm;
