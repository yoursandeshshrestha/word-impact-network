"use client";

import React, { useEffect, useState } from "react";
import { Bell, MessageSquare } from "lucide-react";

interface TopbarProps {
  userName?: string;
  userRole?: string;
}

const Topbar: React.FC<TopbarProps> = ({
  userName = "Admin User",
  userRole = "Administrator",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client render, use the default values
  const displayName = mounted ? userName : "Admin User";
  const displayRole = mounted ? userRole : "Administrator";

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-100 flex items-center justify-end h-16 px-8 shadow-sm font-sans">
      <div className="flex items-center gap-8">
        {/* Message Icon with badge */}
        <button className="relative group focus:outline-none">
          <MessageSquare className="h-6 w-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold shadow-md border-2 border-white">
            3
          </span>
        </button>
        {/* Notification Icon with badge */}
        <button className="relative group focus:outline-none">
          <Bell className="h-6 w-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold shadow-md border-2 border-white">
            3
          </span>
        </button>
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="font-semibold text-gray-900 text-base tracking-tight">
              {displayName}
            </div>
            <div className="text-xs text-gray-400 font-medium tracking-wide">
              {displayRole}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white">
            {displayName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
