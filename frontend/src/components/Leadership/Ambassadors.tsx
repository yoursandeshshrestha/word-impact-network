"use client";

import React, { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import ScrollTop from "@/src/components/Homepage/ScrollTop";

// Ambassador images - replace with actual image paths
import ambassadorImage1 from "@/public/graduation-image-two.jpg";
import ambassadorImage2 from "@/public/graduation-image-two.jpg";
import ambassadorImage3 from "@/public/graduation-image-two.jpg";
import ambassadorImage4 from "@/public/graduation-image-two.jpg";
import ambassadorImage5 from "@/public/graduation-image-two.jpg";
import ambassadorImage6 from "@/public/graduation-image-two.jpg";
import ambassadorImage7 from "@/public/graduation-image-two.jpg";
import ambassadorImage8 from "@/public/graduation-image-two.jpg";
import ambassadorImage9 from "@/public/graduation-image-two.jpg";
import ambassadorImage10 from "@/public/graduation-image-two.jpg";
import ambassadorImage11 from "@/public/graduation-image-two.jpg";
import ambassadorImage12 from "@/public/graduation-image-two.jpg";

// Ambassador interface for type safety
interface Ambassador {
  id: number;
  name: string;
  title?: string;
  image: string | StaticImageData;
  location: string;
}

const Ambassadors: React.FC = () => {
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

  // Ambassadors data
  const ambassadors: Ambassador[] = [
    {
      id: 1,
      name: "Tul Bdr Gurung",
      image: ambassadorImage1,
      location: "Kuwait",
    },
    {
      id: 2,
      name: "Mariam Lama",
      image: ambassadorImage2,
      location: "Iraq",
    },
    {
      id: 3,
      name: "Ps Akash Shrestha",
      image: ambassadorImage3,
      location: "Nepal",
    },
    {
      id: 4,
      name: "Ps Yubraj Pradhan",
      image: ambassadorImage4,
      location: "Nepal",
    },
    {
      id: 5,
      name: "Ps. Brian Khadka",
      image: ambassadorImage5,
      location: "Canada",
    },
    {
      id: 6,
      name: "Ps Govind Koirala",
      image: ambassadorImage6,
      location: "Nepal",
    },
    {
      id: 7,
      name: "Ms. Anju Singh",
      image: ambassadorImage7,
      location: "HK",
    },
    {
      id: 8,
      name: "Mr. Anil Jung Thapa",
      image: ambassadorImage8,
      location: "UK",
    },
    {
      id: 9,
      name: "Ps. Kiran Mothey",
      image: ambassadorImage9,
      location: "India",
    },
    {
      id: 10,
      name: "Ps.Sona Chetri",
      image: ambassadorImage10,
      location: "India",
    },
    {
      id: 11,
      name: "Ps. Timothy Thapa",
      image: ambassadorImage11,
      location: "Nepal",
    },
    {
      id: 12,
      name: "Mr. Niraj Thapa",
      image: ambassadorImage12,
      location: "Nepal",
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-purple-900 text-white py-20 mt-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Ambassadors</h1>
          </div>
        </section>

        {/* Ambassadors Description */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                Ambassadors are Word Impact Networks representatives to various
                organizations, churches, and communities. They serve as a
                liaison between WIN and its stakeholders, building relationships
                and promoting WINs mission. The Ambassadors are passionate about
                equipping Nepali-speaking Christian leaders and spreading
                awareness about the work Word Impact Network is doing.
              </p>
            </div>
          </div>
        </section>

        {/* Ambassadors Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {ambassadors.map((ambassador) => (
                  <div
                    key={ambassador.id}
                    className="bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="relative h-72 w-full">
                      <Image
                        src={ambassador.image}
                        alt={ambassador.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-lg font-bold text-amber-600">
                        {ambassador.name}, {ambassador.location}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ambassador Role Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
                The Role of Our Ambassadors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Representation
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Represent WIN in their local communities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>
                        Share WINs vision and mission with churches and
                        organizations
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>
                        Build awareness about the needs of Nepali-speaking
                        Christian leaders
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Networking
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Connect potential students with WIN programs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>
                        Identify partnership opportunities with local ministries
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>
                        Facilitate resource sharing and collaboration between
                        WIN and churches
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

export default Ambassadors;
