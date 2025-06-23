"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  User,
  GraduationCap,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const pathname = usePathname();

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
          </div>
        </nav>

        {/* Bottom Section - Copyright */}
        <div className="mt-auto p-4 border-t border-white/10">
          <div className="text-center text-xs text-white/50">
            © 2025 Word Impact Network
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
