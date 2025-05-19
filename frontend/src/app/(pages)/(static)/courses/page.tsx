"use client";

import React, { useEffect } from "react";
import { useCourses } from "@/hooks/usePublicCourses";
import CourseCard from "@/components/Courses/CourseCard";
import {
  BookOpen,
  Users,
  Presentation,
  Award,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import backgroundImage from "@/assets/course-page.png";

const CoursesPage = () => {
  const { courses, error, loadCourses, isLoading, isError, isSuccess } =
    useCourses();

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Hero Section with Parallax Effect */}
      <section className="relative min-h-[70vh] flex items-center pt-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Courses background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-gray-900/70"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <span className="text-white/90 font-medium text-sm">
                World Impact Network
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Transformative{" "}
              <span className="text-indigo-400">Biblical Education</span> For
              Christian Leaders
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
              Equipping Bengali speaking Christian leaders for the great
              commission through quality education and spiritual formation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#course-listings"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors flex items-center"
              >
                Explore Courses <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/about-win-impact-network"
                className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-medium rounded-md transition-colors"
              >
                About WIN
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Course Listings */}
      <section id="course-listings" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">
              Available Programs
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 tracking-wide">
              Our Educational Courses
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              World Impact Network offers comprehensive educational programs
              designed to equip Christian leaders with biblical knowledge and
              leadership skills for effective ministry.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="max-w-md mx-auto text-center py-12 px-8 bg-red-50 rounded-xl border border-red-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">
                Unable to Load Courses
              </h3>
              <p className="text-red-600 mb-6">
                {error || "Failed to load courses. Please try again later."}
              </p>
              <button
                onClick={() => loadCourses()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {isSuccess && courses.length === 0 && (
            <div className="max-w-md mx-auto text-center py-12 px-8 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Courses Available
              </h3>
              <p className="text-gray-600">
                No courses are available at the moment. Please check back later
                as we continue to develop our curriculum.
              </p>
            </div>
          )}

          {/* Course Grid */}
          {isSuccess && courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    durationYears: course.durationYears,
                    coverImageUrl: course.coverImageUrl,
                    instructor: course.instructor,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Program Structure Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">
              Program Structure
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 tracking-wide">
              Four-Year Academic Journey
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Our comprehensive four-year program is designed to progressively
              build your knowledge and skills through a carefully structured
              curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Year 1 Card */}
            <div className="bg-gradient-to-br from-[#2c3e50] to-[#1a2530] text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
              <div className="flex flex-col items-center h-full relative z-10">
                <div className="bg-white/10 p-4 rounded-full mb-6 backdrop-blur-sm">
                  <BookOpen size={48} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 tracking-wide">
                  Year 1
                </h3>
                <div className="w-16 h-1 bg-indigo-400 rounded-full mb-4"></div>
                <p className="text-center text-gray-200 mb-6 font-medium text-lg">
                  Foundation in Biblical Studies
                </p>
                <ul className="space-y-3 text-base font-medium flex-grow">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                    Biblical Interpretation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                    Old Testament Survey
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                    New Testament Survey
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                    Christian Doctrine
                  </li>
                </ul>
              </div>
            </div>

            {/* Year 2 Card */}
            <div className="bg-gradient-to-br from-[#7a9e7e] to-[#5a7e5e] text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
              <div className="flex flex-col items-center h-full relative z-10">
                <div className="bg-white/10 p-4 rounded-full mb-6 backdrop-blur-sm">
                  <Users size={48} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 tracking-wide">
                  Year 2
                </h3>
                <div className="w-16 h-1 bg-green-300 rounded-full mb-4"></div>
                <p className="text-center text-gray-200 mb-6 font-medium text-lg">
                  Ministry Leadership Skills
                </p>
                <ul className="space-y-3 text-base font-medium flex-grow">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                    Church Leadership
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                    Pastoral Care
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                    Christian Ethics
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                    Discipleship
                  </li>
                </ul>
              </div>
            </div>

            {/* Year 3 Card */}
            <div className="bg-gradient-to-br from-[#b7773a] to-[#915926] text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
              <div className="flex flex-col items-center h-full relative z-10">
                <div className="bg-white/10 p-4 rounded-full mb-6 backdrop-blur-sm">
                  <Presentation size={48} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 tracking-wide">
                  Year 3
                </h3>
                <div className="w-16 h-1 bg-amber-300 rounded-full mb-4"></div>
                <p className="text-center text-gray-200 mb-6 font-medium text-lg">
                  Outreach & Evangelism
                </p>
                <ul className="space-y-3 text-base font-medium flex-grow">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-300 rounded-full mr-3"></span>
                    Cross-cultural Ministry
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-300 rounded-full mr-3"></span>
                    Evangelism Strategies
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-300 rounded-full mr-3"></span>
                    Church Planting
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-300 rounded-full mr-3"></span>
                    Community Engagement
                  </li>
                </ul>
              </div>
            </div>

            {/* Year 4 Card */}
            <div className="bg-gradient-to-br from-[#2c3e50] to-[#1a2530] text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
              <div className="flex flex-col items-center h-full relative z-10">
                <div className="bg-white/10 p-4 rounded-full mb-6 backdrop-blur-sm">
                  <Award size={48} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 tracking-wide">
                  Year 4
                </h3>
                <div className="w-16 h-1 bg-indigo-400 rounded-full mb-4"></div>
                <p className="text-center text-gray-200 mb-6 font-medium text-lg">
                  Applied Ministry & Capstone
                </p>
                <ul className="space-y-3 text-base font-medium flex-grow">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                    Ministry Practicum
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                    Leadership Development
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                    Advanced Biblical Studies
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                    Capstone Project
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 bg-gradient-to-r from-indigo-800 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Begin Your Spiritual Journey?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join our community of faith-driven learners and unlock your
              potential for impactful ministry.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="#course-listings"
                className="px-8 py-3 bg-white text-indigo-900 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Browse Courses
              </Link>
              <Link
                href="/auth/apply"
                className="px-8 py-3 bg-transparent border-2 border-white hover:bg-white/10 text-white font-medium rounded-md transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CoursesPage;
