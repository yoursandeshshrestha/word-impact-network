import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { ChevronDown } from "lucide-react";

interface EnrollmentTrendsChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  title?: string;
  description?: string;
  height?: number;
  period?: string;
  onPeriodChange?: (value: string) => void;
  showPeriodSelector?: boolean;
}

const EnrollmentTrendsChart: React.FC<EnrollmentTrendsChartProps> = ({
  data,
  title = "Enrollment Trends",
  description = "Student enrollments over time",
  height = 400,
  period = "month",
  onPeriodChange,
  showPeriodSelector = true,
}) => {
  // Format the date for display
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString(),
  }));

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-bold mb-1">{payload[0].payload.formattedDate}</p>
          <p className="text-sm">
            Enrollments: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle period selection for custom dropdown
  const handlePeriodSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onPeriodChange) {
      onPeriodChange(e.target.value);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
      <div className="flex flex-row items-center justify-between p-4 pb-2">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {showPeriodSelector && onPeriodChange && (
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={period}
              onChange={handlePeriodSelect}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <ChevronDown className="absolute right-2 top-[50%] transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
          </div>
        )}
      </div>
      <div className="p-4 pt-2">
        <div style={{ height: `${height}px`, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                name="Enrollments"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentTrendsChart;
