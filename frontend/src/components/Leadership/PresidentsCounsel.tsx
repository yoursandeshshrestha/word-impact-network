"use client";

import React, { useEffect, useState } from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

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

  return (
    <>
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-20 mt-37">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              President&apos;s Council
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              A Circle of Counsel, Prayer, and Strategic Partnership
            </p>
          </div>
        </section>

        {/* President's Council Description */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    The President&apos;s Council at Word Impact Network (WIN)
                    serves as a trusted group of spiritual advisors, mentors,
                    and strategic partners who walk closely with the President
                    to strengthen the mission, uphold its vision, and ensure
                    that every step we take is grounded in prayer, wisdom, and
                    accountability.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg">
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    This council is not a governing board, but a circle of
                    seasoned leaders and ministry partners who offer ongoing
                    guidance, intercession, encouragement, and counsel on
                    matters of leadership, growth, and spiritual direction. They
                    help the President remain centered in the call of Christ
                    while navigating the practical demands of a growing,
                    grassroots movement.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    The President&apos;s Council supports WIN by:
                  </h3>
                  <ul className="space-y-3 text-gray-700 text-lg">
                    <li>
                      • Providing spiritual and strategic guidance to the
                      President
                    </li>
                    <li>
                      • Upholding the leadership team in consistent prayer
                    </li>
                    <li>
                      • Offering insights on ministry expansion and
                      cross-cultural engagement
                    </li>
                    <li>
                      • Serving as ambassadors and advocates for WIN&apos;s
                      vision
                    </li>
                    <li>
                      • Encouraging healthy rhythms of leadership and rest
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg">
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    These men and women may come from various
                    backgrounds—pastoral ministry, missions, education, and
                    nonprofit work—but they share one heart: to see the name of
                    Jesus exalted among the Bengali-speaking and unreached
                    peoples of India.
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    The President&apos;s Council is a reminder that leadership
                    is never a solo journey—it is always a walk of fellowship,
                    accountability, and faith.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default PresidentsCounsel;
