"use client";

import React, { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";

import ScrollTop from "@/components/Homepage/ScrollTop";

// Director images - replace with actual image paths
import directorImage1 from "@/assets/sandesh.jpg";
import directorImage2 from "@/assets/sandesh.jpg";
import directorImage3 from "@/assets/sandesh.jpg";
import directorImage4 from "@/assets/sandesh.jpg";
import directorImage5 from "@/assets/sandesh.jpg";
import directorImage6 from "@/assets/sandesh.jpg";

// Director interface for type safety
interface Director {
  id: number;
  name: string;
  title: string;
  image: string | StaticImageData;
  location?: string;
}

const BoardOfDirectors: React.FC = () => {
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

  // Directors data
  const directors: Director[] = [
    {
      id: 1,
      name: "Dr. Mangal Man Maharjan",
      title: "Dr.",
      image: directorImage1,
    },
    {
      id: 2,
      name: "Dr. Norbu Tamang",
      title: "Dr.",
      image: directorImage2,
    },
    {
      id: 3,
      name: "Mr. Arjun Hamal",
      title: "Mr.",
      image: directorImage3,
    },
    {
      id: 4,
      name: "Mr. Prem Tamang",
      title: "Mr.",
      image: directorImage4,
    },
    {
      id: 5,
      name: "Ps. Bhadra Rai",
      title: "Ps.",
      image: directorImage5,
      location: "USA",
    },
    {
      id: 6,
      name: "Ps Surendra Rai",
      title: "Ps",
      image: directorImage6,
      location: "Canada",
    },
  ];

  return (
    <>
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-purple-900 text-white py-20 mt-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Board of Directors
            </h1>
          </div>
        </section>

        {/* Board Description */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                The Board of Directors is responsible for the governance of Word
                Impact Network, setting policies, making major decisions, and
                ensuring financial accountability. The Board provides strategic
                guidance to the President and helps to ensure the long-term
                sustainability and growth of Word Impact Network.
              </p>
            </div>
          </div>
        </section>

        {/* Directors Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {directors.map((director) => (
                  <div
                    key={director.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="relative h-80 w-full">
                      <Image
                        src={director.image}
                        alt={director.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-amber-600 mb-1">
                        {director.name}
                        {director.location && `, ${director.location}`}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Board Responsibilities - Optional */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
                Board Responsibilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Governance
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>
                        Setting organizational policies and procedures
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Ensuring compliance with legal requirements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Strategic planning and vision casting</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Oversight
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Financial accountability and sustainability</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Program evaluation and quality assurance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Risk management and mitigation</span>
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

      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default BoardOfDirectors;
