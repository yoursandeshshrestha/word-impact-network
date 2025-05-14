"use client";

import React, { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import ScrollTop from "@/src/components/Homepage/ScrollTop";

// Staff member images - replace with actual image paths
import staffImage1 from "@/public/graduation-image-two.jpg";
import staffImage2 from "@/public/graduation-image-two.jpg";
import staffImage3 from "@/public/graduation-image-two.jpg";
import staffImage4 from "@/public/graduation-image-two.jpg";
import staffImage5 from "@/public/graduation-image-two.jpg";
import staffImage6 from "@/public/graduation-image-two.jpg";

// Staff member interface for type safety
interface StaffMember {
  id: number;
  name: string;
  title: string;
  image: string | StaticImageData;
  location: string;
}

const Staff: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Handle scroll to show/hide the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Staff members data
  const staffMembers: StaffMember[] = [
    {
      id: 1,
      name: "Mr. Hemant Timalsina",
      title: "Registrar",
      image: staffImage1,
      location: "USA",
    },
    {
      id: 2,
      name: "Mr. Krishna Sharma",
      title: "Administrator",
      image: staffImage2,
      location: "Nepal",
    },
    {
      id: 3,
      name: "Mr. Suryodaya Timsina",
      title: "Chief Financial Officer",
      image: staffImage3,
      location: "USA",
    },
    {
      id: 4,
      name: "Ms. Priya Rai",
      title: "Student Affairs Coordinator",
      image: staffImage4,
      location: "India",
    },
    {
      id: 5,
      name: "Mr. Deepak Gurung",
      title: "IT Manager",
      image: staffImage5,
      location: "UK",
    },
    {
      id: 6,
      name: "Ms. Sabina Thapa",
      title: "Communications Director",
      image: staffImage6,
      location: "Canada",
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-purple-900 text-white py-20 mt-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Staff</h1>
          </div>
        </section>

        {/* Staff Description */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                Our dedicated staff members work tirelessly behind the scenes to
                ensure that Word Impact Network operates smoothly and
                effectively. They manage the day-to-day operations, handle
                administrative tasks, support our students, and help implement
                our mission to equip Nepali-speaking Christian leaders around
                the world.
              </p>
            </div>
          </div>
        </section>

        {/* Staff Members Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {staffMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="relative h-80 w-full">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-amber-600 mb-1">
                        {member.name}, {member.location}
                      </h3>
                      <p className="text-gray-800 font-medium">
                        {member.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Staff Departments - Optional */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
                Our Departments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Administration
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Program management and coordination</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Student records and academic tracking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Operational logistics and support</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Student Support
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Academic advising and resources</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Technical assistance for online learning</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Community building and student engagement</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Be A Mission Partner
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Join us in equipping Nepali-speaking Christian leaders around the
              world. Your partnership makes a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-yellow-600 text-white hover:bg-yellow-700 px-8 py-3 rounded-md text-lg font-semibold transition-colors"
              >
                Contact Word Impact Network →
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default Staff;
