import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Column */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4">CONTACT</h3>
            <div className="text-gray-700 space-y-3">
              <p className="font-semibold">Word Impact Network (WIN)</p>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-600" />
                <span>+91 94343 21542</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-gray-600 mt-0.5" />
                <span>West Bengal, India</span>
              </div>
              <Link
                href="mailto:wordimpactnetwork2025@gmail.com"
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <Mail className="h-4 w-4 mr-2" />
                wordimpactnetwork2025@gmail.com
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4">
              QUICK LINKS
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about-win-impact-network"
                  className="text-gray-700 hover:text-gray-800"
                >
                  About WIN
                </Link>
              </li>
              <li>
                <Link
                  href="/our-story"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href="/educational-programs"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Educational Programs
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-700 hover:text-gray-800">
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/apply"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Leadership Column */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4">LEADERSHIP</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/office-of-the-president"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Office of the President
                </Link>
              </li>
              <li>
                <Link
                  href="/board-of-directors"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Board of Directors
                </Link>
              </li>
              <li>
                <Link
                  href="/presidents-council"
                  className="text-gray-700 hover:text-gray-800"
                >
                  President&apos;s Council
                </Link>
              </li>
              <li>
                <Link
                  href="/academic-leadership"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Academic Leadership
                </Link>
              </li>
              <li>
                <Link
                  href="/ambassadors"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Ambassadors
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs & Resources Column */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4">
              PROGRAMS & RESOURCES
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/courses"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/educational-programs"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Church Planters Training
                </Link>
              </li>
              <li>
                <Link
                  href="/educational-programs"
                  className="text-gray-700 hover:text-gray-800"
                >
                  4-Year Ministry Program
                </Link>
              </li>
              <li>
                <Link
                  href="/my-learning"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Student Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto text-center text-gray-700 text-sm px-4">
          © 2025 All rights Reserved | Word Impact Network (WIN) | Spreading the
          fragrance of Christ with the scent of the local soil
        </div>
      </div>
    </footer>
  );
};

export default Footer;
