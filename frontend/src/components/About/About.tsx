"use client";

import React from "react";

import ScrollTop from "@/components/Homepage/ScrollTop";

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
      <main>
        {/* Hero Section with Gray Background */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-20 mt-37">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About WIN</h1>
          </div>
        </section>

        {/* About Overview */}
        <section className="py-8 pt-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">
                Word Impact Network (WIN)
              </h2>
              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  At Word Impact Network (WIN), we believe that true ministry
                  begins with understanding—understanding the people we serve,
                  their culture, their language, and their deepest needs. In a
                  world marked by diversity, advancing the Kingdom of Christ
                  calls for more than passion—it demands a thoughtful,
                  contextual approach that connects with hearts at the deepest
                  level.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  That&apos;s why WIN is committed to &ldquo;spreading the
                  fragrance of Christ with the scent of the local soil.&rdquo;
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  We focus especially on the Bengali-speaking population,
                  seeking to share the Gospel in ways that are both authentic
                  and transformational. Rather than using one-size-fits-all
                  methods, we embrace culturally relevant strategies that speak
                  directly into the lives, struggles, and dreams of the
                  communities we reach.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Whether in rural villages or urban neighborhoods, our mission
                  is to bring the Good News where it&apos;s needed most—with
                  humility, compassion, and clarity.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  At WIN, we don&apos;t just deliver a message. We walk
                  alongside people, honoring their story while pointing them to
                  the story of Christ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Leadership Team */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
                Our Leadership Team
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-12 text-center">
                The leadership team at Word Impact Network (WIN) consists of
                faithful, mission-driven leaders who are deeply rooted in the
                Word of God and in the soil of the communities they serve. Each
                brings years of experience, a heart for discipleship, and a deep
                commitment to seeing the Gospel transform lives in culturally
                relevant and lasting ways.
              </p>

              <div className="space-y-12">
                {/* Pastor Jagannath Banerjee */}
                <div className="bg-white rounded-lg shadow-md p-8">
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
                <div className="bg-white rounded-lg shadow-md p-8">
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
                <div className="bg-white rounded-lg shadow-md p-8">
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
                <div className="bg-white rounded-lg shadow-md p-8">
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

export default About;
