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

interface VideoEngagementChartProps {
  data: Array<{
    videoId: string;
    videoTitle: string;
    chapterTitle: string;
    courseTitle: string;
    viewCount: number;
    averageWatchPercent: number;
  }>;
  title?: string;
  description?: string;
  height?: number;
  limit?: number;
}

const VideoEngagementChart: React.FC<VideoEngagementChartProps> = ({
  data,
  title = "Video Engagement Metrics",
  description = "Views and average watch percentage by video",
  height = 400,
  limit = 10,
}) => {
  // Sort by views descending and limit the number of videos
  const sortedData = [...data]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const video = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-bold mb-1">{video.videoTitle}</p>
          <p className="text-sm text-gray-500 mb-2">
            {video.chapterTitle} | {video.courseTitle}
          </p>
          <p className="text-sm">
            Views: <span className="font-medium">{video.viewCount}</span>
          </p>
          <p className="text-sm">
            Avg. Watch:{" "}
            <span className="font-medium">{video.averageWatchPercent}%</span>
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
            <BarChart
              data={sortedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="videoTitle"
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#82ca9d"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="viewCount"
                fill="#8884d8"
                name="Views"
              />
              <Bar
                yAxisId="right"
                dataKey="averageWatchPercent"
                fill="#82ca9d"
                name="Avg. Watch %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VideoEngagementChart;
