"use client";

import React, { useEffect, useState } from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

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

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-20 mt-37">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Ambassadors of WIN
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Extending the Mission Beyond Borders
            </p>
          </div>
        </section>

        {/* Ambassadors Description */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-gray-700 text-lg leading-relaxed">
                  The Ambassadors of Word Impact Network (WIN) are passionate
                  individuals, pastors, ministry partners, and advocates who
                  carry the vision of WIN into new communities, churches, and
                  networks—both in India and around the world. As trusted
                  representatives, they help build awareness, foster
                  partnerships, and mobilize prayer and resources for the
                  mission. These ambassadors are not just supporters; they are
                  co-laborers—championing the cause of contextual missions,
                  advocating for the unreached, and inviting others to join in
                  spreading the fragrance of Christ with the scent of the local
                  soil. Whether through speaking engagements, personal
                  relationships, or digital platforms, our ambassadors are vital
                  to expanding the reach and impact of the Gospel through WIN.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Be A Mission Partner */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Be A Mission Partner
              </h2>
              <p className="text-gray-700 text-lg mb-8">
                Join us in advancing the Gospel among the Bengali-speaking
                population and unreached communities. Your partnership makes a
                difference.
              </p>
              <a
                href="/support-win"
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
              >
                Contact Word Impact Network
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default Ambassadors;
