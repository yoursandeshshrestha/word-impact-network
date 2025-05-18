"use client";

import { useEffect, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  Users,
  CheckCircle,
  FileText,
  AlertCircle,
  BookOpen,
  Video,
  Map,
  BarChart2,
} from "lucide-react";
import EnrollmentTrendsChart from "@/components/analytics/EnrollmentTrendsChart";
import CourseCompletionChart from "@/components/analytics/CourseCompletionChart";
import VideoEngagementChart from "@/components/analytics/VideoEngagementChart";
import GeographicDistributionChart from "@/components/analytics/GeographicDistributionChart";
import MetricCard from "@/components/analytics/MetricCard";

const AnalyticsPage = () => {
  const {
    dashboard,
    enrollmentTrends,
    courseCompletionRates,
    videoEngagementMetrics,
    examPerformanceMetrics,
    studentProgressData,
    geographicDistribution,
    referralStats,
    isLoading,
    error,
    loadDashboard,
    loadEnrollmentTrends,
    resetError,
  } = useAnalytics();

  const [enrollmentPeriod, setEnrollmentPeriod] = useState<
    "week" | "month" | "year"
  >("month");
  const [activeTab, setActiveTab] = useState("overview");

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Load enrollment trends when period changes
  useEffect(() => {
    loadEnrollmentTrends(enrollmentPeriod);
  }, [enrollmentPeriod, loadEnrollmentTrends]);

  // Handle period change
  const handlePeriodChange = (value: string) => {
    setEnrollmentPeriod(value as "week" | "month" | "year");
  };

  if (isLoading && !dashboard) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <div className="flex">
            <div className="py-1">
              <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
              <button onClick={resetError} className="underline mt-2 text-sm">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalEnrollments = enrollmentTrends.reduce(
    (total, item) => total + item.count,
    0
  );
  const averageCompletionRate =
    courseCompletionRates.length > 0
      ? (
          courseCompletionRates.reduce(
            (total, course) => total + course.completionRate,
            0
          ) / courseCompletionRates.length
        ).toFixed(1)
      : "0";
  const averagePassRate =
    examPerformanceMetrics.length > 0
      ? (
          examPerformanceMetrics.reduce(
            (total, exam) => total + exam.passRate,
            0
          ) / examPerformanceMetrics.length
        ).toFixed(1)
      : "0";

  return (
    <div className="container mx-auto p-6">
      {/* Custom Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("overview");
              }}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                activeTab === "overview"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Overview
            </a>
          </li>
          <li className="mr-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("enrollment");
              }}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                activeTab === "enrollment"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Enrollment
            </a>
          </li>
          <li className="mr-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("courses");
              }}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                activeTab === "courses"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </a>
          </li>
          <li className="mr-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("engagement");
              }}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                activeTab === "engagement"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Video className="h-4 w-4 mr-2" />
              Engagement
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("demographics");
              }}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                activeTab === "demographics"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Map className="h-4 w-4 mr-2" />
              Demographics
            </a>
          </li>
        </ul>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="Total Enrollments"
              value={totalEnrollments}
              description="Recent student enrollments"
              icon={<Users className="h-6 w-6" />}
            />

            <MetricCard
              title="Average Completion Rate"
              value={`${averageCompletionRate}%`}
              description="Across all courses"
              icon={<CheckCircle className="h-6 w-6" />}
            />

            <MetricCard
              title="Exam Pass Rate"
              value={`${averagePassRate}%`}
              description="Average across all exams"
              icon={<FileText className="h-6 w-6" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <EnrollmentTrendsChart
              data={enrollmentTrends}
              title="Recent Enrollment Trends"
              description="New enrollments over time"
              period={enrollmentPeriod}
              onPeriodChange={handlePeriodChange}
            />

            <CourseCompletionChart
              data={courseCompletionRates}
              title="Top Courses by Completion"
              description="Courses with highest completion rates"
              layout="vertical"
              limit={5}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VideoEngagementChart
              data={videoEngagementMetrics}
              title="Top Engaging Videos"
              description="Videos with highest engagement"
              limit={5}
            />

            <GeographicDistributionChart
              data={geographicDistribution}
              title="Student Geographic Distribution"
              description="Top countries by student count"
              limit={5}
            />
          </div>
        </div>
      )}

      {/* Enrollment Tab */}
      {activeTab === "enrollment" && (
        <div>
          <EnrollmentTrendsChart
            data={enrollmentTrends}
            height={500}
            period={enrollmentPeriod}
            onPeriodChange={handlePeriodChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-6">
              <MetricCard
                title="Total Enrollments"
                value={totalEnrollments}
                description={`For the selected ${enrollmentPeriod} period`}
                icon={<Users className="h-6 w-6" />}
              />

              <MetricCard
                title="Average Daily Enrollments"
                value={(
                  totalEnrollments / Math.max(enrollmentTrends.length, 1)
                ).toFixed(1)}
                description="Average enrollments per day"
                icon={<BarChart2 className="h-6 w-6" />}
              />
            </div>

            <GeographicDistributionChart
              data={geographicDistribution}
              title="Enrollment by Country"
              description="Geographic distribution of students"
              height={350}
            />
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div>
          <CourseCompletionChart data={courseCompletionRates} height={500} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {courseCompletionRates.slice(0, 6).map((course) => (
              <MetricCard
                key={course.courseId}
                title={course.courseTitle}
                value={`${course.completionRate}%`}
                description={`${course.completedStudents} of ${course.totalStudents} students completed`}
                icon={<BookOpen className="h-5 w-5" />}
                footer={
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${course.completionRate}%` }}
                    ></div>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === "engagement" && (
        <div>
          <VideoEngagementChart data={videoEngagementMetrics} height={500} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-6">
              {videoEngagementMetrics.slice(0, 4).map((video) => (
                <MetricCard
                  key={video.videoId}
                  title={video.videoTitle}
                  value={video.viewCount}
                  description={`${video.chapterTitle} | ${video.courseTitle}`}
                  icon={<Video className="h-5 w-5" />}
                  footer={
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Watch Percentage:</span>
                        <span className="font-medium">
                          {video.averageWatchPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${video.averageWatchPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Student Progress</h3>
              <div className="space-y-4">
                {studentProgressData.slice(0, 5).map((student) => (
                  <div
                    key={student.studentId}
                    className="bg-white rounded-lg p-4 border"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-medium">{student.fullName}</div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        {student.overallProgress}%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 text-sm mb-2 gap-y-1">
                      <div>Courses: {student.coursesEnrolled}</div>
                      <div>Chapters: {student.chaptersCompleted}</div>
                      <div>Exams: {student.examsCompleted}</div>
                      <div>Passed: {student.examsSuccessful}</div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${student.overallProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demographics Tab */}
      {activeTab === "demographics" && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GeographicDistributionChart
              data={geographicDistribution}
              height={400}
              title="Student Geographic Distribution"
              description="Distribution of students by country"
            />

            <div>
              <h3 className="text-lg font-semibold mb-4">Top Countries</h3>
              <div className="bg-white rounded-lg border">
                <div className="grid grid-cols-12 bg-gray-50 p-3 font-medium border-b">
                  <div className="col-span-6">Country</div>
                  <div className="col-span-3 text-right">Students</div>
                  <div className="col-span-3 text-right">Percentage</div>
                </div>
                <div className="divide-y">
                  {geographicDistribution.slice(0, 10).map((country) => (
                    <div
                      key={country.country}
                      className="grid grid-cols-12 p-3"
                    >
                      <div className="col-span-6">{country.country}</div>
                      <div className="col-span-3 text-right">
                        {country.studentCount}
                      </div>
                      <div className="col-span-3 text-right">
                        {country.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Referral Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                  <GeographicDistributionChart
                    data={referralStats.map((ref) => ({
                      country: ref.referralSource,
                      studentCount: ref.studentCount,
                      percentage: ref.percentage,
                    }))}
                    title=""
                    description=""
                    height={300}
                    showLegend={false}
                  />
                </div>

                <div>
                  <div className="bg-white rounded-lg">
                    <div className="grid grid-cols-12 bg-gray-50 p-3 font-medium border-b">
                      <div className="col-span-6">Referral Source</div>
                      <div className="col-span-3 text-right">Students</div>
                      <div className="col-span-3 text-right">Percentage</div>
                    </div>
                    <div className="divide-y">
                      {referralStats.map((ref) => (
                        <div
                          key={ref.referralSource}
                          className="grid grid-cols-12 p-3"
                        >
                          <div className="col-span-6">{ref.referralSource}</div>
                          <div className="col-span-3 text-right">
                            {ref.studentCount}
                          </div>
                          <div className="col-span-3 text-right">
                            {ref.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
