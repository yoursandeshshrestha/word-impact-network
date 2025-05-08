"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile settings by default
    router.replace("/settings/profile");
  }, [router]);

  // Return a loading state while redirecting
  return (
    <div className="flex items-center justify-center h-64">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      <p className="ml-2 text-gray-600">Loading settings...</p>
    </div>
  );
}
