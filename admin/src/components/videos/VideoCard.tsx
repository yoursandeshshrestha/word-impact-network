import React, { useState } from "react";
import { Video } from "@/redux/features/videosSlice";
import { formatDate, formatDuration } from "@/utils/formatters";
import { Play, Edit, Trash2, Clock, Hash, Calendar, Film } from "lucide-react";
import Image from "next/image";

interface VideoCardProps {
  video: Video;
  onEdit: (video: Video) => void;
  onDelete: (id: string) => void;
  onPlay: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onEdit,
  onDelete,
  onPlay,
}) => {
  const [imageError, setImageError] = useState(false);

  // Function to generate a color based on the video title
  const generateBackgroundColor = (title: string) => {
    const colors = [
      "bg-blue-100",
      "bg-green-100",
      "bg-purple-100",
      "bg-yellow-100",
      "bg-pink-100",
      "bg-indigo-100",
    ];

    // Use the sum of character codes as a simple hash
    const hash = title
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get first letter of title for placeholder
  const firstLetter = video.title.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div
        className={`relative h-40 ${generateBackgroundColor(
          video.title
        )} cursor-pointer group`}
        onClick={() => onPlay(video)}
      >
        {/* Video thumbnail - with fallback */}
        {video.thumbnailUrl && !imageError ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            width={100}
            height={100}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-500 mb-2">
              {firstLetter}
            </div>
            <Film size={24} className="text-gray-400" />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-indigo-600 rounded-full p-3 transform hover:scale-110 transition-transform duration-200">
            <Play size={24} className="text-white" fill="white" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs rounded px-2 py-1 flex items-center">
          <Clock size={12} className="mr-1" />
          {formatDuration(video.duration)}
        </div>
      </div>

      <div className="p-4">
        <h3
          className="text-md font-semibold text-gray-900 mb-1 line-clamp-1"
          title={video.title}
        >
          {video.title}
        </h3>

        {video.description && (
          <p
            className="text-sm text-gray-600 mb-2 line-clamp-2"
            title={video.description}
          >
            {video.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-xs text-gray-500">
            <span className="flex items-center mr-3">
              <Hash size={12} className="mr-1" />
              Order: {video.orderIndex}
            </span>
            <span className="flex items-center">
              <Calendar size={12} className="mr-1" />
              {formatDate(video.createdAt, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering onPlay
                onEdit(video);
              }}
              className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
              aria-label="Edit video"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering onPlay
                onDelete(video.id);
              }}
              className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 cursor-pointer"
              aria-label="Delete video"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
