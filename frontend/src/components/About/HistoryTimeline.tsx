"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

import ScrollTop from "@/components/Homepage/ScrollTop";
import {
  Award,
  GraduationCap,
  Globe,
  Handshake,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import graduationImage from "@/assets/graduation-image-two.jpg";
import { StaticImageData } from "next/image";

// Timeline Event interface for type safety
interface TimelineEvent {
  year: string;
  title: string;
  image: string | StaticImageData;
  description: string;
  color: string;
}

// Stat interface for type safety
interface Stat {
  icon: React.ReactNode;
  number: number;
  title: string;
}

const HistoryTimeline: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // Toggle timeline item expansion
  const toggleTimelineItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  // Handle scroll to show/hide the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Milestone statistics data
  const stats: Stat[] = [
    {
      icon: <Award className="w-8 h-8 text-gray-600" />,
      number: 0,
      title: "Certificate Distributed",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-gray-600" />,
      number: 0,
      title: "Total Graduates",
    },
    {
      icon: <Globe className="w-8 h-8 text-gray-600" />,
      number: 0,
      title: "Countries & Territories",
    },
    {
      icon: <Handshake className="w-8 h-8 text-gray-600" />,
      number: 0,
      title: "Partnership with local Churches",
    },
    {
      icon: <BookOpen className="w-8 h-8 text-gray-600" />,
      number: 0,
      title: "Courses Taught",
    },
  ];

  // Timeline events data with matching color scheme from your homepage
  const timelineEvents: TimelineEvent[] = [
    {
      year: "2015",
      title: "Certificate of Ministry",
      image: graduationImage,
      description:
        "The Certificate of Ministry course was held from September 12, 2015, to May 30, 2017, at Nepal Baptist Church of Baltimore. During this time, 27 local church leaders from Maryland and Virginia participated in the course, which was taught 4 hours a week for 2 years. The course covered a variety of topics including Old Testament Survey, New Testament Survey, Preaching, and Bible Study Method. The course was designed to equip church leaders with the knowledge and skills they need to lead their congregations and serve their communities effectively.",
      color: "bg-[#2c3e50]",
    },
    {
      year: "2016",
      title: "Gospel of John Bible Study",
      image: graduationImage,
      description:
        "Bible study classes on the Gospel of John were conducted for pastors and church leaders to deepen their understanding of Scripture and enhance their teaching abilities. This series focused on interpretive methods, theological themes, and practical application of John's Gospel.",
      color: "bg-[#7a9e7e]",
    },
    {
      year: "2017",
      title: "Church Leadership Workshop, Pittsburgh",
      image: graduationImage,
      description:
        "On November 25-26, 2017, Dr. Manoj Shrestha taught a 15-hour class on Christian leadership at the Pittsburgh Bhutanese Hosanna Church. 21 participants received certificates after completing the class which was specifically tailored to the needs of the Bhutanese-Nepalese Christian leaders and well received by the leaders, providing valuable insights and practical tools for the leaders to improve their leadership skills and better serve their community.",
      color: "bg-[#b7773a]",
    },
    {
      year: "2020",
      title: "Word Impact Network Founded",
      image: graduationImage,
      description:
        "Word Impact Network was officially established as a comprehensive biblical education platform to serve Nepali-speaking Christians globally, building upon the foundation of previous ministry training initiatives. The organization was founded with the vision to provide accessible theological education to the diaspora community.",
      color: "bg-[#2c3e50]",
    },
  ];

  return (
    <>
      <main>
        {/* Hero Section with Purple Background - Matching homepage style */}
        <section className="bg-purple-900 text-white py-20 mt-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Milestone
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Tracing our journey of equipping Nepali-speaking Christian leaders
              around the world
            </p>
          </div>
        </section>

        {/* Stats Section - Matching homepage stats section style */}
        <section id="stats-section" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                OUR MILESTONE
              </h3>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
                Trained Pastors & Leaders Globally
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="stat-item text-center p-6 rounded-xl transition-colors duration-300"
                >
                  <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {stat.number}
                    <span className="text-gray-500">+</span>
                  </div>
                  <div className="text-gray-600 mt-2 font-medium">
                    {stat.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section - Improved for better match with homepage */}
        <section id="timeline-section" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                OUR JOURNEY
              </h3>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-10">
                History & Milestones
              </h2>
            </div>

            <div className="relative max-w-6xl mx-auto">
              {/* Vertical line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-300 z-0"></div>

              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className={`mb-20 relative z-10 flex ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Year bubble */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <div
                      className={`w-16 h-16 ${event.color} rounded-full flex items-center justify-center text-white font-bold z-20 shadow-md`}
                    >
                      {event.year}
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className={`w-5/12 ${
                      index % 2 === 0
                        ? "pr-16 md:text-right"
                        : "pl-16 md:text-left"
                    }`}
                  >
                    <div
                      className={`bg-white rounded-xl shadow-md overflow-hidden`}
                    >
                      <div className="relative h-56 w-full overflow-hidden">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                        <div
                          className={`absolute inset-0 ${event.color}/30`}
                        ></div>
                      </div>

                      <div className={`p-6`}>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">
                          {event.title}
                        </h3>

                        {/* Better read more implementation that doesn't jump around */}
                        <div
                          className={`relative transition-all duration-300 ease-in-out ${
                            expandedItems.includes(index)
                              ? "max-h-[1000px]"
                              : "max-h-[80px] overflow-hidden"
                          }`}
                        >
                          <p className="text-gray-600">{event.description}</p>
                          {!expandedItems.includes(index) && (
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                          )}
                        </div>

                        <div
                          className={`flex ${
                            index % 2 === 0 ? "justify-end" : "justify-start"
                          } mt-4`}
                        >
                          <button
                            onClick={() => toggleTimelineItem(index)}
                            className={`${event.color} text-white py-1 px-3 rounded-md flex items-center text-sm hover:opacity-90 transition-opacity`}
                          >
                            {expandedItems.includes(index) ? (
                              <>
                                Read Less <ChevronUp className="ml-1 w-4 h-4" />
                              </>
                            ) : (
                              <>
                                Read More{" "}
                                <ChevronDown className="ml-1 w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-5/12"></div>
                </div>
              ))}
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
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-md text-lg font-semibold transition-colors"
              >
                Contact Word Impact Network
              </a>
            </div>
          </div>
        </section>
      </main>

      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default HistoryTimeline;
