import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

interface CompletionRateChartProps {
  data: Array<{
    courseId: string;
    courseTitle: string;
    completionRate: number;
    totalStudents: number;
    completedStudents: number;
  }>;
  title?: string;
  description?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  limit?: number;
}

const CourseCompletionChart: React.FC<CompletionRateChartProps> = ({
  data,
  title = "Course Completion Rates",
  description = "Percentage of students who complete each course",
  height = 400,
  layout = "horizontal",
  limit = 10,
}) => {
  // Sort by completion rate descending and limit the number of courses
  const sortedData = [...data]
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, limit);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const course = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-bold mb-1">{course.courseTitle}</p>
          <p className="text-sm">
            Completion Rate:{" "}
            <span className="font-medium">
              {course.completionRate.toFixed(1)}%
            </span>
          </p>
          <p className="text-sm">
            Completed:{" "}
            <span className="font-medium">{course.completedStudents}</span> /{" "}
            {course.totalStudents} students
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
      <div className="p-4 pb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="p-4 pt-2">
        <div style={{ height: `${height}px`, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            {layout === "horizontal" ? (
              <BarChart
                data={sortedData}
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="courseTitle"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="completionRate"
                  fill="#8884d8"
                  name="Completion Rate (%)"
                />
              </BarChart>
            ) : (
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="courseTitle" width={150} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="completionRate"
                  fill="#8884d8"
                  name="Completion Rate (%)"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CourseCompletionChart;
