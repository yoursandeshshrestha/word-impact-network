"use client";

import React, { useState, useEffect } from "react";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import ScrollTop from "@/src/components/Homepage/ScrollTop";
import { Calendar, ChevronDown, ChevronUp, Download } from "lucide-react";

// Newsletter interface for type safety
interface Newsletter {
  id: number;
  title: string;
  date: string;
  description: string;
  pdfLink: string;
  year: number;
}

const Newsletters: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [expandedYears, setExpandedYears] = useState<number[]>([2023]); // Default show current year

  // Handle scroll to show/hide the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle year expansion
  const toggleYear = (year: number) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dummy newsletter data - replace with your actual newsletters
  const newsletters: Newsletter[] = [
    {
      id: 1,
      title: "WIN Winter Newsletter",
      date: "December 15, 2023",
      description:
        "Year-end updates, holiday greetings, and upcoming courses for the winter season.",
      pdfLink: "/newsletters/win-winter-2023.pdf",
      year: 2023,
    },
    {
      id: 2,
      title: "WIN Fall Newsletter",
      date: "September 5, 2023",
      description:
        "Fall semester courses, new faculty introductions, and community outreach programs.",
      pdfLink: "/newsletters/win-fall-2023.pdf",
      year: 2023,
    },
    {
      id: 3,
      title: "WIN Summer Newsletter",
      date: "June 20, 2023",
      description:
        "Summer intensive programs, mission trips, and graduate testimonials.",
      pdfLink: "/newsletters/win-summer-2023.pdf",
      year: 2023,
    },
    {
      id: 4,
      title: "WIN Spring Newsletter",
      date: "March 12, 2023",
      description:
        "Spring courses, Easter celebrations, and ministry updates from our alumni.",
      pdfLink: "/newsletters/win-spring-2023.pdf",
      year: 2023,
    },
    {
      id: 5,
      title: "WIN Winter Newsletter",
      date: "December 18, 2022",
      description:
        "Year-end updates, Christmas greetings, and upcoming winter programs.",
      pdfLink: "/newsletters/win-winter-2022.pdf",
      year: 2022,
    },
    {
      id: 6,
      title: "WIN Fall Newsletter",
      date: "September 10, 2022",
      description:
        "Fall semester curriculum, new partnerships, and student testimonials.",
      pdfLink: "/newsletters/win-fall-2022.pdf",
      year: 2022,
    },
    {
      id: 7,
      title: "WIN Spring Newsletter",
      date: "March 15, 2022",
      description:
        "Spring courses, Easter message, and ministry updates from our faculty.",
      pdfLink: "/newsletters/win-spring-2022.pdf",
      year: 2022,
    },
    {
      id: 8,
      title: "WIN Winter Newsletter",
      date: "December 20, 2021",
      description:
        "Year-end review, holiday greetings, and vision for the coming year.",
      pdfLink: "/newsletters/win-winter-2021.pdf",
      year: 2021,
    },
    {
      id: 9,
      title: "WIN Fall Newsletter",
      date: "September 8, 2021",
      description:
        "Fall program updates, student stories, and ministry opportunities.",
      pdfLink: "/newsletters/win-fall-2021.pdf",
      year: 2021,
    },
  ];

  // Group newsletters by year
  const newslettersByYear = newsletters.reduce((acc, newsletter) => {
    if (!acc[newsletter.year]) {
      acc[newsletter.year] = [];
    }
    acc[newsletter.year].push(newsletter);
    return acc;
  }, {} as Record<number, Newsletter[]>);

  // Get years and sort in descending order
  const years = Object.keys(newslettersByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section with Purple Background - Matching homepage style */}
        <section className="bg-purple-900 text-white py-20 mt-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Newsletters</h1>
          </div>
        </section>

        {/* Description Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-700 text-lg max-w-4xl mx-auto">
              Catch up on the latest Word Impact Network newsletter for the
              newest updates. If you missed any previous editions, don&apos;t
              worry — you can find archived newsletters organized by year below.
            </p>
          </div>
        </section>

        {/* Newsletters Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {years.map((year) => (
                <div key={year} className="mb-12">
                  {/* Year Header */}
                  <div
                    className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6 cursor-pointer"
                    onClick={() => toggleYear(year)}
                  >
                    <h2 className="text-2xl font-bold text-gray-800">
                      {year} Newsletters
                    </h2>
                    <button
                      className="text-purple-900 p-2 rounded-full hover:bg-gray-100"
                      aria-label={
                        expandedYears.includes(year) ? "Collapse" : "Expand"
                      }
                    >
                      {expandedYears.includes(year) ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  {/* Newsletters Grid */}
                  {expandedYears.includes(year) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {newslettersByYear[year].map((newsletter) => (
                        <div
                          key={newsletter.id}
                          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="p-6">
                            <div className="flex items-center text-gray-600 text-sm mb-3">
                              <Calendar className="w-4 h-4 mr-2" />
                              {newsletter.date}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              {newsletter.title}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {newsletter.description}
                            </p>
                            <a
                              href={newsletter.pdfLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center bg-[#2c3e50] text-white py-2 px-4 rounded hover:bg-[#34495e] transition-colors"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscribe Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-gray-600 mb-8">
                Stay updated with the latest news, events, and resources from
                Word Impact Network. We send newsletters quarterly.
              </p>
              <form className="flex flex-col md:flex-row gap-4 justify-center">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-grow max-w-md"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#2c3e50] text-white px-6 py-3 rounded-md hover:bg-[#34495e] transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* CTA Section - Matching homepage CTA style */}
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

export default Newsletters;
