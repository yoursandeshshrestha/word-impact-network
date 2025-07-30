import React from "react";
import {
  Calendar,
  User,
  X,
  FileText,
  Video,
  Download,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface AnnouncementImage {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

interface AnnouncementFile {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

interface AnnouncementVideo {
  id: string;
  vimeoId: string;
  embedUrl: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string; // Legacy field for backward compatibility
  isActive: boolean;
  createdBy: {
    id: string;
    fullName: string;
  };
  images: AnnouncementImage[];
  files: AnnouncementFile[];
  videos: AnnouncementVideo[];
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementModalProps {
  announcements: Announcement[];
  isOpen: boolean;
  onClose: () => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcements,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !announcements || announcements.length === 0) return null;
  const latest = announcements[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="p-6 pb-0 flex-shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {latest.title}
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{latest.createdBy.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDistanceToNow(new Date(latest.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Images Gallery */}
          {latest.images.length > 0 && (
            <div className="mb-6 flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latest.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <Image
                      src={image.url}
                      alt={image.fileName}
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                      >
                        <ExternalLink className="w-3 h-3 mr-1 inline" />
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy single image */}
          {latest.imageUrl && latest.images.length === 0 && (
            <div className="relative w-full h-56 mb-6 flex-shrink-0">
              <Image
                src={latest.imageUrl}
                alt="Announcement"
                fill
                className="object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="px-6 pb-6 flex-1 min-h-0 overflow-y-auto">
          {/* Description/Content Section */}
          <div className="text-gray-700 text-base mb-6">
            {latest.content
              .replace(/\r\n/g, "\n")
              .split(/\n\n+/)
              .map((para, idx) => (
                <p key={idx} className="mb-3 last:mb-0">
                  {para}
                </p>
              ))}
          </div>

          {/* Files Section */}
          {latest.files.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Documents
              </h3>
              <div className="space-y-2">
                {latest.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {latest.videos.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-4">
                {latest.videos.map((video) => (
                  <div key={video.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Video className="w-5 h-5 mr-2" />
                      </h3>
                      <a
                        href={video.embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Watch
                      </a>
                    </div>
                    <div className="aspect-video w-full">
                      <iframe
                        src={video.embedUrl}
                        className="w-full h-full rounded-lg"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
