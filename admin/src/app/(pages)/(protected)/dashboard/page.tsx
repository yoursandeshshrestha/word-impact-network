"use client";

import React, { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import {
  BookOpen,
  FileText,
  Users,
  Video,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  PieChart,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import Loading from "@/components/common/Loading";
import NoDataFound from "@/components/common/NoDataFound";
import Link from "next/link";

// Add TypeScript types to resolve implicit 'any' type errors

// Define types for StatCard props
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number | string;
  link?: string;
  linkText?: string;
  color?: "blue" | "green" | "yellow" | "purple" | "red" | "indigo";
}

// Define types for SparklineChart props
interface SparklineChartProps {
  data: Record<string, number>;
  color: string;
}

// Define types for DonutChart props
interface DonutChartProps {
  value: number;
  total: number;
  color: string;
}

// Define a specific type for SimpleBarChart data items
interface ChartDataItem {
  [key: string]: number | string;
}

// Update SimpleBarChartProps to use the specific type
interface SimpleBarChartProps {
  data: ChartDataItem[];
  valueKey: string;
  labelKey: string;
  color: string;
}

// Define types for ActivityCard props
interface ActivityCardProps {
  item: ActivityItem;
  type: "student" | "application";
}

// Define specific types for course and video data
interface CourseData {
  courseTitle: string;
  enrollmentCount: number;
}

interface VideoData {
  videoTitle: string;
  watchCount: number;
}

// Define specific types for student and application data
interface StudentData {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
}

interface ApplicationData {
  id: string;
  name: string;
  email: string;
  appliedAt: string;
  status: string;
}

// Define a specific type for ActivityCard item
interface ActivityItem {
  id: string;
  name: string;
  email: string;
  registeredAt?: string;
  appliedAt?: string;
  status?: string;
}

// Dashboard Component
const Dashboard = () => {
  // Use the dashboard hook
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();

  // State for last refresh time
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Handle refresh
  const handleRefresh = () => {
    refreshDashboard();
    setLastRefresh(new Date());
  };

  // Stat Card Component
  const StatCard: React.FC<StatCardProps> = ({
    icon,
    title,
    value,
    link,
    linkText,
    color = "blue",
  }) => {
    const IconComponent = icon;
    const colorClasses: Record<string, string> = {
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      yellow: "bg-yellow-100 text-yellow-700",
      purple: "bg-purple-100 text-purple-700",
      red: "bg-red-100 text-red-700",
      indigo: "bg-indigo-100 text-indigo-700",
    };

    const sparklineColors: Record<string, string> = {
      blue: "#3b82f6",
      green: "#10b981",
      yellow: "#f59e0b",
      purple: "#8b5cf6",
      red: "#ef4444",
      indigo: "#6366f1",
    };

    // Generate mock trending data for visualization
    const getMockTrendData = (value: number): Record<string, number> => {
      const data: Record<string, number> = {};
      let tempValue = value * 0.7;

      // Generate 7 days of slightly increasing data
      for (let i = 0; i < 7; i++) {
        tempValue = tempValue * (1 + Math.random() * 0.1);
        data[`day${i}`] = Math.round(tempValue);
      }

      // Make sure the last value is the current value
      data["day6"] = value;

      return data;
    };

    const trendData = getMockTrendData(Number(value) || 1);

    // Simple Sparkline Chart Component
    const SparklineChart: React.FC<SparklineChartProps> = ({ data, color }) => {
      if (!data || Object.keys(data).length < 2) return null;

      const values = Object.values(data).map((val: number) =>
        typeof val === "number" ? val : 0
      );

      // Find min and max for scaling
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1; // Avoid division by zero

      // Create points for SVG path
      const points = values
        .map((value: number, index: number) => {
          const x = (index / (values.length - 1)) * 100;
          const y = 100 - ((value - min) / range) * 100;
          return `${x},${y}`;
        })
        .join(" ");

      return (
        <div className="h-16 w-24">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    };

    return (
      <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col">
        <div className="p-5 flex-grow">
          <div className="flex items-center mb-3">
            <div
              className={`flex-shrink-0 ${colorClasses[color]} rounded-md p-2.5`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-500 truncate">
                {title}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <SparklineChart data={trendData} color={sparklineColors[color]} />
          </div>
        </div>
        {link && (
          <div className="bg-gray-50 px-5 py-2.5 border-t border-gray-100 mt-auto">
            <Link
              href={link}
              className="text-sm text-blue-700 font-medium hover:text-blue-900 flex items-center"
            >
              {linkText} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        )}
      </div>
    );
  };

  // Custom Donut Chart Component
  const DonutChart: React.FC<DonutChartProps> = ({ value, total, color }) => {
    const percentage = total ? Math.round((value / total) * 100) : 0;
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute text-xl font-bold">{percentage}%</div>
      </div>
    );
  };

  // Simple Bar Chart Component
  const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
    data,
    valueKey,
    labelKey,
    color,
  }) => {
    if (!data || data.length === 0) return null;

    // Ensure type safety for optional properties in arithmetic operations
    const maxValue = Math.max(
      ...data.map((item: ChartDataItem) => (item[valueKey] as number) || 0)
    );

    return (
      <div className="space-y-3 h-64 overflow-y-auto pr-2">
        {data.map((item, index) => {
          const value = item[valueKey];
          const percentage = maxValue
            ? ((value as number) / maxValue) * 100
            : 0;

          return (
            <div key={index} className="flex flex-col">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium truncate">{item[labelKey]}</span>
                <span className="text-gray-500">{value}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Activity Card Component
  const ActivityCard: React.FC<ActivityCardProps> = ({ item, type }) => {
    // Different styling based on activity type
    if (type === "student") {
      // Use optional chaining and nullish coalescing for date parsing
      const registrationDate = new Date(item.registeredAt ?? Date.now());
      const currentDate = new Date();
      const daysDifference = Math.floor(
        (currentDate.getTime() - registrationDate.getTime()) /
          (1000 * 3600 * 24)
      );

      // Label for new students
      const isNew = daysDifference < 2;

      return (
        <div className="flex items-center py-3 hover:bg-gray-50 rounded-md px-2 transition-colors">
          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm">
            {item.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              {isNew && (
                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  New
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{item.email}</p>
          </div>
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {formatDate(item.registeredAt ?? "")}
          </div>
        </div>
      );
    } else if (type === "application") {
      // Use optional chaining and nullish coalescing for date parsing
      const applicationDate = new Date(item.appliedAt ?? Date.now());
      const currentDate = new Date();
      const daysDifference = Math.floor(
        (currentDate.getTime() - applicationDate.getTime()) / (1000 * 3600 * 24)
      );

      // Handle optional status property safely
      let statusClass = "bg-yellow-100 text-yellow-800";
      if (item.status === "APPROVED") {
        statusClass = "bg-green-100 text-green-800";
      } else if (item.status === "REJECTED") {
        statusClass = "bg-red-100 text-red-800";
      }

      return (
        <div className="flex items-center py-3 hover:bg-gray-50 rounded-md px-2 transition-colors">
          <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-sm">
            {item.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{item.email}</p>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
            >
              {(item.status?.charAt(0) ?? "") +
                (item.status?.slice(1).toLowerCase() ?? "")}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {daysDifference === 0 ? "Today" : `${daysDifference}d ago`}
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loading className="h-10 w-10 mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6 p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-1">
            Error Loading Dashboard
          </h3>
          <p>{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <NoDataFound
          icon="search"
          title="No Dashboard Data"
          message="Unable to load dashboard data at the moment."
        />
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Format course data for bar chart visualization
  const courseData =
    dashboardData.courseStats.popularCourses?.map((course: CourseData) => ({
      name: course.courseTitle,
      value: course.enrollmentCount,
    })) || [];

  // Format video data for bar chart visualization
  const videoData =
    dashboardData.videoStats.popularVideos?.map((video: VideoData) => ({
      name: video.videoTitle,
      value: video.watchCount,
    })) || [];

  // Update student and application data mapping with specific types
  const studentData = dashboardData.recentActivity.newStudents.map(
    (student: StudentData) => (
      <ActivityCard key={student.id} item={student} type="student" />
    )
  );

  const applicationData = dashboardData.recentActivity.newApplications.map(
    (application: ApplicationData) => (
      <ActivityCard
        key={application.id}
        item={application}
        type="application"
      />
    )
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold flex items-center">
          <PieChart className="h-6 w-6 mr-2 text-blue-600" />
          Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Students"
          value={dashboardData.counts.students}
          link="/students"
          linkText="View all students"
          color="blue"
        />

        <StatCard
          icon={BookOpen}
          title="Total Courses"
          value={dashboardData.counts.courses}
          link="/courses"
          linkText="View all courses"
          color="green"
        />

        <StatCard
          icon={FileText}
          title="Applications"
          value={dashboardData.applications.total}
          link="/applications"
          linkText="View all applications"
          color="indigo"
        />

        <StatCard
          icon={Video}
          title="Video Lessons"
          value={dashboardData.counts.videos}
          link="/courses"
          linkText="View all videos"
          color="purple"
        />
      </div>

      {/* Application Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Application Status Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Application Status
            </h2>
          </div>
          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Donut Chart */}
              <div className="flex-shrink-0">
                <DonutChart
                  value={dashboardData.applications.approved}
                  total={dashboardData.applications.total}
                  color="#22c55e"
                />
                <div className="text-center mt-2 text-sm font-medium text-gray-500">
                  Approval Rate
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {/* Pending Applications */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                    <h3 className="text-sm font-medium text-gray-700">
                      Pending
                    </h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.applications.pending}
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    {dashboardData.applications.total > 0
                      ? Math.round(
                          (dashboardData.applications.pending /
                            dashboardData.applications.total) *
                            100
                        )
                      : 0}
                    % of total
                  </div>
                </div>

                {/* Approved Applications */}
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <h3 className="text-sm font-medium text-gray-700">
                      Approved
                    </h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.applications.approved}
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    {dashboardData.applications.total > 0
                      ? Math.round(
                          (dashboardData.applications.approved /
                            dashboardData.applications.total) *
                            100
                        )
                      : 0}
                    % of total
                  </div>
                </div>

                {/* Rejected Applications */}
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <X className="h-4 w-4 text-red-600 mr-2" />
                    <h3 className="text-sm font-medium text-gray-700">
                      Rejected
                    </h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.applications.rejected}
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    {dashboardData.applications.total > 0
                      ? Math.round(
                          (dashboardData.applications.rejected /
                            dashboardData.applications.total) *
                            100
                        )
                      : 0}
                    % of total
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
            <Link
              href="/applications"
              className="text-sm text-blue-700 font-medium hover:text-blue-900 flex items-center"
            >
              Manage applications <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <IndianRupee className="h-5 w-5 mr-2 text-green-600" />
              Payment Information
            </h2>
          </div>
          <div className="p-5 flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">
                    Total Revenue
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(dashboardData.payments.totalRevenue)}
                  </p>
                </div>
              </div>

              {/* Total Payments */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">
                    Payments Received
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dashboardData.payments.totalPayments}
                  </p>
                </div>
              </div>

              {/* Pending Payments */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-600 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">
                    Pending Payments
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dashboardData.payments.studentsWithPendingPayment}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 mt-auto">
            <Link
              href="/payments"
              className="text-sm text-blue-700 font-medium hover:text-blue-900 flex items-center"
            >
              View payment details <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Activity and Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Recent Students
            </h3>
            <span className="text-xs text-gray-500">
              Showing {dashboardData.recentActivity.newStudents.length} of{" "}
              {dashboardData.counts.students}
            </span>
          </div>
          <div className="p-5 flex-grow">
            {dashboardData.recentActivity.newStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Users className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  No students registered yet
                </p>
                <p className="text-xs">New students will appear here</p>
              </div>
            ) : (
              <div className="space-y-1">{studentData}</div>
            )}
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 mt-auto">
            <Link
              href="/students"
              className="text-sm text-blue-700 font-medium hover:text-blue-900 flex items-center"
            >
              View all students <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Applications
            </h3>
            <span className="text-xs text-gray-500">
              Showing {dashboardData.recentActivity.newApplications.length} of{" "}
              {dashboardData.applications.total}
            </span>
          </div>
          <div className="p-5">
            {dashboardData.recentActivity.newApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  No applications submitted yet
                </p>
                <p className="text-xs">New applications will appear here</p>
              </div>
            ) : (
              <div className="space-y-1">{applicationData}</div>
            )}
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
            <Link
              href="/applications"
              className="text-sm text-blue-700 font-medium hover:text-blue-900 flex items-center"
            >
              View all applications <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-green-600" />
              Popular Courses
            </h3>
          </div>
          <div className="p-5 flex-grow">
            {!dashboardData.courseStats.popularCourses ||
            dashboardData.courseStats.popularCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  No course enrollment data yet
                </p>
                <p className="text-xs">
                  Popular courses will appear here once students enroll
                </p>
              </div>
            ) : (
              <SimpleBarChart
                data={courseData}
                valueKey="value"
                labelKey="name"
                color="#10b981"
              />
            )}
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 mt-auto">
            <Link
              href="/courses"
              className="text-sm text-blue-700 font-medium hover:text-blue-900 flex items-center"
            >
              View all courses <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Popular Videos */}
        <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col justify-between ">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Video className="h-5 w-5 mr-2 text-purple-600" />
              Most Watched Videos
            </h3>
          </div>
          <div className="p-5 flex-grow">
            {!dashboardData.videoStats.popularVideos ||
            dashboardData.videoStats.popularVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8  h-full text-center text-gray-500">
                <Video className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No video watch data yet</p>
                <p className="text-xs">
                  Popular videos will appear here as students watch content
                </p>
              </div>
            ) : (
              <SimpleBarChart
                data={videoData}
                valueKey="value"
                labelKey="name"
                color="#8b5cf6"
              />
            )}
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 mt-auto">
            <Link
              href="/videos"
              className="text-sm text-blue-700 font-medium hover:text-blue-900 flex items-center"
            >
              View all videos <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
