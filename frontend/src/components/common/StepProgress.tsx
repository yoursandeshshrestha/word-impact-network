import React from "react";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  clickable?: boolean;
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  onStepClick,
  clickable = false,
}) => {
  return (
    <div className="w-full">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isClickable = clickable && (isCompleted || isActive);

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-gray-800 border-gray-800 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                } ${isClickable ? "cursor-pointer hover:scale-105" : ""}`}
                onClick={() => isClickable && onStepClick?.(step.id)}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-gray-900"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 transition-colors duration-200 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex flex-col space-y-4 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isClickable = clickable && (isCompleted || isActive);

            return (
              <div key={step.id} className="flex items-center relative">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 flex-shrink-0 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isActive
                      ? "bg-gray-800 border-gray-800 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  } ${isClickable ? "cursor-pointer hover:scale-105" : ""}`}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p
                    className={`text-xs font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-gray-900"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-8 transition-colors duration-200 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tablet Layout - Compact horizontal */}
      <div className="hidden sm:flex md:hidden items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isClickable = clickable && (isCompleted || isActive);

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-gray-800 border-gray-800 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                } ${isClickable ? "cursor-pointer hover:scale-105" : ""}`}
                onClick={() => isClickable && onStepClick?.(step.id)}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-gray-900"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 mt-4 transition-colors duration-200 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
