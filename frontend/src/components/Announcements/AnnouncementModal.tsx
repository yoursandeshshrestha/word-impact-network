import React from "react";
import { Megaphone, Calendar, User, X } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  createdBy: {
    id: string;
    fullName: string;
  };
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
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 pb-0 flex-shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
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
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {latest.imageUrl && (
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
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          <div className="prose prose-gray max-w-none">
            <div
              className="text-gray-700 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: latest.content.replace(/\n/g, "<br>"),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
