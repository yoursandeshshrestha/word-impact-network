"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Geist } from "next/font/google";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

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

  // Provide consistent display name
  const displayName = user?.fullName || "Student";

  return (
    <div className={`min-h-screen bg-slate-50 ${font.className}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="md:ml-72 min-h-screen flex flex-col">
        {/* Header */}
        <Header
          studentName={displayName}
          isLoading={isLoading || !isHydrated}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
