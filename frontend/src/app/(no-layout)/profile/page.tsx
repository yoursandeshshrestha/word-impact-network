"use client";

import React, { useState } from "react";
import {
  useAutoStudentProfile,
  useStudentProfile,
} from "@/hooks/useStudentProfile";
import {
  User,
  Save,
  X,
  Edit3,
  BookOpen,
  Trophy,
  Play,
  Award,
  Calendar,
  Phone,
  Globe,
  Mail,
  Target,
  Clock,
  TrendingUp,
  Activity,
  Star,
  CheckCircle,
  BarChart3,
  Zap,
} from "lucide-react";

function StudentProfile() {
  const { profileData, isLoading, isError, error } = useAutoStudentProfile();
  const { updateProfile } = useStudentProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    fullName: string;
    phoneNumber: string;
    country: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE" | "OTHER";
  }>({
    fullName: "",
    phoneNumber: "",
    country: "",
    dateOfBirth: "",
    gender: "MALE",
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleEdit = () => {
    if (profileData?.profile) {
      setEditForm({
        fullName: profileData.profile.fullName,
        phoneNumber: profileData.profile.phoneNumber,
        country: profileData.profile.country,
        dateOfBirth: formatDateForInput(profileData.profile.dateOfBirth),
        gender: profileData.profile.gender,
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            {error || "Failed to load profile"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-4">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">👤</div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">
            No profile data found
          </h3>
          <p className="text-slate-600 text-lg">
            Unable to load your profile information
          </p>
        </div>
      </div>
    );
  }

  const { profile } = profileData;

  // Calculate overall progress
  const totalCourses = profileData?.enrollments?.total || 0;
  const activeCourses = profileData?.enrollments?.active || 0;
  const totalExams = profileData?.examAttempts?.total || 0;
  const passedExams = profileData?.examAttempts?.passed || 0;
  const totalCertificates = profileData?.certifications?.total || 0;
  const totalVideos = profileData?.videoProgress?.totalWatched || 0;

  const overallProgress =
    totalCourses > 0
      ? Math.round(
          (profileData?.enrollments?.courses?.reduce(
            (acc, course) => acc + (course.progress?.percentComplete || 0),
            0
          ) || 0) / totalCourses
        )
      : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-auto pb-10">
      <div className="px-4 sm:px-5 pt-4">
        {/* Hero Section */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c3e50] via-[#7a9e7e] to-[#b7773a] rounded-3xl blur-3xl opacity-10"></div>
          <div className="relative bg-gradient-to-br from-[#2c3e50] via-[#2c3e50] to-[#2c3e50] rounded-3xl p-4 sm:p-6 lg:p-8 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"></div>
              <div className="absolute top-20 right-20 w-16 h-16 border border-white/10 rounded-full"></div>
              <div className="absolute bottom-10 left-1/4 w-12 h-12 border border-white/20 rounded-full"></div>
              <div className="absolute bottom-20 right-1/3 w-8 h-8 border border-white/10 rounded-full"></div>
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#7a9e7e] to-[#7a9e7e] rounded-full flex items-center justify-center border-4 border-[#2c3e50]">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="text-2xl sm:text-3xl font-bold bg-transparent border-b-2 border-white/50 focus:border-white text-white placeholder-white/70 outline-none mb-2 w-full"
                      placeholder="Full Name"
                    />
                  ) : (
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {profile.fullName}
                    </h1>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                    <p className="text-white/90 text-sm sm:text-base">
                      {profile.email}
                    </p>
                  </div>

                  {/* Quick Stats in Hero */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {totalCourses}
                      </div>
                      <div className="text-white/70 text-xs sm:text-sm">
                        Courses
                      </div>
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {overallProgress}%
                      </div>
                      <div className="text-white/70 text-xs sm:text-sm">
                        Progress
                      </div>
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {totalCertificates}
                      </div>
                      <div className="text-white/70 text-xs sm:text-sm">
                        Certificates
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-white font-medium text-sm sm:text-base">
                      Edit Profile
                    </span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#7a9e7e] to-[#7a9e7e] hover:from-[#7a9e7e]/90 hover:to-[#7a9e7e]/90 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 cursor-pointer shadow-lg w-full sm:w-auto justify-center"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="text-white font-medium text-sm sm:text-base">
                        Save Changes
                      </span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="text-white font-medium text-sm sm:text-base">
                        Cancel
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Personal Information Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#7a9e7e]" />
                Personal Info
              </h3>

              <div className="space-y-5 sm:space-y-7">
                <div className="group">
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#2c3e50] to-[#2c3e50] rounded-xl flex items-center justify-center">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-600">
                        Date of Birth
                      </p>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.dateOfBirth}
                          onChange={(e) =>
                            handleInputChange("dateOfBirth", e.target.value)
                          }
                          className="text-slate-900 font-medium bg-transparent border-b border-slate-200 focus:border-[#7a9e7e] outline-none w-full mt-1 text-sm"
                        />
                      ) : (
                        <p className="text-slate-900 font-medium text-sm">
                          {formatDate(profile.dateOfBirth)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#7a9e7e] to-[#7a9e7e] rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-600">
                        Gender
                      </p>
                      {isEditing ? (
                        <select
                          value={editForm.gender}
                          onChange={(e) =>
                            handleInputChange("gender", e.target.value)
                          }
                          className="text-slate-900 font-medium bg-transparent border-b border-slate-200 focus:border-[#7a9e7e] outline-none w-full mt-1 text-sm"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      ) : (
                        <p className="text-slate-900 font-medium capitalize text-sm">
                          {profile.gender.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#b7773a] to-[#b7773a] rounded-xl flex items-center justify-center">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-600">
                        Phone
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.phoneNumber}
                          onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                          }
                          className="text-slate-900 font-medium bg-transparent border-b border-slate-200 focus:border-[#7a9e7e] outline-none w-full mt-1 text-sm"
                          placeholder="Phone Number"
                        />
                      ) : (
                        <p className="text-slate-900 font-medium text-sm">
                          {profile.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#2c3e50] to-[#2c3e50] rounded-xl flex items-center justify-center">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-600">
                        Country
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.country}
                          onChange={(e) =>
                            handleInputChange("country", e.target.value)
                          }
                          className="text-slate-900 font-medium bg-transparent border-b border-slate-200 focus:border-[#7a9e7e] outline-none w-full mt-1 text-sm"
                          placeholder="Country"
                        />
                      ) : (
                        <p className="text-slate-900 font-medium text-sm">
                          {profile.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Score Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#2c3e50] rounded-xl flex items-center justify-center">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#2c3e50]">
                  Performance Score
                </h3>
              </div>

              <div className="text-center mb-4">
                <div className="text-4xl sm:text-5xl font-bold text-[#2c3e50] mb-2">
                  {totalExams > 0
                    ? Math.round((passedExams / totalExams) * 100)
                    : 0}
                </div>
                <div className="text-slate-600 text-sm">Overall Score</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-xs sm:text-sm">
                    Exam Success Rate
                  </span>
                  <span className="text-[#2c3e50] font-medium text-sm">
                    {totalExams > 0
                      ? Math.round((passedExams / totalExams) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-[#7a9e7e] h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalExams > 0
                          ? Math.round((passedExams / totalExams) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="group bg-gradient-to-br from-[#2c3e50]/5 to-[#2c3e50]/10 rounded-2xl p-4 sm:p-6 border border-[#2c3e50]/10 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-[120px] sm:h-[140px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2c3e50] to-[#2c3e50] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-[#2c3e50]">
                      {totalCourses}
                    </div>
                    <div className="text-xs sm:text-sm text-[#2c3e50]/70">
                      Total Courses
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm mt-auto">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#7a9e7e]" />
                  <span className="text-[#2c3e50]/70">
                    {activeCourses} active
                  </span>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-[#7a9e7e]/5 to-[#7a9e7e]/10 rounded-2xl p-4 sm:p-6 border border-[#7a9e7e]/10 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-[120px] sm:h-[140px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#7a9e7e] to-[#7a9e7e] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-[#7a9e7e]">
                      {passedExams}
                    </div>
                    <div className="text-xs sm:text-sm text-[#7a9e7e]/70">
                      Exams Passed
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm mt-auto">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-[#2c3e50]" />
                  <span className="text-[#7a9e7e]/70">
                    {totalExams} attempted
                  </span>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-[#b7773a]/5 to-[#b7773a]/10 rounded-2xl p-4 sm:p-6 border border-[#b7773a]/10 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-[120px] sm:h-[140px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#b7773a] to-[#b7773a] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-[#b7773a]">
                      {totalCertificates}
                    </div>
                    <div className="text-xs sm:text-sm text-[#b7773a]/70">
                      Certificates
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm mt-auto">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-[#2c3e50]" />
                  <span className="text-[#b7773a]/70">Earned</span>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-[#2c3e50]/5 to-[#2c3e50]/10 rounded-2xl p-4 sm:p-6 border border-[#2c3e50]/10 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-[120px] sm:h-[140px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2c3e50] to-[#2c3e50] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-[#2c3e50]">
                      {totalVideos}
                    </div>
                    <div className="text-xs sm:text-sm text-[#2c3e50]/70">
                      Videos Watched
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm mt-auto">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[#7a9e7e]" />
                  <span className="text-[#2c3e50]/70">Learning hours</span>
                </div>
              </div>
            </div>

            {/* Course Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#2c3e50] to-[#2c3e50] rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#2c3e50]">
                    Learning Progress
                  </h3>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-[#7a9e7e]">
                    {overallProgress}%
                  </div>
                  <div className="text-slate-600 text-xs sm:text-sm">
                    Overall Progress
                  </div>
                </div>
              </div>

              {profileData?.enrollments?.courses?.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {profileData.enrollments.courses.map((course, index) => (
                    <div
                      key={course.id}
                      className="group relative bg-gradient-to-r from-slate-50 to-white rounded-2xl p-4 sm:p-6 border border-slate-100 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2c3e50] to-[#7a9e7e] rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">
                        {index + 1}
                      </div>

                      <div className="pr-12 sm:pr-16">
                        <h4 className="text-lg sm:text-xl font-bold text-[#2c3e50] mb-3 group-hover:text-[#7a9e7e] transition-colors">
                          {course.title}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#2c3e50]/10 rounded-lg flex items-center justify-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#2c3e50]" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm text-slate-600">
                                Duration
                              </div>
                              <div className="font-medium text-[#2c3e50] text-sm">
                                {course.durationYears} years
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#7a9e7e]/10 rounded-lg flex items-center justify-center">
                              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-[#7a9e7e]" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm text-slate-600">
                                Chapters
                              </div>
                              <div className="font-medium text-[#2c3e50] text-sm">
                                {course.progress?.completedChapters || 0}/
                                {course.progress?.totalChapters || 0}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 sm:col-span-2 lg:col-span-1">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#b7773a]/10 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#b7773a]" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm text-slate-600">
                                Progress
                              </div>
                              <div className="font-bold text-[#7a9e7e] text-sm">
                                {course.progress?.percentComplete || 0}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-medium text-slate-600">
                              Course Completion
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[#2c3e50]">
                              {course.progress?.percentComplete || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 sm:h-3 overflow-hidden">
                            <div
                              className="h-2 sm:h-3 bg-gradient-to-r from-[#2c3e50] to-[#7a9e7e] rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${
                                  course.progress?.percentComplete || 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-[#2c3e50]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#2c3e50] mb-3 sm:mb-4">
                    No Courses Yet
                  </h3>
                  <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto px-4">
                    Start your learning journey by enrolling in your first
                    course
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default StudentProfile;
