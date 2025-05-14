import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Column */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4">CONTACT</h3>
            <div className="text-gray-700">
              <p className="mb-2">Word Impact Network</p>
              <p className="mb-2">+91 8597831451</p>
              <p className="mb-2">Sabak more, Siliguri, West Bengal, India</p>
              <Link
                href="mailto:info@hida.education"
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <Mail className="h-4 w-4 mr-2" />
                info@wordimpactnetwork.org
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
                <Link href="/faq" className="text-gray-700 hover:text-gray-800">
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/academic-calendar"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Academic Calendar
                </Link>
              </li>
              <li>
                <Link
                  href="/apply"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Ministry Resources Column */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4">
              MINISTRY RESOURCES
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/video-library"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Video Library
                </Link>
              </li>
              <li>
                <Link
                  href="/leadership-training"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Leadership Training
                </Link>
              </li>
              <li>
                <Link
                  href="/bible-project"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Bible Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Column */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4">
              SOCIAL MEDIA
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://facebook.com"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href="https://youtube.com"
                  className="text-gray-700 hover:text-gray-800"
                >
                  Youtube
                </Link>
              </li>
              <li>
                <Link
                  href="/student-portal"
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
          © All rights Reserved | Word Impact Network
        </div>
      </div>
    </footer>
  );
};

export default Footer;
