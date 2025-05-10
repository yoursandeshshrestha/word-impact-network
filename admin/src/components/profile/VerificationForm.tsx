import React, { useState } from "react";

interface VerificationFormProps {
  resetId: string;
  onSubmit: (resetId: string, verificationCode: string) => void;
  isLoading: boolean;
  errorMessage?: string;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  resetId,
  onSubmit,
  isLoading,
  errorMessage,
}) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationError(null);

    // Validation
    if (!verificationCode) {
      setValidationError("Verification code is required");
      return;
    }

    // Submit if validation passes
    onSubmit(resetId, verificationCode);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(validationError || errorMessage) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {validationError || errorMessage}
        </div>
      )}

      <div>
        <p className="text-sm text-gray-600 mb-4">
          A verification code has been sent to your email. Please enter it below
          to complete the password reset process.
        </p>

        <label
          htmlFor="verificationCode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Verification Code
        </label>
        <input
          type="text"
          id="verificationCode"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter verification code"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </button>
      </div>
    </form>
  );
};

export default VerificationForm;
