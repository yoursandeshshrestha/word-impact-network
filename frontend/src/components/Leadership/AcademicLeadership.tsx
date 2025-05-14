"use client";

import React, { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import ScrollTop from "@/src/components/Homepage/ScrollTop";

// Academic leader images - replace with actual image paths
import leaderImage1 from "@/public/graduation-image-two.jpg";
import leaderImage2 from "@/public/graduation-image-two.jpg";
import leaderImage3 from "@/public/graduation-image-two.jpg";
import leaderImage4 from "@/public/graduation-image-two.jpg";
import leaderImage5 from "@/public/graduation-image-two.jpg";
import leaderImage6 from "@/public/graduation-image-two.jpg";

// Academic leader interface for type safety
interface AcademicLeader {
  id: number;
  name: string;
  title: string;
  image: string | StaticImageData;
  location: string;
  credentials: string;
}

const AcademicLeadership: React.FC = () => {
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

  // Academic leaders data
  const academicLeaders: AcademicLeader[] = [
    {
      id: 1,
      name: "Dr. Mangal Man Maharjan",
      title: "Academic Dean",
      image: leaderImage1,
      location: "Nepal",
      credentials: "D.Min from ACTS Korea",
    },
    {
      id: 2,
      name: "Dr. Manoj Shrestha",
      title: "Professor of Theology",
      image: leaderImage2,
      location: "USA",
      credentials: "Ph.D. Princeton Theological Seminary",
    },
    {
      id: 3,
      name: "Dr. Norbu Tamang",
      title: "Professor of Biblical Studies",
      image: leaderImage3,
      location: "USA",
      credentials: "D.Min. from Ashland Theological Seminary",
    },
    {
      id: 4,
      name: "Dr. Bijaya Karki",
      title: "Professor of Pastoral Ministry",
      image: leaderImage4,
      location: "India",
      credentials: "Ph.D. Fuller Theological Seminary",
    },
    {
      id: 5,
      name: "Dr. Sushma Gurung",
      title: "Professor of Missiology",
      image: leaderImage5,
      location: "UK",
      credentials: "D.Miss. Trinity Evangelical Divinity School",
    },
    {
      id: 6,
      name: "Dr. Priscilla Tamang",
      title: "Professor of Christian Education",
      image: leaderImage6,
      location: "India",
      credentials: "Ed.D. Asia Graduate School of Theology",
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
              Academic Leadership
            </h1>
          </div>
        </section>

        {/* Academic Leadership Description */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                The Academic Leadership team at Word Impact Network comprises
                experienced faculty members who design and teach WINs courses.
                They bring a wealth of knowledge and expertise in their fields
                and are passionate about equipping Nepali-speaking Christian
                leaders for effective ministry. Our faculty members hold
                advanced degrees from prestigious institutions around the world
                and are committed to providing quality theological education
                that is both biblically sound and culturally relevant.
              </p>
            </div>
          </div>
        </section>

        {/* Academic Leaders Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {academicLeaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="relative h-80 w-full">
                      <Image
                        src={leader.image}
                        alt={leader.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-amber-600 mb-1">
                        {leader.name}, {leader.location}
                      </h3>
                      <p className="text-gray-700 font-medium">
                        {leader.title}
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        {leader.credentials}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Academic Focus Areas */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
                Academic Focus Areas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Biblical & Theological Studies
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Biblical languages and interpretation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Systematic and historical theology</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Contextual theological reflection</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Practical Ministry
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Church planting and growth strategies</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Pastoral care and counseling</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 font-bold mr-2">•</span>
                      <span>Missional leadership in diaspora contexts</span>
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

export default AcademicLeadership;
