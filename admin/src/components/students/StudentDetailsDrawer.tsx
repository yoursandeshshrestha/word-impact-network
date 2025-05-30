import React from "react";
import { X } from "lucide-react";

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  durationYears: number;
  enrollmentDate: string;
  progress: {
    chaptersCompleted: number;
    totalChapters: number;
    examsPassed: number;
    totalExams: number;
  };
}

interface StudentStatistics {
  coursesEnrolled: number;
  chaptersCompleted: number;
  examsCompleted: number;
  examsPassed: number;
}

interface Student {
  id: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  email: string;
  statistics: StudentStatistics;
  courseProgress: CourseProgress[];
}

interface StudentDetailsDrawerProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

const StudentDetailsDrawer: React.FC<StudentDetailsDrawerProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Student Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{student.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{student.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{student.gender}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Overall Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Courses Enrolled</p>
                <p className="text-2xl font-semibold text-blue-700">
                  {student.statistics.coursesEnrolled}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Chapters Completed</p>
                <p className="text-2xl font-semibold text-green-700">
                  {student.statistics.chaptersCompleted}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Exams Completed</p>
                <p className="text-2xl font-semibold text-purple-700">
                  {student.statistics.examsCompleted}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600">Exams Passed</p>
                <p className="text-2xl font-semibold text-orange-700">
                  {student.statistics.examsPassed}
                </p>
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Course Progress
            </h3>
            <div className="space-y-4">
              {student.courseProgress.map((course) => (
                <div
                  key={course.courseId}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {course.courseTitle}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Duration: {course.durationYears}{" "}
                        {course.durationYears === 1 ? "Year" : "Years"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Enrolled:{" "}
                        {new Date(course.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Chapters Progress</p>
                      <div className="mt-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>
                            {course.progress.chaptersCompleted} of{" "}
                            {course.progress.totalChapters}
                          </span>
                          <span>
                            {Math.round(
                              (course.progress.chaptersCompleted /
                                course.progress.totalChapters) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (course.progress.chaptersCompleted /
                                  course.progress.totalChapters) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Exams Progress</p>
                      <div className="mt-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>
                            {course.progress.examsPassed} of{" "}
                            {course.progress.totalExams}
                          </span>
                          <span>
                            {Math.round(
                              (course.progress.examsPassed /
                                course.progress.totalExams) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (course.progress.examsPassed /
                                  course.progress.totalExams) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsDrawer;
