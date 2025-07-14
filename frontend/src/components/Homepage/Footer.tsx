import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {/* Contact Column */}
          <div className="text-center sm:text-left">
            <h3 className="text-gray-800 font-bold text-base sm:text-lg mb-3 sm:mb-4">
              CONTACT
            </h3>
            <div className="text-gray-700 space-y-2 sm:space-y-3">
              <p className="font-semibold text-sm sm:text-base">
                Word Impact Network (WIN)
              </p>
              <div className="flex items-center justify-center sm:justify-start">
                <Phone className="h-4 w-4 mr-2 text-gray-600 flex-shrink-0" />
                <span className="text-sm sm:text-base">+91 94343 21542</span>
              </div>
              <div className="flex items-start justify-center sm:justify-start">
                <MapPin className="h-4 w-4 mr-2 text-gray-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base">West Bengal, India</span>
              </div>
              <Link
                href="mailto:wordimpactnetwork2025@gmail.com"
                className="flex items-start justify-center sm:justify-start text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm lg:text-base break-all">
                  wordimpactnetwork2025@gmail.com
                </span>
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="text-center sm:text-left">
            <h3 className="text-gray-800 font-bold text-base sm:text-lg mb-3 sm:mb-4">
              QUICK LINKS
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link
                  href="/about-win-impact-network"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  About WIN
                </Link>
              </li>
              <li>
                <Link
                  href="/our-story"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href="/educational-programs"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Educational Programs
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/apply"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Apply Now
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Leadership Column */}
          <div className="text-center sm:text-left">
            <h3 className="text-gray-800 font-bold text-base sm:text-lg mb-3 sm:mb-4">
              LEADERSHIP
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link
                  href="/office-of-the-president"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Office of the President
                </Link>
              </li>
              <li>
                <Link
                  href="/board-of-directors"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Board of Directors
                </Link>
              </li>
              <li>
                <Link
                  href="/presidents-council"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  President&apos;s Council
                </Link>
              </li>
              <li>
                <Link
                  href="/academic-leadership"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Academic Leadership
                </Link>
              </li>
              <li>
                <Link
                  href="/ambassadors"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Ambassadors
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs & Resources Column */}
          <div className="text-center sm:text-left">
            <h3 className="text-gray-800 font-bold text-base sm:text-lg mb-3 sm:mb-4">
              PROGRAMS & RESOURCES
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link
                  href="/courses"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/educational-programs"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Church Planters Training
                </Link>
              </li>
              <li>
                <Link
                  href="/educational-programs"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  4-Year Ministry Program
                </Link>
              </li>
              <li>
                <Link
                  href="/my-learning"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Student Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="text-center sm:text-left">
            <h3 className="text-gray-800 font-bold text-base sm:text-lg mb-3 sm:mb-4">
              LEGAL
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/cancellation-and-refund"
                  className="text-gray-700 hover:text-gray-800 text-sm sm:text-base block py-1 transition-colors"
                >
                  Cancellation & Refund
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-gray-100 py-3 sm:py-4">
        <div className="container mx-auto text-center text-gray-700 text-xs sm:text-sm px-4 sm:px-6 lg:px-8">
          <p className="leading-relaxed">
            <span className="block sm:inline">
              © 2025 All rights Reserved | Word Impact Network (WIN)
            </span>
            <span className="block sm:inline mt-1 sm:mt-0">
              Spreading the fragrance of Christ with the scent of the local soil
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
