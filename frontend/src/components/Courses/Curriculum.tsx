"use client";

import React, { useEffect, useState } from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

const Curriculum: React.FC = () => {
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
              4-Year Curriculum
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Bachelor of Ministry Program
            </p>
            <p className="text-lg max-w-2xl mx-auto mt-4">
              Equipping men and women for Christ-centered, culturally relevant
              leadership
            </p>
          </div>
        </section>

        {/* Curriculum Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-12">
                {/* Year 1 */}
                <div id="year1" className="bg-gray-50 p-8 rounded-lg">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Year 1: Foundation and Formation
                  </h2>
                  <p className="text-gray-700 text-lg mb-6">
                    Orientation (First 4 months) — Introducing foundational
                    ministry principles through four core subjects.
                  </p>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      Core Courses:
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li>
                        • Life of Jesus – Rev. Dr. Vivekananda Mukhopadhyay
                      </li>
                      <li>• Discipleship I – Pastor Jagannath Banerjee</li>
                      <li>
                        • Know Your Bible (Old & New Testaments) – Pastor
                        Lakshman Mandal
                      </li>
                      <li>
                        • Bible Study: Bibliology & Hermeneutics – Pastor
                        Muktidan Sarkar (includes practical training)
                      </li>
                      <li>
                        • Ministry of Jesus – Rev. Dr. Vivekananda Mukhopadhyay
                      </li>
                      <li>
                        • Evangelism (Books 1 & 2) – Brother Surajit Bagal
                      </li>
                      <li>
                        • Doctrine I: Theology of God, Creation, and Man – Dr.
                        Mrinal Sarkar
                      </li>
                      <li>
                        • Church & Worship (Acts 2:42 model) – Rev. Biplab
                        Sarkar
                      </li>
                      <li>• Health & Hygiene / Basic Medical First Aid</li>
                      <li>• Income Generation I: Business as Mission (BAM)</li>
                    </ul>
                  </div>
                </div>

                {/* Year 2 */}
                <div id="year2" className="bg-gray-50 p-8 rounded-lg">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Year 2: Growth and Grounding
                  </h2>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      Core Courses:
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li>• Discipleship II – Pastor Jagannath Banerjee</li>
                      <li>• Doctrine II: Sin, Salvation, and Related Themes</li>
                      <li>• The Book of Acts</li>
                      <li>• Church Planting</li>
                      <li>
                        • Heroes of Faith – Biographical studies on William
                        Carey, Pandita Ramabai, Sadhu Sundar Singh, Polycarp,
                        Ida Scudder, David Livingstone, Adoniram Judson, Justin
                        Martyr, George Müller, K.P. Yohannan, Oswald Chambers,
                        and more.
                      </li>
                      <li>• Art of Preaching</li>
                      <li>• Pauline & General Epistles</li>
                      <li>• Poetical & Wisdom Literature</li>
                      <li>• Christian Home: Marriage & Parenting</li>
                      <li>• Income Generation II: Business as Mission (BAM)</li>
                    </ul>
                  </div>
                </div>

                {/* Year 3 */}
                <div id="year3" className="bg-gray-50 p-8 rounded-lg">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Year 3: Depth and Discernment
                  </h2>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      Core Courses:
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li>• The Book of Romans</li>
                      <li>• Spiritual Warfare</li>
                      <li>• Prophetical Books & Prophetic Ministry</li>
                      <li>• Doctrine III</li>
                      <li>• Major World Religions and Cults</li>
                      <li>• Church History</li>
                      <li>• Christian Leadership</li>
                      <li>• Culture and Legal Frameworks</li>
                      <li>
                        • Income Generation III: Business as Mission (BAM)
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Year 4 */}
                <div id="year4" className="bg-gray-50 p-8 rounded-lg">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Year 4: Maturity and Mission
                  </h2>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      Core Courses:
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li>• The Book of Hebrews</li>
                      <li>• Pastoral Epistles</li>
                      <li>• Eschatology (Daniel & Revelation)</li>
                      <li>• Education and Psychology</li>
                      <li>• Doctrine IV</li>
                      <li>
                        • Counseling for Ministry – Including pastoral care,
                        addiction, trauma, and personal guidance
                      </li>
                      <li>• Apologetics</li>
                      <li>• Mission and Church Administration</li>
                      <li>• Advanced Business as Mission (BAM)</li>
                    </ul>
                  </div>
                </div>

                {/* Graduation Goal */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Graduation Goal
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    By the end of four years, each student will be spiritually
                    mature, doctrinally sound, culturally equipped, and
                    practically trained to serve as a pastor, church planter, or
                    mission leader—ready to advance the Kingdom of God in any
                    context.
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

export default Curriculum;
