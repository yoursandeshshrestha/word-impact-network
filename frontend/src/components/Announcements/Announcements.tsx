"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { formatDistanceToNow } from "date-fns";
import { Megaphone, Calendar, User, X, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Announcement } from "@/redux/features/announcements/announcementsSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { isAuthenticated } from "@/common/services/auth";

const Announcements: React.FC = () => {
  const { announcements, loading, error, loadAnnouncements } =
    useAnnouncements();
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const hasLoadedRef = useRef(false);
  const user = useSelector((state: RootState) => state.user.user);

  // Load announcements when component mounts
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadAnnouncements();
    }
  }, [loadAnnouncements]);

  // Don't render anything if user is not authenticated
  if (!isAuthenticated() || !user) {
    return null;
  }

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="text-sm">Failed to load announcements: {error}</p>
      </div>
    );
  }

  // Don't show anything if no announcements
  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
        </div>

        <div className="space-y-4">
          {announcements.slice(0, 3).map((announcement) => (
            <div
              key={announcement.id}
              className="group cursor-pointer border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              onClick={() => handleAnnouncementClick(announcement)}
            >
              <div className="flex items-start gap-3">
                {announcement.imageUrl && (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={announcement.imageUrl}
                      alt="Announcement"
                      fill
                      className="object-cover rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {announcement.content.replace(/<[^>]*>/g, "")}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{announcement.createdBy.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(announcement.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {announcements.length > 3 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 text-center">
              +{announcements.length - 3} more announcements
            </p>
          </div>
        )}
      </div>

      {/* Modal for full announcement */}
      {showModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedAnnouncement.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{selectedAnnouncement.createdBy.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(
                            new Date(selectedAnnouncement.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {selectedAnnouncement.imageUrl && (
                <div className="relative w-full h-64 mb-6">
                  <Image
                    src={selectedAnnouncement.imageUrl}
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

              <div className="prose prose-gray max-w-none">
                <div
                  className="text-gray-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: selectedAnnouncement.content.replace(/\n/g, "<br>"),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Announcements;
