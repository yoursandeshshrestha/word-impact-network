import React from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  durationYears: number;
  enrollmentDate: string;
  progress: {
    chaptersCompleted: number;
    totalChapters: number;
    chapterCompletionPercentage: number;
    examsPassed: number;
    totalExams: number;
    examCompletionPercentage: number;
  };
}

interface StudentStatistics {
  coursesEnrolled: number;
  chaptersCompleted: number;
  totalChapters: number;
  overallChapterProgress: number;
  examsCompleted: number;
  examsPassed: number;
  totalExams: number;
  overallExamProgress: number;
  videosWatched: number;
  videosInProgress: number;
  certificationsEarned: number;
}

interface RecentExamAttempt {
  id: string;
  examTitle: string;
  chapterTitle: string;
  courseTitle: string;
  score: number;
  isPassed: boolean;
  startTime: string;
}

interface RecentVideoProgress {
  videoTitle: string;
  chapterTitle: string;
  courseTitle: string;
  watchedPercent: number;
  lastWatchedAt: string;
}

interface RecentActivity {
  recentExamAttempts: RecentExamAttempt[];
  recentVideoProgress: RecentVideoProgress[];
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
}

interface Payment {
  id: string;
  amount: string;
  status: string;
  paymentMethod: string;
  paidAt: string | null;
  paymentDueDate: string | null;
}

interface Student {
  id: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  email: string;
  country: string;
  academicQualification: string;
  desiredDegree: string;
  applicationStatus: string;
  paymentStatus: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  statistics: StudentStatistics;
  courseProgress: CourseProgress[];
  recentActivity: RecentActivity;
  application: Application | null;
  payments: Payment[];
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
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed inset-0 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
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

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Information */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-16 w-16">
                  {student.profilePictureUrl ? (
                    <Image
                      src={student.profilePictureUrl}
                      alt={student.fullName}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl">
                      {getInitials(student.fullName || "N/A")}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {student.fullName || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-500">{student.email || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{student.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{student.gender || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{student.country || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Academic Qualification
                  </p>
                  <p className="font-medium">
                    {student.academicQualification || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Desired Degree</p>
                  <p className="font-medium">
                    {student.desiredDegree || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application Status</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.applicationStatus === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : student.applicationStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {student.applicationStatus || "N/A"}
                  </span>
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
                  {student.statistics?.coursesEnrolled || 0}
                </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Chapters Progress</p>
                                  <p className="text-2xl font-semibold text-green-700">
                  {student.statistics?.overallChapterProgress || 0}%
                </p>
                <p className="text-xs text-green-600">
                  {student.statistics?.chaptersCompleted || 0}/
                  {student.statistics?.totalChapters || 0}
                </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Exams Progress</p>
                                  <p className="text-2xl font-semibold text-purple-700">
                  {student.statistics?.overallExamProgress || 0}%
                </p>
                <p className="text-xs text-purple-600">
                  {student.statistics?.examsPassed || 0}/
                  {student.statistics?.totalExams || 0}
                </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600">Videos Watched</p>
                  <p className="text-2xl font-semibold text-orange-700">
                    {student.statistics.videosWatched}
                  </p>
                  <p className="text-xs text-orange-600">
                    {student.statistics.videosInProgress} in progress
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-600">Certifications</p>
                  <p className="text-2xl font-semibold text-indigo-700">
                    {student.statistics.certificationsEarned}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600">Payment Status</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : student.paymentStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {student.paymentStatus || 'N/A'}
                  </span>
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
                        <p className="text-sm text-gray-500">
                          Chapters Progress
                        </p>
                        <div className="mt-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>
                              {course.progress.chaptersCompleted} of{" "}
                              {course.progress.totalChapters}
                            </span>
                            <span>
                              {course.progress.chapterCompletionPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${course.progress.chapterCompletionPercentage}%`,
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
                              {course.progress.examCompletionPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${course.progress.examCompletionPercentage}%`,
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

            {/* Recent Activity */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>

              {/* Recent Exam Attempts */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Recent Exam Attempts
                </h4>
                <div className="space-y-3">
                                      {student.recentActivity?.recentExamAttempts?.length > 0 ? (
                      student.recentActivity.recentExamAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {attempt.examTitle}
                            </p>
                            <p className="text-sm text-gray-500">
                              {attempt.chapterTitle} • {attempt.courseTitle}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(attempt.startTime).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                attempt.isPassed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {attempt.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No recent exam attempts
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Video Progress */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Recent Video Activity
                </h4>
                <div className="space-y-3">
                                      {student.recentActivity?.recentVideoProgress?.length > 0 ? (
                      student.recentActivity.recentVideoProgress.map(
                      (video, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {video.videoTitle}
                              </p>
                              <p className="text-sm text-gray-500">
                                {video.chapterTitle} • {video.courseTitle}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(
                                  video.lastWatchedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {video.watchedPercent}% watched
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-gray-500">
                      No recent video activity
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Application Details */}
            {student.application && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Application Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Application Status
                      </p>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.application.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : student.application.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.application.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applied Date</p>
                      <p className="font-medium">
                        {new Date(
                          student.application.appliedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    {student.application.reviewedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Reviewed Date</p>
                        <p className="font-medium">
                          {new Date(
                            student.application.reviewedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {student.application.reviewedBy && (
                      <div>
                        <p className="text-sm text-gray-500">Reviewed By</p>
                        <p className="font-medium">
                          {student.application.reviewedBy}
                        </p>
                      </div>
                    )}
                    {student.application.rejectionReason && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">
                          Rejection Reason
                        </p>
                        <p className="font-medium text-red-600">
                          {student.application.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            {student.payments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Information
                </h3>
                <div className="space-y-3">
                  {student.payments.map((payment) => (
                    <div key={payment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium">${payment.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Payment Method
                          </p>
                          <p className="font-medium">{payment.paymentMethod}</p>
                        </div>
                        {payment.paidAt && (
                          <div>
                            <p className="text-sm text-gray-500">Paid Date</p>
                            <p className="font-medium">
                              {new Date(payment.paidAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {payment.paymentDueDate && (
                          <div>
                            <p className="text-sm text-gray-500">Due Date</p>
                            <p className="font-medium">
                              {new Date(
                                payment.paymentDueDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsDrawer;
