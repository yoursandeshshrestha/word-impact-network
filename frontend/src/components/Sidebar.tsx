"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  User,
  GraduationCap,
  ChevronRight,
  MessageCircle,
  Megaphone,
} from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { formatDistanceToNow } from "date-fns";
import AnnouncementModal from "@/components/Announcements/AnnouncementModal";
import { Announcement } from "@/redux/features/announcements/announcementsSlice";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { announcements } = useAnnouncements();
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [showModal, setShowModal] = useState(false);

  const menuItems = [
    {
      category: "Main",
      items: [
        {
          path: "/my-learning",
          name: "My Learning",
          icon: <GraduationCap className="w-5 h-5" />,
        },
        {
          path: "/all-courses",
          name: "All Courses",
          icon: <BookOpen className="w-5 h-5" />,
        },
      ],
    },
    {
      category: "Account",
      items: [
        {
          path: "/profile",
          name: "Profile",
          icon: <User className="w-5 h-5" />,
        },
      ],
    },
    {
      category: "Support",
      items: [
        {
          path: "/support",
          name: "Contact Support",
          icon: <MessageCircle className="w-5 h-5" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Sidebar Container */}
      <aside className="fixed top-0 left-0 z-30 h-screen bg-[#1e2938] border-r border-white/10 w-[280px] md:w-72 shadow-[4px_0_20px_-4px_rgba(0,0,0,0.1)]  flex-col hidden md:flex">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-[#1e2938]">
          <Link href="/" className="flex items-center gap-3 group">
            <h1 className="text-lg font-bold text-white transition-colors">
              Word Impact Network
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="px-3 space-y-8">
            {menuItems.map((section) => (
              <div key={section.category}>
                <h3 className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={`group flex items-center justify-between p-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-white/10 text-white shadow-sm border border-white/10"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`${
                                isActive
                                  ? "text-white"
                                  : "text-white/70 group-hover:text-white"
                              } transition-colors`}
                            >
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </div>

                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-white ml-2" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* Announcements Section */}
            {announcements && announcements.length > 0 && (
              <div>
                <h3 className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                  Announcements
                </h3>
                <div className="space-y-2">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedAnnouncement(announcement);
                        setShowModal(true);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Megaphone className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {announcement.title}
                          </h4>
                          <p className="text-xs text-white/60 mt-1 line-clamp-2">
                            {announcement.content
                              .replace(/<[^>]*>/g, "")
                              .slice(0, 60)}
                            {announcement.content.length > 60 ? "..." : ""}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {formatDistanceToNow(
                              new Date(announcement.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {announcements.length > 3 && (
                    <div className="text-center">
                      <span className="text-xs text-white/50">
                        +{announcements.length - 3} more
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section - Copyright */}
        <div className="mt-auto p-4 border-t border-white/10">
          <div className="text-center text-xs text-white/50">
            © 2025 Word Impact Network
          </div>
        </div>
      </aside>

      {/* Announcement Modal */}
      <AnnouncementModal
        announcements={selectedAnnouncement ? [selectedAnnouncement] : []}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAnnouncement(null);
        }}
      />
    </>
  );
};

export default Sidebar;
