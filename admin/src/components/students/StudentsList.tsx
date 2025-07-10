import React from "react";
import { Student } from "@/redux/features/studentsSlice";
import Image from "next/image";
import ResponsiveTable from "@/components/common/ResponsiveTable";
import ResponsiveTableRow from "@/components/common/ResponsiveTableRow";

interface StudentsListProps {
  students: Student[];
  onViewDetails: (student: Student) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({
  students,
  onViewDetails,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPaymentStatusBadgeClass = (status: string | undefined | null) => {
    if (!status) {
      return "bg-gray-100 text-gray-800";
    }

    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAYLATER":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const headers = [
    "Name",
    "Email",
    "Country",
    "Payment Status",
    "Progress",
    "Courses",
  ];

  return (
    <ResponsiveTable headers={headers}>
      {students.length > 0 ? (
        students.map((student) => (
          <ResponsiveTableRow
            key={student.id}
            onClick={() => onViewDetails(student)}
            mobileCardContent={
              <div className="space-y-3">
                {/* Student Info */}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-12 w-12">
                    {student.profilePictureUrl ? (
                      <Image
                        src={student.profilePictureUrl}
                        alt={student.fullName}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(student.fullName || "N/A")}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {student.fullName || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.email || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.country || "N/A"}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(
                      student.paymentStatus
                    )}`}
                  >
                    {student.paymentStatus || "N/A"}
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center justify-between">
                      <span>Chapters Progress:</span>
                      <span className="font-medium">
                        {student.statistics?.overallChapterProgress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            student.statistics?.overallChapterProgress || 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center justify-between">
                      <span>Exams Progress:</span>
                      <span className="font-medium">
                        {student.statistics?.overallExamProgress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            student.statistics?.overallExamProgress || 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Courses */}
                <div className="text-sm text-gray-500">
                  {student.statistics?.coursesEnrolled || 0} courses enrolled
                </div>
              </div>
            }
          >
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  {student.profilePictureUrl ? (
                    <Image
                      src={student.profilePictureUrl}
                      alt={student.fullName}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(student.fullName || "N/A")}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {student.fullName || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {student.phoneNumber || "N/A"}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {student.email || "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {student.country || "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(
                  student.paymentStatus
                )}`}
              >
                {student.paymentStatus || "N/A"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <span>
                    Chapters: {student.statistics?.overallChapterProgress || 0}%
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full"
                      style={{
                        width: `${
                          student.statistics?.overallChapterProgress || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span>
                    Exams: {student.statistics?.overallExamProgress || 0}%
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-600 h-1 rounded-full"
                      style={{
                        width: `${
                          student.statistics?.overallExamProgress || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {student.statistics?.coursesEnrolled || 0} enrolled
            </td>
          </ResponsiveTableRow>
        ))
      ) : (
        <tr>
          <td
            colSpan={6}
            className="px-6 py-8 text-center text-sm text-gray-500"
          >
            No students found
          </td>
        </tr>
      )}
    </ResponsiveTable>
  );
};

export default StudentsList;
