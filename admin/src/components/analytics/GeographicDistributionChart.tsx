import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

interface GeographicDistributionChartProps {
  data: Array<{
    country: string;
    studentCount: number;
    percentage: number;
  }>;
  title?: string;
  description?: string;
  height?: number;
  colorPalette?: string[];
  limit?: number;
  showLegend?: boolean;
}

// Default color palette
const DEFAULT_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
];

const GeographicDistributionChart: React.FC<
  GeographicDistributionChartProps
> = ({
  data,
  title = "Geographic Distribution",
  description = "Students by country",
  height = 400,
  colorPalette = DEFAULT_COLORS,
  limit = 10,
  showLegend = true,
}) => {
  // Sort by student count descending and limit the number of countries
  const sortedData = [...data]
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, limit);

  // If there are more countries than the limit, add an "Other" category
  if (data.length > limit) {
    const otherCount = data
      .slice(limit)
      .reduce((sum, country) => sum + country.studentCount, 0);

    const totalStudents = data.reduce(
      (sum, country) => sum + country.studentCount,
      0
    );
    const otherPercentage = (otherCount / totalStudents) * 100;

    if (otherCount > 0) {
      sortedData.push({
        country: "Other",
        studentCount: otherCount,
        percentage: parseFloat(otherPercentage.toFixed(1)),
      });
    }
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const country = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-bold mb-1">{country.country}</p>
          <p className="text-sm">
            Students:{" "}
            <span className="font-medium">{country.studentCount}</span>
          </p>
          <p className="text-sm">
            Percentage:{" "}
            <span className="font-medium">{country.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label formatter
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    name: string;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show tiny slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
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
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={height > 300 ? 120 : 80}
                fill="#8884d8"
                dataKey="studentCount"
                nameKey="country"
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorPalette[index % colorPalette.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GeographicDistributionChart;
