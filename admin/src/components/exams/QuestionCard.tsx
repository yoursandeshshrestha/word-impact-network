import React from "react";
import { Question } from "@/redux/features/examsSlice";
import { Edit, Trash2, Check, List, CheckSquare, Square } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  onEdit,
  onDelete,
}) => {
  // Process options to ensure consistent format for display
  const processOptions = () => {
    // If no options, return empty array
    if (!question.options) return [];

    // If options is an array of strings (API format)
    if (
      Array.isArray(question.options) &&
      typeof question.options[0] === "string"
    ) {
      return (question.options as unknown as string[]).map(
        (optionText: string) => ({
          text: optionText,
          isCorrect: optionText === question.correctAnswer,
        })
      );
    }

    // If options is already array of objects
    if (
      Array.isArray(question.options) &&
      typeof question.options[0] === "object"
    ) {
      return question.options.map((option) => ({
        text: option.text,
        isCorrect: option.isCorrect || option.text === question.correctAnswer,
      }));
    }

    // If options is a string (perhaps stringified JSON)
    if (typeof question.options === "string") {
      try {
        const parsedOptions = JSON.parse(question.options);
        if (Array.isArray(parsedOptions)) {
          if (typeof parsedOptions[0] === "string") {
            return parsedOptions.map((optionText) => ({
              text: optionText,
              isCorrect: optionText === question.correctAnswer,
            }));
          } else {
            return parsedOptions.map((option) => ({
              text: option.text,
              isCorrect:
                option.isCorrect || option.text === question.correctAnswer,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to parse options:", error);
      }
    }

    return [];
  };

  const options = processOptions();

  const questionTypeIcons = {
    multiple_choice: <List size={18} className="text-blue-600" />,
    true_false: <CheckSquare size={18} className="text-green-600" />,
  };

  const questionTypeLabels = {
    multiple_choice: "Multiple Choice",
    true_false: "True/False",
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex">
            <div className="bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-indigo-700 font-semibold">
                {questionNumber}
              </span>
            </div>
            <div className="flex flex-col">
              <h3
                className="text-md font-semibold text-gray-900 mb-2"
                title={question.text}
              >
                {question.text}
              </h3>
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  {questionTypeIcons[
                    question.questionType as keyof typeof questionTypeIcons
                  ] || <List size={16} className="mr-1" />}
                  <span className="ml-1">
                    {questionTypeLabels[
                      question.questionType as keyof typeof questionTypeLabels
                    ] || "Multiple Choice"}
                  </span>
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check size={14} className="mr-1" />
                  {question.points} point{question.points !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(question)}
              className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
              aria-label="Edit question"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(question.id)}
              className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 cursor-pointer"
              aria-label="Delete question"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Show options for multiple choice or true/false */}
        {options.length > 0 && (
          <div className="mt-3 ml-11 bg-gray-50 p-3 rounded-md">
            <p className="text-xs font-medium text-gray-500 mb-2">Options:</p>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center text-sm p-2 rounded ${
                    option.isCorrect ? "bg-green-50" : "bg-white"
                  }`}
                >
                  {option.isCorrect ? (
                    <CheckSquare
                      size={16}
                      className="mr-2 text-green-600 flex-shrink-0"
                    />
                  ) : (
                    <Square
                      size={16}
                      className="mr-2 text-gray-400 flex-shrink-0"
                    />
                  )}
                  <span
                    className={
                      option.isCorrect
                        ? "font-medium text-green-700"
                        : "text-gray-700"
                    }
                  >
                    {option.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
