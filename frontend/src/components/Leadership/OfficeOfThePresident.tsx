"use client";

import React, { useEffect, useState } from "react";

import ScrollTop from "@/components/Homepage/ScrollTop";

const OfficeOfThePresident: React.FC = () => {
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
              Office of the President
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Providing Vision, Stewardship, and Spiritual Leadership
            </p>
          </div>
        </section>

        {/* President Profile Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  Pastor Jagannath Banerjee
                </h2>
                <h3 className="text-2xl font-semibold text-gray-600 mb-8">
                  Founder & President
                </h3>

                <div className="space-y-6 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    With over 30 years of frontline ministry experience, Pastor
                    Jagannath Banerjee leads WIN with deep conviction, humility,
                    and a passion for contextual mission. Having planted
                    churches, trained leaders, and pioneered initiatives across
                    rural and urban India, he brings both theological depth and
                    practical wisdom to the role.
                  </p>

                  <p className="text-lg leading-relaxed">
                    As President, he oversees:
                  </p>

                  <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed text-gray-700 ml-4">
                    <li>Vision casting and mission alignment</li>
                    <li>Leadership development and pastoral mentoring</li>
                    <li>Strategic partnerships and global engagement</li>
                    <li>Theological integrity and spiritual formation</li>
                    <li>
                      Prayer covering and pastoral care for the WIN network
                    </li>
                  </ul>

                  <p className="text-lg leading-relaxed">
                    Pastor Banerjee embodies the mission of WIN: &quot;to spread
                    the fragrance of Christ with the scent of the local
                    soil.&quot; His leadership continues to inspire a new
                    generation of Gospel workers who are rooted in Scripture,
                    shaped by the culture they serve, and led by the Holy
                    Spirit.
                  </p>

                  <p className="text-lg leading-relaxed">
                    Under his guidance, the Office of the President serves not
                    only as an administrative post but as a spiritual
                    anchor—keeping the ministry grounded in its founding call:
                    to make Christ known where He is not yet known.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Focus Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Our Mission Focus
              </h2>
              <p className="text-lg text-gray-700 mb-12">
                The Office of the President at Word Impact Network (WIN) exists
                to provide spiritual oversight, strategic direction, and
                pastoral care to the mission, ensuring that every initiative
                reflects the heart of Christ and serves the people we are called
                to reach.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default OfficeOfThePresident;
