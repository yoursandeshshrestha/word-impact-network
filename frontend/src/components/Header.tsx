import React, { useState, useEffect } from "react";
import { GraduationCap, Menu, X } from "lucide-react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? " bg-[#f0eee6]  shadow-md py-5" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-10">
            <a href="/" className="flex items-center group">
              <div className="bg-blue-500 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white transform group-hover:scale-110 transition-transform" />
              </div>
              <span className="ml-3 text-lg font-bold text-gray-800">
                EduCares
              </span>
            </a>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#programs"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Programs
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="#resources"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Resources
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </a>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <a
              href="#signin"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
            >
              Sign In
            </a>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors">
              Apply Now
            </button>
          </div>

          <button
            className="md:hidden text-gray-800 p-2 focus:outline-none"
            aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg">
          <div className="px-4 py-3 space-y-2">
            <a
              href="#programs"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Programs
            </a>
            <a
              href="#about"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#resources"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Resources
            </a>
            <a
              href="#contact"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <a
                href="#signin"
                className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </a>
              <button
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
