"use client";

import React, { useEffect, useState } from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

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

  return (
    <>
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-20 mt-37">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Board of Directors
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Guiding the Mission with Wisdom, Integrity, and Faith
            </p>
          </div>
        </section>

        {/* Board Description */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                The Board of Directors of Word Impact Network (WIN) provides
                strategic oversight, spiritual counsel, and financial
                accountability to ensure that every aspect of the ministry
                remains faithful to its vision: to spread the fragrance of
                Christ with the scent of the local soil.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mt-4">
                Our board is composed of trusted leaders who bring a wealth of
                ministry experience, grassroots insight, and unwavering
                commitment to the Gospel. Together, they help shape the
                mission&apos;s long-term direction, protect its integrity, and
                empower its growth across India and beyond.
              </p>
            </div>
          </div>
        </section>

        {/* Board Members */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
                Board Members
              </h2>

              <div className="space-y-12">
                {/* Pastor Jagannath Banerjee */}
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Pastor Jagannath Banerjee
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Founder & President, Word Impact Network
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    A visionary leader with over three decades of ministry
                    experience, Pastor Banerjee serves as the spiritual anchor
                    of WIN, guiding the board with biblical insight and a
                    passion for reaching the unreached.
                  </p>
                </div>

                {/* Pastor Surajit Bagal */}
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Pastor Surajit Bagal
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Ministry Director, West Bengal
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Pastor Surajit brings rich experience in pastoral ministry,
                    leadership development, and contextual theology. His
                    personal testimony and lifelong dedication to Gospel work
                    deeply shape WIN&apos;s training programs and field strategy.
                  </p>
                </div>

                {/* Pastor Biplab Sarkar */}
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Pastor Biplab Sarkar
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Director of Training & Discipleship
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    An experienced church planter and discipler, Pastor Biplab
                    plays a vital role in local mission coordination and
                    strategic outreach. He brings a heart for worship, prayer,
                    and practical community engagement.
                  </p>
                </div>

                {/* Brother Rajesh Chouhan */}
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Brother Rajesh Chouhan
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Advisor & Ministry Partner
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Brother Rajesh contributes to the board through his deep
                    faith, administrative insight, and commitment to mobilizing
                    local resources for sustainable mission work. His voice
                    represents lay leaders who are active in advancing the
                    Kingdom at the grassroots level.
                  </p>
                </div>

                {/* Brother Ananda Poria */}
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Brother Ananda Poria
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Field Liaison & Community Advocate
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Brother Ananda serves as a bridge between field workers and
                    leadership, offering practical wisdom from years of hands-on
                    service among the poor and marginalized. His perspective
                    helps ensure WIN remains grounded and people-focused.
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-lg text-gray-700 italic">
                  Together, the Board of Directors ensures that Word Impact
                  Network remains faithful to its calling—advancing the Gospel
                  through local leadership, contextual mission, and unwavering
                  faith in the One who called us.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default BoardOfDirectors;
