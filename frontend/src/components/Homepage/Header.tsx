import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import DropdownNavItem from "@/common/components/DropdownNavItem";
import Link from "next/link";

// Sample data for dropdowns
const programsData = [
  {
    title: "Academic Programs",
    items: [
      { label: "Diploma in Technology", href: "#diploma" },
      { label: "Bachelor's Degree", href: "#bachelors" },
      { label: "Certificate Programs", href: "#certificate" },
      { label: "Master's Programs", href: "#masters" },
    ],
  },
  {
    title: "Featured Subjects",
    items: [
      { label: "Data Science", href: "#data-science" },
      { label: "Web Development", href: "#web-dev" },
      { label: "Business Analytics", href: "#business" },
      { label: "Digital Marketing", href: "#marketing" },
    ],
  },
];

const aboutData = [
  {
    title: "About Us",
    items: [
      { label: "Our Story", href: "#story" },
      { label: "Mission & Vision", href: "#mission" },
      { label: "Leadership Team", href: "#leadership" },
      { label: "Careers", href: "#careers" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Student Success Stories", href: "#success" },
      { label: "Partners & Sponsors", href: "#partners" },
      { label: "Global Impact", href: "#impact" },
      { label: "News & Events", href: "#news" },
    ],
  },
];

const resourcesData = [
  {
    title: "Learning Resources",
    items: [
      { label: "Online Library", href: "#library" },
      { label: "Research Papers", href: "#research" },
      { label: "Video Tutorials", href: "#tutorials" },
      { label: "Practice Exercises", href: "#exercises" },
    ],
  },
  {
    title: "Student Support",
    items: [
      { label: "Academic Advisors", href: "#advisors" },
      { label: "Technical Support", href: "#support" },
      { label: "Career Services", href: "#career" },
      { label: "Financial Aid", href: "#financial" },
    ],
  },
];

const contactData = [
  {
    title: "Get in Touch",
    items: [
      { label: "Contact Information", href: "#contact-info" },
      { label: "Campus Locations", href: "#locations" },
      { label: "Schedule a Visit", href: "#visit" },
      { label: "Request Information", href: "#request" },
    ],
  },
  {
    title: "Admission Process",
    items: [
      { label: "Application Steps", href: "#application" },
      { label: "Deadlines & Dates", href: "#deadlines" },
      { label: "Required Documents", href: "#documents" },
      { label: "International Students", href: "#international" },
    ],
  },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdown if clicking outside the nav area
      const target = event.target as HTMLElement;
      if (!target.closest("nav") && activeDropdown) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [scrolled, activeDropdown]);

  const handleOpenDropdown = (dropdown: string) => {
    setActiveDropdown(dropdown);
  };

  const handleCloseDropdown = () => {
    setActiveDropdown(null);
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 py-6 bg-white`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <span className="text-xl font-medium text-gray-900">
                Word Impact Network
              </span>
            </Link>
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex items-center justify-center space-x-8 flex-1">
            <div className="flex items-center justify-center space-x-8">
              {/* <DropdownNavItem
                label="Programs"
                columns={programsData}
                isOpen={activeDropdown === "programs"}
                onOpen={() => handleOpenDropdown("programs")}
                onClose={handleCloseDropdown}
              />
              <DropdownNavItem
                label="About"
                columns={aboutData}
                isOpen={activeDropdown === "about"}
                onOpen={() => handleOpenDropdown("about")}
                onClose={handleCloseDropdown}
              />
              <DropdownNavItem
                label="Resources"
                columns={resourcesData}
                isOpen={activeDropdown === "resources"}
                onOpen={() => handleOpenDropdown("resources")}
                onClose={handleCloseDropdown}
              />
              <DropdownNavItem
                label="Contact"
                columns={contactData}
                isOpen={activeDropdown === "contact"}
                onOpen={() => handleOpenDropdown("contact")}
                onClose={handleCloseDropdown}
              /> */}
            </div>
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/sign-in"
              className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              className="bg-black hover:bg-gray-800 text-white rounded-md px-5 py-2 text-sm font-medium transition-colors"
              href="/submit-application"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-900 p-1 focus:outline-none"
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-sm border-t border-gray-100">
          <div className="px-4 py-6 space-y-4">
            <div className="space-y-3">
              <p className="font-medium text-gray-900">Programs</p>
              <a
                href="#diploma"
                className="block py-2 text-gray-600 hover:text-black text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Diploma in Technology
              </a>
              <a
                href="#bachelors"
                className="block py-2 text-gray-600 hover:text-black text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bachelor&apos;s Degree
              </a>
              <a
                href="#certificate"
                className="block py-2 text-gray-600 hover:text-black text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Certificate Programs
              </a>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-gray-900">About</p>
              <a
                href="#story"
                className="block py-2 text-gray-600 hover:text-black text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Our Story
              </a>
              <a
                href="#mission"
                className="block py-2 text-gray-600 hover:text-black text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mission & Vision
              </a>
              <a
                href="#leadership"
                className="block py-2 text-gray-600 hover:text-black text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leadership Team
              </a>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <a
                href="#signin"
                className="block py-2 text-gray-600 hover:text-black text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </a>
              <button
                className="mt-4 w-full bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
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
