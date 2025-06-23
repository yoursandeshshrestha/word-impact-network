"use client";

import React from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

const EducationalPrograms: React.FC = () => {
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
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-20 mt-37">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Educational Programs
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Equipping the Called to Serve the Unreached
            </p>
          </div>
        </section>

        {/* Program Overview */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                  Our Educational Programs
                </h2>
                <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-6">
                  At Word Impact Network (WIN), we are committed to training men
                  and women who are not only biblically grounded but also
                  culturally sensitive and practically prepared. Our educational
                  programs are designed to form Christ-centered leaders ready to
                  serve in church planting, evangelism, and holistic mission
                  across India&apos;s unreached regions.
                </p>
                <p className="text-gray-700 text-lg font-semibold">
                  We don&apos;t just teach ministry—we live it, model it, and
                  multiply it.
                </p>
              </div>

              <div className="space-y-12">
                {/* 1-Year Pioneer Church Planters Training */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    1-Year Pioneer Church Planters Training
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    A foundational, hands-on training program designed for
                    believers with a passion for frontline Gospel work. It
                    emphasizes personal discipleship, evangelism, and church
                    planting in a local context.
                  </p>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Highlights:
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Life of Jesus & Evangelism</li>
                      <li>• Discipleship Principles</li>
                      <li>• Introduction to Church Planting</li>
                      <li>• Biblical Foundations</li>
                      <li>• Basic Counseling & Worship</li>
                      <li>• Business as Mission (BAM)</li>
                      <li>• Field Exposure & Mentorship</li>
                    </ul>
                  </div>
                </div>

                {/* 4-Year Bachelor of Ministry Program */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    4-Year Bachelor of Ministry Program
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    A comprehensive, contextual training program for those
                    called to full-time ministry leadership. Each year builds on
                    the next, forming students in theology, character,
                    leadership, and mission.
                  </p>

                  <div className="space-y-8">
                    {/* Year 1 */}
                    <div className="bg-white p-6 rounded-lg">
                      <h4 className="text-xl font-bold mb-4 text-gray-800">
                        Year 1: Certificate in Theology
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Life of Jesus</li>
                        <li>• Discipleship I</li>
                        <li>• Know Your Bible (Old & New Testaments)</li>
                        <li>• Bibliology & Hermeneutics</li>
                        <li>• Doctrine I (God, Creation, Man)</li>
                        <li>• Evangelism (Books 1 & 2)</li>
                        <li>• Ministry of Jesus</li>
                        <li>• Church & Worship (Acts 2:42)</li>
                        <li>• Health, Hygiene & First Aid</li>
                        <li>• Income Generation I (Business as Mission)</li>
                      </ul>
                    </div>

                    {/* Year 2 */}
                    <div className="bg-white p-6 rounded-lg">
                      <h4 className="text-xl font-bold mb-4 text-gray-800">
                        Year 2: Diploma in Theology
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Discipleship II</li>
                        <li>• Doctrine II (Sin, Salvation, Grace)</li>
                        <li>• Book of Acts</li>
                        <li>• Church Planting Principles</li>
                        <li>• Art of Preaching</li>
                        <li>• Pauline & General Epistles</li>
                        <li>• Poetical & Wisdom Literature</li>
                        <li>• Christian Home (Marriage & Parenting)</li>
                        <li>
                          • Heroes of Faith: William Carey, Pandita Ramabai,
                          Sadhu Sundar Singh, and more
                        </li>
                        <li>• Income Generation II (BAM)</li>
                      </ul>
                    </div>

                    {/* Year 3 */}
                    <div className="bg-white p-6 rounded-lg">
                      <h4 className="text-xl font-bold mb-4 text-gray-800">
                        Year 3: Bachelor in Theology
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• The Book of Romans</li>
                        <li>• Doctrine III</li>
                        <li>• Prophetic Books & Prophetic Ministry</li>
                        <li>• Spiritual Warfare</li>
                        <li>• Christian Leadership</li>
                        <li>• Church History</li>
                        <li>• Major World Religions & Cults</li>
                        <li>• Indian Culture & Legal Framework</li>
                        <li>• Income Generation III (BAM)</li>
                      </ul>
                    </div>

                    {/* Year 4 */}
                    <div className="bg-white p-6 rounded-lg">
                      <h4 className="text-xl font-bold mb-4 text-gray-800">
                        Year 4: Preparing for Multiplication
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• The Book of Hebrews</li>
                        <li>• Pastoral Epistles</li>
                        <li>• Eschatology (Daniel & Revelation)</li>
                        <li>• Doctrine IV</li>
                        <li>• Counseling for Ministry & Addiction</li>
                        <li>• Education & Psychology</li>
                        <li>• Mission & Church Administration</li>
                        <li>• Apologetics</li>
                        <li>• Advanced Business as Mission (BAM)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Distinctives */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    Distinctives Across All Programs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="space-y-2 text-gray-700">
                      <li>• Daily Devotion & Discipleship</li>
                      <li>• Scripture Memorization</li>
                      <li>• Mentorship by Experienced Pastors</li>
                    </ul>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Hands-on Outreach & Village Ministry</li>
                      <li>• Bengali-Speaking Contextual Focus</li>
                      <li>
                        • Strong Emphasis on Character, Not Just Knowledge
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Graduation Goal */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    Graduation Goal
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    By the end of four years, each student will be spiritually
                    mature, doctrinally sound, culturally equipped, and
                    practically trained to serve as a pastor, church planter, or
                    mission leader—ready to advance the Kingdom of God in any
                    context.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    Interested in Joining?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Email us at:
                      </h4>
                      <a
                        href="mailto:wordimpactnetwork2025@gmail.com"
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        wordimpactnetwork2025@gmail.com
                      </a>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Call/WhatsApp:
                      </h4>
                      <a
                        href="tel:+919434321542"
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        +91- 94343 21542
                      </a>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Website:
                      </h4>
                      <span className="text-gray-700">
                        wordimpactnetwork.org
                      </span>
                    </div>
                  </div>
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

export default EducationalPrograms;
