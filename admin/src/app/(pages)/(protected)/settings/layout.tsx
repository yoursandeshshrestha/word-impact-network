"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Key, User } from "lucide-react";

interface SettingsNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const navigation: SettingsNavItem[] = [
    { name: "Profile", href: "/settings/profile", icon: User },
    { name: "Change Password", href: "/settings/change-password", icon: Key },
  ];

  const isCurrentPage = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1 bg-white shadow overflow-hidden rounded-lg p-4">
            {navigation.map((item) => {
              const current = isCurrentPage(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${
                      current
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                  aria-current={current ? "page" : undefined}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${
                        current
                          ? "text-indigo-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                    `}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default SettingsLayout;
