"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell, MessageSquare, Settings, User, LogOut, Key } from "lucide-react";

interface TopbarProps {
  userName: string;
  userRole: string;
}

const Topbar: React.FC<TopbarProps> = ({ userName, userRole }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    // For example:
    // logout();
    // router.push('/login');
  };

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
        {/* User Info with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            <div className="text-right leading-tight">
              <div className="font-semibold text-gray-900 text-base tracking-tight">
                {userName}
              </div>
              <div className="text-xs text-gray-400 font-medium tracking-wide">
                {userRole}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white">
              {userName.charAt(0)}
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50">
              <div className="py-1">
                <Link
                  href="/settings/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="mr-3 h-4 w-4 text-gray-500" />
                  My Profile
                </Link>
                <Link
                  href="/settings/change-password"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Key className="mr-3 h-4 w-4 text-gray-500" />
                  Change Password
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="mr-3 h-4 w-4 text-gray-500" />
                  Settings
                </Link>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4 text-gray-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
