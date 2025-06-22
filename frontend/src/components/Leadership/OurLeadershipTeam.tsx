"use client";

import React, { useEffect, useState } from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

const OurLeadershipTeam: React.FC = () => {
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
              Our Leadership Team
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Faithful, mission-driven leaders deeply rooted in the Word of God
            </p>
          </div>
        </section>

        {/* Leadership Team Description */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-gray-700 text-lg leading-relaxed">
                  The leadership team at Word Impact Network (WIN) consists of
                  faithful, mission-driven leaders who are deeply rooted in the
                  Word of God and in the soil of the communities they serve.
                  Each brings years of experience, a heart for discipleship, and
                  a deep commitment to seeing the Gospel transform lives in
                  culturally relevant and lasting ways.
                </p>
              </div>

              {/* Leadership Team Members */}
              <div className="space-y-8">
                {/* Pastor Jagannath Banerjee */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Pastor Jagannath Banerjee
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Founder and Senior Leader
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    With over three decades of ministry experience, Pastor
                    Jagannath is a pioneer in contextual mission among
                    Bengali-speaking communities. His passion for the unreached,
                    especially in rural and marginalized areas, has led to the
                    birth of numerous churches and training centers. He is a
                    visionary leader with a shepherd&apos;s heart, mentoring the
                    next generation of Gospel workers with love and conviction.
                  </p>
                </div>

                {/* Pastor Biplab Sarkar */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Pastor Biplab Sarkar
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Director of Training and Discipleship
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Pastor Biplab is a dedicated Pastor, Worship Leader and
                    teacher who has faithfully served in challenging mission
                    fields across West Bengal. Known for his deep love for
                    Scripture and his ability to connect with grassroots
                    communities, he plays a vital role in discipleship,
                    leadership development, and coordinating mission outreach.
                  </p>
                </div>

                {/* Pastor Surajit Bagal */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Pastor Surajit Bagal
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Ministry Director – West Bengal
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Born and raised in West Bengal, Pastor Surajit carries a
                    powerful testimony of redemption and calling. With over 30
                    years in ministry, he leads WIN&apos;s leadership
                    development and theological training efforts, equipping
                    emerging pastors and evangelists to serve with humility,
                    wisdom, and contextual sensitivity.
                  </p>
                </div>

                {/* Brother Rajesh Chouhan */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Brother Rajesh Chouhan
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Leadership & Community Development Advisor
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Brother Rajesh Chouhan brings a strong foundation of faith,
                    wisdom, and practical experience to the WIN leadership team.
                    With a heart for empowering local believers, he plays a key
                    role in mentoring grassroots leaders, strengthening
                    community outreach, and ensuring accountability in field
                    operations. Rajesh is known for his humility, servant
                    leadership, and ability to bridge vision with action. His
                    insight into local cultures and deep commitment to the
                    Gospel make him a trusted voice in shaping WIN&apos;s
                    mission strategy and impact.
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

export default OurLeadershipTeam;
