"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Geist } from "next/font/google";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useState } from "react";

const font = Geist({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isHydrated } = useSelector(
    (state: RootState) => state.user
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Provide consistent display name
  const displayName = user?.fullName || "Student";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`h-screen bg-slate-50 ${font.className} overflow-hidden`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="md:ml-72 h-full flex flex-col">
        {/* Header */}
        <Header
          studentName={displayName}
          isLoading={isLoading || !isHydrated}
          showSidebar={true}
          onMobileMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Main Content - Scrollable Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="pt-14 sm:pt-16 min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
