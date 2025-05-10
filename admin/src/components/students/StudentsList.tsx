import React from "react";
import { Student } from "@/src/redux/features/studentsSlice";

interface StudentsListProps {
  students: Student[];
  onViewDetails: (student: Student) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({
  students,
  onViewDetails,
}) => {
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
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gender
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGenderBadgeClass(
                      student.gender
                    )}`}
                  >
                    {student.gender}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
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
