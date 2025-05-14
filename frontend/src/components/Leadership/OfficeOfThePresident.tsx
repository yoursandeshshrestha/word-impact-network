"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import ScrollTop from "@/src/components/Homepage/ScrollTop";
import presidentImage from "@/public/sandesh.jpg"; // Replace with actual president image path

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
      <Header />
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-purple-900 text-white py-20 mt-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Office of the President
            </h1>
          </div>
        </section>

        {/* President Profile Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start gap-12">
                {/* Text Content */}
                <div className="w-full lg:w-3/5">
                  <h2 className="text-4xl font-bold text-gray-800 mb-6">
                    Mr. Sandesh Shrestha
                  </h2>

                  <div className="space-y-6 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      Mr. Sandesh Shrestha serves as the President of Word
                      Impact Network. He provides strategic guidance to Word
                      Impact Network and oversees the institutions operations.
                    </p>

                    <p className="text-lg leading-relaxed">
                      Mr. Shrestha has completed his Ph.D. in Homiletics
                      (Practical Theology) from Princeton Theological Seminary,
                      NJ USA in 2014 and M.Div. from ACTS (Asia Center of
                      Theological Studies and Mission), South Korea in 1999.
                      While pastoring the Church, Mr. Shrestha also enjoys
                      teaching as an adjunct professor at Towson University,
                      Maryland.
                    </p>

                    <p className="text-lg leading-relaxed">
                      He and his wife Kalpana live in Baltimore and have two
                      sons Joel and Amol. His passion is to equip and train the
                      leaders of Nepali-speaking churches in the US and beyond.
                    </p>
                  </div>

                  {/* Additional Leadership Details */}
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Leadership Vision
                    </h3>
                    <p className="text-lg leading-relaxed text-gray-700">
                      Under Mr. Shresthas leadership, Word Impact Network is
                      committed to providing high-quality theological education
                      that is accessible, affordable, and culturally relevant to
                      Nepali-speaking Christians around the world. His vision is
                      to see well-equipped leaders serving effectively in
                      churches and communities, making a lasting impact for the
                      Kingdom of God.
                    </p>
                  </div>

                  {/* Contact Information */}
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Office Contact
                    </h3>
                    <p className="text-lg leading-relaxed text-gray-700">
                      For appointments or inquiries related to the Office of the
                      President, please contact:
                    </p>
                    <p className="text-lg font-medium text-gray-800 mt-2">
                      Email: president@wordimpactnetwork.org
                    </p>
                  </div>
                </div>

                {/* President Image */}
                <div className="w-full lg:w-2/5 mt-8 lg:mt-0">
                  <div className="relative h-[600px] w-full rounded-lg overflow-hidden shadow-xl">
                    <Image
                      src={presidentImage}
                      alt="Dr. Manoj Shrestha, President"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Image Caption */}
                  <p className="text-center text-gray-600 mt-3 italic">
                    Mr. Sandesh Shrestha, Coder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Presidential Leadership Team
              </h2>
              <p className="text-lg text-gray-700 mb-12">
                The President works closely with a dedicated team of leaders to
                fulfill the mission and vision of Word Impact Network.
              </p>

              <div className="flex flex-col md:flex-row justify-center gap-8">
                {/* Leadership Team Member 1 */}
                <div className="bg-white rounded-lg shadow-md p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Academic Affairs
                  </h3>
                  <p className="text-gray-700">
                    Oversees all academic programs, faculty development, and
                    curriculum design.
                  </p>
                </div>

                {/* Leadership Team Member 2 */}
                <div className="bg-white rounded-lg shadow-md p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Administrative Office
                  </h3>
                  <p className="text-gray-700">
                    Manages day-to-day operations, student services, and
                    institutional resources.
                  </p>
                </div>

                {/* Leadership Team Member 3 */}
                <div className="bg-white rounded-lg shadow-md p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Community Relations
                  </h3>
                  <p className="text-gray-700">
                    Develops partnerships, community outreach, and alumni
                    connections.
                  </p>
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

export default OfficeOfThePresident;
