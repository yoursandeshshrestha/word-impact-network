import React, { useEffect, useState } from "react";
import { Question, NewQuestion } from "@/redux/features/examsSlice";
import {
  Info,
  HelpCircle,
  Type,
  Check,
  List,
  Plus,
  Trash2,
  Save,
  X,
  CheckSquare,
  Square,
} from "lucide-react";

type QuestionType = "multiple_choice" | "true_false";

export type QuestionOption = {
  text: string;
  isCorrect: boolean;
};

interface QuestionFormProps {
  initialData?: Omit<
    Question,
    "id" | "examId" | "createdAt" | "updatedAt"
  > | null;
  onSubmit: (
    formData: Omit<Question, "id" | "examId" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    text: "",
    questionType: "multiple_choice" as QuestionType,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    correctAnswer: "",
    points: 1,
  });

  const [errors, setErrors] = useState({
    text: "",
    options: "",
    correctAnswer: "",
    points: "",
  });

  // Enhanced initialization with robust options processing
  useEffect(() => {
    if (initialData) {
      // Process options to handle all possible formats
      let processedOptions: QuestionOption[] = [];

      if (initialData.options) {
        // Case 1: If options is an array of objects with text property
        if (
          Array.isArray(initialData.options) &&
          initialData.options.length > 0 &&
          typeof initialData.options[0] === "object" &&
          "text" in initialData.options[0]
        ) {
          processedOptions = initialData.options.map((option) => ({
            text: option.text,
            // Mark as correct if isCorrect is true OR if text matches correctAnswer
            isCorrect:
              option.isCorrect === true ||
              option.text === initialData.correctAnswer,
          }));
        }
        // Case 2: If options is an array of strings (API format)
        else if (
          Array.isArray(initialData.options) &&
          initialData.options.length > 0 &&
          typeof initialData.options[0] === "string"
        ) {
          processedOptions = (initialData.options as unknown as string[]).map(
            (optionText) => ({
              text: optionText,
              isCorrect: optionText === initialData.correctAnswer,
            })
          );
        }
        // Case 3: If options is a string (possibly stringified JSON)
        else if (typeof initialData.options === "string") {
          try {
            const parsedOptions = JSON.parse(initialData.options);
            if (Array.isArray(parsedOptions)) {
              if (typeof parsedOptions[0] === "string") {
                processedOptions = parsedOptions.map((optionText) => ({
                  text: optionText,
                  isCorrect: optionText === initialData.correctAnswer,
                }));
              } else if (typeof parsedOptions[0] === "object") {
                processedOptions = parsedOptions.map((option) => ({
                  text: option.text,
                  isCorrect:
                    option.isCorrect ||
                    option.text === initialData.correctAnswer,
                }));
              }
            }
          } catch (error) {
            console.error("Failed to parse options:", error);
          }
        }
      }

      // Special handling for true/false questions
      if (initialData.questionType === "true_false") {
        // If we don't have proper true/false options, create them
        if (
          processedOptions.length !== 2 ||
          (processedOptions[0]?.text !== "True" &&
            processedOptions[0]?.text !== "False")
        ) {
          processedOptions = [
            { text: "True", isCorrect: initialData.correctAnswer === "True" },
            { text: "False", isCorrect: initialData.correctAnswer === "False" },
          ];
        }
      }

      // For multiple choice, ensure at least 2 options, typically 4
      if (
        initialData.questionType === "multiple_choice" &&
        processedOptions.length < 2
      ) {
        // Add empty options until we have 4
        while (processedOptions.length < 4) {
          processedOptions.push({ text: "", isCorrect: false });
        }
      }


      // Update form state with processed data
      setFormData({
        text: initialData.text || "",
        questionType:
          (initialData.questionType as QuestionType) || "multiple_choice",
        options: processedOptions,
        correctAnswer: initialData.correctAnswer || "",
        points: initialData.points || 1,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "questionType") {
      // Reset options and correct answer when question type changes
      let newOptions = [...formData.options];
      const newCorrectAnswer = "";

      if (value === "true_false") {
        newOptions = [
          { text: "True", isCorrect: false },
          { text: "False", isCorrect: false },
        ];
      } else if (value === "multiple_choice") {
        newOptions = [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ];
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value as QuestionType,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      }));
    } else if (name === "points") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 1,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text: value };

    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));

    // Clear options error
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  const handleOptionCorrectChange = (index: number) => {
    const newOptions = [...formData.options];

    // For multiple choice and true/false, only one option can be correct
    if (
      formData.questionType === "multiple_choice" ||
      formData.questionType === "true_false"
    ) {
      newOptions.forEach((option, i) => {
        option.isCorrect = i === index;
      });
    }

    // Update correctAnswer for API compatibility
    const correctAnswer = newOptions[index].text;

    setFormData((prev) => ({
      ...prev,
      options: newOptions,
      correctAnswer,
    }));

    // Clear correct answer error
    if (errors.correctAnswer) {
      setErrors((prev) => ({ ...prev, correctAnswer: "" }));
    }
  };

  const addOption = () => {
    if (formData.questionType === "multiple_choice") {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, { text: "", isCorrect: false }],
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      setErrors((prev) => ({
        ...prev,
        options: "Multiple choice questions require at least 2 options",
      }));
      return;
    }

    const newOptions = [...formData.options];
    newOptions.splice(index, 1);

    // If we removed the correct option, reset correctAnswer
    const wasCorrect = formData.options[index].isCorrect;
    let newCorrectAnswer = formData.correctAnswer;

    if (wasCorrect) {
      newCorrectAnswer = "";
    }

    setFormData((prev) => ({
      ...prev,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      text: "",
      options: "",
      correctAnswer: "",
      points: "",
    };

    // Validate question text
    if (!formData.text.trim()) {
      newErrors.text = "Question text is required";
      valid = false;
    }

    // Validate options for multiple choice and true/false
    // Check if all options have text
    const emptyOptions = formData.options.filter(
      (option) => !option.text.trim()
    );
    if (emptyOptions.length > 0) {
      newErrors.options = "All options must have text";
      valid = false;
    }

    // Check if at least one option is marked as correct
    const hasCorrectOption = formData.options.some(
      (option) => option.isCorrect
    );
    if (!hasCorrectOption) {
      newErrors.correctAnswer = "Please select the correct answer";
      valid = false;
    }

    // Validate points
    if (formData.points < 1) {
      newErrors.points = "Points must be at least 1";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const correctOption = formData.options.find((option) => option.isCorrect);

      // Construct payload with only necessary fields using NewQuestion type
      const payload: NewQuestion = {
        text: formData.text.trim(),
        questionType: formData.questionType,
        options: formData.options.map((option) => ({
          text: option.text,
          isCorrect: option.isCorrect,
        })),
        correctAnswer: correctOption?.text || null,
        points: formData.points,
      };

      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="text"
          className="text-sm font-medium text-gray-700 flex items-center"
        >
          <HelpCircle size={16} className="mr-1" /> Question{" "}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="text"
          name="text"
          rows={3}
          value={formData.text}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.text ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-text`}
          placeholder="Enter your question"
          disabled={isLoading}
        />
        {errors.text && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.text}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="questionType"
          className="text-sm font-medium text-gray-700 flex items-center"
        >
          <Type size={16} className="mr-1" /> Question Type{" "}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="questionType"
          name="questionType"
          value={formData.questionType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-pointer"
          disabled={isLoading}
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True/False</option>
        </select>
      </div>

      {/* Options for multiple choice and true/false */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <List size={16} className="mr-1" /> Options{" "}
            <span className="text-red-500 ml-1">*</span>
          </label>
          {formData.questionType === "multiple_choice" && (
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors duration-200"
              disabled={isLoading}
            >
              <Plus size={14} className="mr-1" />
              Add Option
            </button>
          )}
        </div>

        {errors.options && (
          <p className="mt-1 mb-2 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.options}
          </p>
        )}

        {errors.correctAnswer && (
          <p className="mt-1 mb-2 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.correctAnswer}
          </p>
        )}

        <div className="space-y-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-start space-x-2">
              <button
                type="button"
                onClick={() => handleOptionCorrectChange(index)}
                className={`mt-2 ${
                  option.isCorrect ? "text-green-600" : "text-gray-400"
                } hover:text-green-700 cursor-pointer transition-colors duration-200`}
                disabled={isLoading}
              >
                {option.isCorrect ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-text"
                  placeholder={`Option ${index + 1}`}
                  disabled={isLoading}
                />
              </div>

              {formData.questionType === "multiple_choice" &&
                formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="mt-2 text-red-500 hover:text-red-700 cursor-pointer transition-colors duration-200"
                    disabled={isLoading}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Points */}
      <div>
        <label
          htmlFor="points"
          className="text-sm font-medium text-gray-700 flex items-center"
        >
          <Check size={16} className="mr-1" /> Points{" "}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="number"
          id="points"
          name="points"
          min="1"
          value={formData.points}
          onChange={handleChange}
          className={`mt-1 block w-40 rounded-md border ${
            errors.points ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-text`}
          disabled={isLoading}
        />
        {errors.points && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <Info size={14} className="mr-1" /> {errors.points}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 flex items-center">
          <Info size={12} className="mr-1" /> Points awarded for a correct
          answer
        </p>
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
            ? "Update Question"
            : "Add Question"}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
