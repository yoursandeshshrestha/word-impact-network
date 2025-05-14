"use client";

import React from "react";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import ScrollTop from "@/src/components/Homepage/ScrollTop";

const About: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  // Handle scroll to show/hide the scroll-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About WIN</h1>
          </div>
        </section>

        {/* About Overview */}
        <section className="py-8 pt-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">
                Word Impact Network
              </h2>
              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Welcome to the Word Impact Network. We are a
                  non-denominational online institution that exists to train,
                  equip, and educate Nepali-speaking Christians, leaders, and
                  pastors through the teachings of the Holy Bible. Our goal is
                  to prepare individuals for Christian service and leadership in
                  the Church and society, including readiness for the Great
                  Commission.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Word Impact Network offers a variety of theological courses
                  taught by highly educated and qualified instructors who are
                  well-known for their academic excellence and long-time
                  faithfulness in church and ministry of the word. We offer a
                  Bachelor and an Associate degree in Theology and certificate
                  programs in many topics, giving students a comprehensive and
                  in-depth understanding of the Bible and its teachings. Our
                  courses are designed explicitly for Nepali-speaking Christians
                  and are tailored to meet this community unique needs and
                  prepare them for the Great Commission.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  The curriculum is based on the belief in the authority and
                  inerrancy of the Bible. We strongly emphasize personal
                  spiritual growth and transformation through the power of the
                  Holy Spirit.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  We believe that the local church is a vital part of the
                  Christian community, and we encourage our students to actively
                  get involved in the ministry and mission of their local
                  church. In addition, we also take seriously the importance of
                  evangelism and discipleship and our mission to share the
                  gospel message with the world.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  We are committed to academic excellence, integrity, and the
                  pursuit of knowledge. We constantly strive to be at the
                  forefront of biblical education. We are proud to provide our
                  students with the tools they need to understand and apply the
                  Word of God in their lives and service to others.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Thank you for visiting our website, and we hope you will
                  consider joining the Word Impact Network to be equipped for
                  your Christian service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-8  bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-200 pb-4">
                Mission Statement
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                The Word Impact Networks mission is to provide a comprehensive,
                biblical education to Nepali-speaking Christians to equip them
                for Christian service and leadership in the Church and society.
                We seek to foster personal spiritual growth and transformation
                through the power of the Holy Spirit and to prepare our students
                for the Great Commission.
              </p>
            </div>
          </div>
        </section>

        {/* Vision Statement */}
        <section className="py-8 pb-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-200 pb-4">
                Vision Statement
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To provide Nepali-speaking Christians with an exceptional
                biblical education that will equip them with the knowledge,
                skills, and spiritual growth necessary to fulfill their unique
                callings and to impact their communities for Christ.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Be A Mission Partner
            </h2>
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

export default About;
