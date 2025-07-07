import React from "react";
import { Student } from "@/redux/features/studentsSlice";

interface StudentsListProps {
  students: Student[];
  onViewDetails: (student: Student) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({
  students,
  onViewDetails,
}) => {
  const getPaymentStatusBadgeClass = (status: string) => {
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Country
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Courses
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.length > 0 ? (
            students.map((student) => (
              <tr
                key={student.id}
                onClick={() => onViewDetails(student)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {student.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.phoneNumber}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(
                      student.paymentStatus
                    )}`}
                  >
                    {student.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>
                        Chapters: {student.statistics.overallChapterProgress}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{
                            width: `${student.statistics.overallChapterProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span>
                        Exams: {student.statistics.overallExamProgress}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-green-600 h-1 rounded-full"
                          style={{
                            width: `${student.statistics.overallExamProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.statistics.coursesEnrolled} enrolled
                </td>
              </tr>
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
        </tbody>
      </table>
    </div>
  );
};

export default StudentsList;
