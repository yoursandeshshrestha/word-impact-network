"use client";

import React, { useState, useEffect, useMemo } from "react";
import { logout } from "@/common/services/auth";
import { ChevronDown, User, LogOut, Search, Lock } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAutoCourses } from "@/hooks/useCourses";

const Header: React.FC<{ studentName: string; isLoading?: boolean }> = ({
  studentName,
  isLoading: externalLoading,
}) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNameLoading, setIsNameLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { searchQuery, updateSearchQuery } = useAutoCourses();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (studentName) {
      const timer = setTimeout(() => {
        setDisplayName(studentName);
        setIsNameLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [studentName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("user-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLoading = externalLoading ?? isNameLoading;

  const getInitials = useMemo(
    () => (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    },
    []
  );

  const headerClassName = useMemo(
    () =>
      `fixed top-0 left-0 md:left-72 right-0 w-full md:w-[calc(100%-18rem)] transition-all duration-300 ease-out z-40 ${
        isScrolled
          ? "bg-white backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border-b border-slate-200"
          : "bg-white backdrop-blur-md shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border-b border-slate-200"
      }`,
    [isScrolled]
  );

  return (
    <header className={headerClassName}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Search (only on all-courses page) */}
          <div className="flex-1 flex items-center">
            {pathname === "/dashboard/all-courses" && (
              <div className="relative w-full max-w-2xl hidden md:block">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for courses"
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#7a9e7e] focus:border-[#7a9e7e] focus:bg-white transition-all text-sm text-slate-900 placeholder-slate-400"
                />
              </div>
            )}

            {/* Mobile Search Button */}
            {pathname === "/dashboard/all-courses" && (
              <button className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Right Section - Always aligned to the right */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* User Profile Dropdown */}
            <div className="relative" id="user-dropdown">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7a9e7e] to-[#b7773a] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {isLoading ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        getInitials(displayName)
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#7a9e7e] border-2 border-white rounded-full"></div>
                  </div>

                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1">
                      {isLoading ? (
                        <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                          {displayName}
                        </span>
                      )}
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <div className="text-xs text-slate-500">Student</div>
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7a9e7e] to-[#b7773a] flex items-center justify-center text-white font-semibold shadow-sm">
                        {getInitials(displayName)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {displayName}
                        </div>
                        <div className="text-sm text-slate-500">
                          Student Account
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <a
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </a>
                  </div>
                  <div className="py-2">
                    <a
                      href="/forgot-password"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Lock className="h-4 w-4" />
                      Forgot Password
                    </a>
                  </div>

                  <div className="border-t border-slate-200 pt-2">
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
