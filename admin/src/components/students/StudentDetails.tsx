import React from "react";
import { Student } from "@/redux/features/studentsSlice";
import Image from "next/image";

interface StudentDetailsProps {
  student: Student;
  onClose: () => void;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({
  student,
  onClose,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Safe string access function to prevent rendering objects directly
  const safeString = (value: string | object | null | undefined): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "string") return value;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const getGenderBadgeClass = (gender: string) => {
    switch (gender.toUpperCase()) {
      case "MALE":
        return "bg-blue-100 text-blue-800";
      case "FEMALE":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Student Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full overflow-hidden">
            {student.profilePictureUrl ? (
              <Image
                src={student.profilePictureUrl}
                alt={student.fullName}
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                {getInitials(student.fullName || "N/A")}
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium">
              {safeString(student.fullName)}
            </h3>
            <span
              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGenderBadgeClass(
                student.gender
              )}`}
            >
              {safeString(student.gender)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Contact Information
          </h4>
          <div className="space-y-2">
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>{safeString(student.email)}</span>
            </p>
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>{safeString(student.phoneNumber)}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Student ID</h4>
          <p className="text-gray-700 font-mono text-sm">
            {safeString(student.id)}
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
