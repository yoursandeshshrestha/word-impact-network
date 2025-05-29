"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Menu,
  X,
  User,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Enhanced menu items with better categorization
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
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed left-4 top-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2.5 rounded-xl  text-black/90 hover:bg-white/5 transition-all duration-200 hover:text-black cursor-pointer"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-100 h-screen bg-[#1e2938]  border-r border-white/10 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        } w-[280px] md:w-72 shadow-[4px_0_20px_-4px_rgba(0,0,0,0.1)] md:shadow-[4px_0_20px_-4px_rgba(0,0,0,0.1)] flex flex-col`}
      >
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
                          onClick={() => setIsMobileMenuOpen(false)}
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

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-90 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
