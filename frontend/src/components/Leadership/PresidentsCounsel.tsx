"use client";

import React, { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import ScrollTop from "@/src/components/Homepage/ScrollTop";

// Counsel member images - replace with actual image paths
import counselImage1 from "@/public/graduation-image-two.jpg";
import counselImage2 from "@/public/graduation-image-two.jpg";
import counselImage3 from "@/public/graduation-image-two.jpg";
import counselImage4 from "@/public/graduation-image-two.jpg";
import counselImage5 from "@/public/graduation-image-two.jpg";
import counselImage6 from "@/public/graduation-image-two.jpg";

// Counsel member interface for type safety
interface CounselMember {
  id: number;
  name: string;
  title: string;
  image: string | StaticImageData;
  location: string;
}

const PresidentsCounsel: React.FC = () => {
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

  // Counsel members data
  const counselMembers: CounselMember[] = [
    {
      id: 1,
      name: "Ps. Manohar Pathak",
      title: "Ps.",
      image: counselImage1,
      location: "Nepal",
    },
    {
      id: 2,
      name: "Ps. Michael Magar",
      title: "Ps.",
      image: counselImage2,
      location: "USA",
    },
    {
      id: 3,
      name: "Ps. Raju Baraily",
      title: "Ps.",
      image: counselImage3,
      location: "HK",
    },
    {
      id: 4,
      name: "Ps. Robin Chetri",
      title: "Ps.",
      image: counselImage4,
      location: "India",
    },
    {
      id: 5,
      name: "Ps James Lingden",
      title: "Ps",
      image: counselImage5,
      location: "UK",
    },
    {
      id: 6,
      name: "Ps. Janet Khaling",
      title: "Ps.",
      image: counselImage6,
      location: "India",
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-purple-900 text-white py-20 mt-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Presidents Counsel
            </h1>
          </div>
        </section>

        {/* Counsel Description */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                The Presidents Counsel guides the President about different
                subjects that help Word Impact Network operate effectively
                internationally. The council includes experts from various
                fields. They provide critical insights and advice to the
                President to ensure that Word Impact Network fulfills its
                mission to equip Nepali-speaking Christian leaders for effective
                ministry.
              </p>
            </div>
          </div>
        </section>

        {/* Counsel Members Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {counselMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="relative h-80 w-full">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-amber-600 mb-1">
                        {member.name}, {member.location}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Counsel Responsibilities - Optional */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
                Counsel Areas of Expertise
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Theological Guidance
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Doctrinal integrity and biblical fidelity</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Contextual theological education</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Cultural adaptation of curriculum</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Ministry Strategy
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>International ministry partnerships</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Church planting and discipleship</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>
                        Leadership development in the diaspora context
                      </span>
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

export default PresidentsCounsel;
