"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/logo-one.png";
import { isAuthenticated } from "@/common/services/auth";
import { Menu, X, ChevronDown } from "lucide-react";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore body scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navigationItems = [
    {
      name: "HOME",
      href: "/",
      hasDropdown: false,
    },
    {
      name: "CURRICULUM",
      href: "/",
      hasDropdown: true,
      dropdownItems: [
        { name: "4-Year Curriculum Overview", href: "/curriculum" },
        { name: "Year 1: Foundation and Formation", href: "/curriculum#year1" },
        { name: "Year 2: Growth and Grounding", href: "/curriculum#year2" },
        { name: "Year 3: Depth and Discernment", href: "/curriculum#year3" },
        { name: "Year 4: Maturity and Mission", href: "/curriculum#year4" },
      ],
    },
    {
      name: "ABOUT",
      href: "/",
      hasDropdown: true,
      dropdownItems: [
        { name: "About WIN", href: "/about-win-impact-network" },
        { name: "Our Story", href: "/our-story" },
        { name: "Educational Programs", href: "/educational-programs" },
        { name: "Faculty Profiles", href: "/faculty-profiles" },
      ],
    },
    {
      name: "LEADERSHIP",
      href: "/",
      hasDropdown: true,
      dropdownItems: [
        { name: "Our Leadership Team", href: "/our-leadership-team" },
        { name: "Office Of The President", href: "/office-of-the-president" },
        { name: "Board of Directors", href: "/board-of-directors" },
        { name: "President's Council", href: "/presidents-council" },
        { name: "Academic Leadership", href: "/academic-leadership" },
        { name: "Ambassadors", href: "/ambassadors" },
      ],
    },
    {
      name: "TRAINING",
      href: "/online-training",
      hasDropdown: false,
    },
    {
      name: "FAQ",
      href: "/faq",
      hasDropdown: false,
    },
    {
      name: "COURSES",
      href: "/courses",
      hasDropdown: false,
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 mx-[10px] mt-[10px] rounded-[1rem] lg:mx-[40px] lg:mt-[25px] z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-sm shadow-xl !mx-0 !mt-0 rounded-none"
            : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="logo flex-shrink-0">
              <Link href="/" className="block">
                <Image
                  src={logo}
                  alt="Word Impact Network Logo"
                  width={180}
                  height={180}
                  className="h-16 w-auto sm:h-20"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden 2xl:block flex-grow">
              <ul className="flex justify-center space-x-10 text-base font-medium tracking-wide">
                {navigationItems.map((item) => (
                  <li key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className="text-gray-800 hover:text-gray-600 transition-colors flex items-center font-semibold"
                    >
                      {item.name}
                      {item.hasDropdown && (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </Link>
                    {item.hasDropdown && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white shadow-lg rounded-md hidden group-hover:block z-10 transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <div className="absolute -top-4 left-0 right-0 h-4"></div>
                        <div className="py-2">
                          {item.dropdownItems?.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Authentication Links - Desktop */}
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
                    <span className="ml-2">Login</span>
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
            <button
              onClick={toggleMobileMenu}
              className="2xl:hidden ml-4 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="2xl:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`2xl:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto  ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Mobile Menu Header */}
          <div className="flex sticky top-1 bg-white items-center justify-between mb-8 py-2 ">
            <Link href="/" className="block" onClick={toggleMobileMenu}>
              <Image
                src={logo}
                alt="Word Impact Network Logo"
                width={120}
                height={120}
                className="h-12 w-auto"
              />
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="mb-8">
            <ul className="space-y-4">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  {item.hasDropdown ? (
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-gray-800 py-2">
                        {item.name}
                      </div>
                      <ul className="pl-4 space-y-2">
                        {item.dropdownItems?.map((dropdownItem) => (
                          <li key={dropdownItem.name}>
                            <Link
                              href={dropdownItem.href}
                              onClick={toggleMobileMenu}
                              className="block text-gray-600 hover:text-gray-900 py-1 transition-colors"
                            >
                              {dropdownItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="block text-lg font-semibold text-gray-800 hover:text-gray-600 transition-colors py-2"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Authentication */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {isLoggedIn ? (
              <Link
                href="/my-learning"
                onClick={toggleMobileMenu}
                className="block w-full text-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={toggleMobileMenu}
                  className="block w-full text-center px-6 py-3 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/apply"
                  onClick={toggleMobileMenu}
                  className="block w-full text-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Apply Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
