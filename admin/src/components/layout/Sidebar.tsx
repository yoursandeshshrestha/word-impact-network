"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/utils/auth";

import {
  Home,
  BookOpen,
  Users,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  X,
  Megaphone,
  Newspaper,
  CreditCard,
  Play,
} from "lucide-react";

type SidebarProps = {
  userEmail?: string;
  userName?: string;
  onClose?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  userEmail = "admin@example.com",
  userName = "Admin User",
  onClose,
}) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client render, use the default values
  const displayName = mounted ? userName : "Admin User";
  const displayEmail = mounted ? userEmail : "admin@example.com";

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (onClose) {
      onClose();
    }
  };

  // Create menu items with notification badge
  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      path: "/courses",
      name: "Courses",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      path: "/students",
      name: "Students",
      icon: <Users className="w-5 h-5" />,
    },
    {
      path: "/applications",
      name: "Applications",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      path: "/announcements",
      name: "Announcements",
      icon: <Megaphone className="w-5 h-5" />,
    },
    {
      path: "/news",
      name: "News",
      icon: <Newspaper className="w-5 h-5" />,
    },
    {
      path: "/payments",
      name: "Payments",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      path: "/analytics",
      name: "Analytics",
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      path: "/video-test",
      name: "Video Test",
      icon: <Play className="w-5 h-5" />,
    },
    {
      path: "/settings",
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="h-full bg-gray-800 flex flex-col">
      {/* Header with close button for mobile */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-700">
        <Link href="/" className="flex-1" onClick={handleNavClick}>
          <h1 className="text-xl font-bold text-white">Word Impact Network</h1>
        </Link>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="xl:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center p-3 text-gray-300 rounded-lg transition-colors ${
                    pathname === item.path
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span className="text-gray-400 group-hover:text-white">
                    {item.icon}
                  </span>
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-white">{displayName}</h3>
          <p className="text-gray-400 text-xs">{displayEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center cursor-pointer text-gray-300 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="ml-2 text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
