"use client";

import React from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

const OurStory: React.FC = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
            <p className="text-xl max-w-3xl mx-auto">
              From Vision to Movement, From Classrooms to Screens
            </p>
          </div>
        </section>

        {/* Story Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    The Birth of a Vision
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    The vision for Word Impact Network (WIN) was born in the
                    year 2000, fueled by a deep burden to bring the Gospel to
                    the Bengali-speaking world in a way that truly connects with
                    local hearts and cultures. For over two decades, this
                    calling was nurtured through prayer, personal sacrifice, and
                    frontline ministry.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    From Vision to Reality
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    In 2025, that vision became a reality with the official
                    launch of WIN—a mission movement committed to raising up
                    indigenous leaders and proclaiming Christ where He is not
                    yet known.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Expanding Our Reach
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    As WIN has grown, so has the desire to reach those who
                    cannot attend formal theological colleges due to poverty,
                    distance, or persecution. That&apos;s why we have launched
                    media-based and video classes—bringing theological
                    education, discipleship training, and pastoral development
                    right into homes, churches, and remote villages.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Technology Meets Mission
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Through mobile phones, online platforms, and offline
                    distribution, we are empowering a new generation of leaders
                    who may never step into a classroom, but who are being
                    equipped to serve powerfully in the mission field.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Our Mission in Action
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    From vision to movement, from classrooms to screens—WIN
                    exists to make disciples, plant churches, and spread the
                    fragrance of Christ with the scent of the local soil.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Ministry from Day One
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    At Word Impact Network (WIN), ministry doesn&apos;t begin
                    after graduation—it begins the moment you join the
                    classroom. From day one, students are immersed in hands-on
                    ministry, evangelism, and discipleship. By the time you
                    complete your degree, you won&apos;t just be
                    equipped—you&apos;ll already be leading a fellowship or
                    planting a church in your community. At WIN, we train
                    leaders who serve as they learn and lead as they grow.
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

export default OurStory;
