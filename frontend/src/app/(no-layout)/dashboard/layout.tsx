"use client";

import { getCurrentUser } from "@/common/services/auth";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header studentEmail={user?.email || "student"} />
      <Navigation />
      <main className="p-6">{children}</main>
    </div>
  );
}
