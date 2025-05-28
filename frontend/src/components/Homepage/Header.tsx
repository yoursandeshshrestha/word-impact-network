"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo-one.png";
import { isAuthenticated } from "@/common/services/auth";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 mx-[10px] mt-[10px] rounded-[1rem] lg:mx-[40px] lg:mt-[25px] z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-xl py-2 !mx-0 !mt-0 rounded-none"
          : "bg-white/95 backdrop-blur-sm py-4"
      }`}
    >
      <div className="container mx-auto px-6">
        {/* Restructured layout to 3 sections: logo, centered nav, auth buttons */}
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="logo flex-shrink-0">
            <Link href="/" className="block">
              <Image
                src={logo}
                alt="Himalayan Diaspora Academy Logo"
                width={180}
                height={180}
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:block flex-grow">
            <ul className="flex justify-center space-x-10 text-base font-medium tracking-wide">
              <li>
                <Link
                  href="/"
                  className="text-gray-800 hover:text-indigo-700 transition-colors font-semibold"
                >
                  HOME
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/"
                  className="text-gray-800 hover:text-indigo-700 transition-colors flex items-center font-semibold"
                >
                  ACADEMICS
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white shadow-lg rounded-md hidden group-hover:block z-10 transition-all duration-300 opacity-0 group-hover:opacity-100">
                  <div className="absolute -top-4 left-0 right-0 h-4"></div>
                  <div className="py-2">
                    <Link
                      href="/academic"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      First Year
                    </Link>
                    <Link
                      href="/academic"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Second Year
                    </Link>
                    <Link
                      href="/academic"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Third Year
                    </Link>
                    <Link
                      href="/academic"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Fourth Year
                    </Link>
                  </div>
                </div>
              </li>
              <li className="relative group">
                <Link
                  href="/"
                  className="text-gray-800 hover:text-indigo-700 transition-colors flex items-center font-semibold"
                >
                  ABOUT
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white shadow-lg rounded-md hidden group-hover:block z-10 transition-all duration-300 opacity-0 group-hover:opacity-100">
                  <div className="absolute -top-4 left-0 right-0 h-4"></div>
                  <div className="py-2">
                    <Link
                      href="/about-win-impact-network"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      About WIN
                    </Link>
                    <Link
                      href="/history-timeline"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      History & Timeline
                    </Link>
                    <Link
                      href="/newsletters"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Newsletters
                    </Link>
                  </div>
                </div>
              </li>
              <li className="relative group">
                <Link
                  href="/"
                  className="text-gray-800 hover:text-indigo-700 transition-colors flex items-center font-semibold"
                >
                  LEADERSHIP
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white shadow-lg rounded-md hidden group-hover:block z-10 transition-all duration-300 opacity-0 group-hover:opacity-100">
                  <div className="absolute -top-4 left-0 right-0 h-4"></div>
                  <div className="py-2">
                    <Link
                      href="/office-of-the-president"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Office Of The President
                    </Link>
                    <Link
                      href="/board-of-directors"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Board of Directors
                    </Link>
                    <Link
                      href="/presidents-council"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      President&apos;s Council
                    </Link>
                    <Link
                      href="/academic-leadership"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Academic Leadership
                    </Link>
                    <Link
                      href="/ambassadors"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Ambassadors
                    </Link>
                    <Link
                      href="/staff"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Staff
                    </Link>
                  </div>
                </div>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-800 hover:text-indigo-700 transition-colors font-semibold"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-gray-800 uppercase hover:text-indigo-700 transition-colors font-semibold"
                >
                  Courses
                </Link>
              </li>
            </ul>
          </nav>

          {/* Authentication Links */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {isLoggedIn ? (
              <Link
                href="/my-learning"
                className="inline-flex items-center px-6 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 font-medium"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="10" r="3" />
                      <path d="M7 20.662V19c0-1.657 2.239-3 5-3s5 1.343 5 3v1.662" />
                    </svg>
                  </div>
                  <span className="ml-2 hidden md:inline">Login</span>
                </Link>
                <Link
                  href="/auth/apply"
                  className="inline-flex items-center px-6 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition-all duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Apply Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden ml-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
