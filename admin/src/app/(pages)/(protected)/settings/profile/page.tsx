"use client";

import React from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { formatDate } from "@/utils/formatters";
import Loading from "@/components/common/Loading";

const ProfileSettingsPage: React.FC = () => {
  const { profile, isLoading, error } = useAdminProfile();

  const fullName = profile?.fullName || "Admin User";
  const email = profile?.email || "";
  const role = profile?.role || "ADMIN";
  const createdAt = profile?.createdAt ? formatDate(profile.createdAt) : "-";
  const coursesCreated = profile?.statistics?.coursesCreated || 0;
  const chaptersCreated = profile?.statistics?.chaptersCreated || 0;
  const examsCreated = profile?.statistics?.examsCreated || 0;
  const applicationsReviewed = profile?.statistics?.applicationsReviewed || 0;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <h3 className="text-lg font-medium">Error loading profile</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Profile Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and account information
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {fullName}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {email}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role}
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Account created
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {createdAt}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Activity Statistics
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Content creation and review statistics
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-sm font-medium text-gray-500">
                Courses Created
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {coursesCreated}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-sm font-medium text-gray-500">
                Chapters Created
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {chaptersCreated}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Exams Created</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {examsCreated}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-sm font-medium text-gray-500">
                Applications Reviewed
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {applicationsReviewed}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
