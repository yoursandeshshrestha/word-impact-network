"use client";

import React, { useEffect, useState } from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

const AcademicLeadership: React.FC = () => {
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
              Academic Leadership
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Equipping Servant-Leaders with Biblical Depth and Missional
              Clarity
            </p>
          </div>
        </section>

        {/* Academic Leadership Description */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                At Word Impact Network (WIN), our Academic Leadership Team is
                committed to raising up a new generation of Christ-centered
                leaders who are not only biblically grounded but also culturally
                relevant and missionally effective.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mt-4">
                Our academic leadership oversees the design, development, and
                delivery of all training programs, including the 1-Year Pioneer
                Church Planters Training and the 4-Year Bachelor of Ministry
                Program (with Year 4 focusing on Preparing for Multiplication).
                With decades of combined experience in theological education,
                church planting, and frontline ministry, our leaders ensure that
                every course is rooted in Scripture, shaped by local context,
                and aimed at real-world transformation.
              </p>
            </div>
          </div>
        </section>

        {/* Key Responsibilities */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
                Key Responsibilities
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-700 leading-relaxed">
                    • Developing contextual, Spirit-led curriculum
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-700 leading-relaxed">
                    • Training and mentoring future pastors, evangelists, and
                    ministry leaders
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-700 leading-relaxed">
                    • Maintaining academic integrity with practical mission
                    emphasis
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-700 leading-relaxed">
                    • Equipping students in theology, leadership, evangelism,
                    and holistic ministry
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-700 leading-relaxed">
                    • Ensuring discipleship remains at the core of all learning
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Academic Leaders */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-gray-800 text-center">
                Meet Our Academic Leaders
              </h2>

              <div className="space-y-12">
                {/* Pastor Jagannath Banerjee */}
                <div className="bg-gray-50 rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Pastor Jagannath Banerjee
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Senior Instructor – Discipleship
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    As the founder of WIN and a seasoned church planter, Pastor
                    Banerjee teaches core subjects in discipleship, church
                    planting, and mission theology. His teachings are marked by
                    spiritual depth and a heart for equipping leaders who will
                    carry the Gospel to unreached places.
                  </p>
                </div>

                {/* Pastor Biplab Sarkar */}
                <div className="bg-gray-50 rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Pastor Biplab Sarkar
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Faculty – Church & Worship / Practical Theology
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Pastor Biplab is known for his dynamic teaching style and
                    deep love for the church. He focuses on the biblical model
                    of church life, worship, and the role of the Holy Spirit in
                    local congregations.
                  </p>
                </div>

                {/* Pastor Surajit Bagal */}
                <div className="bg-gray-50 rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Pastor Surajit Bagal
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Mission & Evangelism
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    With over 30 years of ministry experience, Pastor Surajit
                    leads the academic vision of WIN with passion and purpose.
                    He specializes in leadership development, contextual
                    theology, and spiritual formation. His personal journey from
                    brokenness to calling makes him a compassionate and powerful
                    mentor to students.
                  </p>
                </div>

                {/* Rev. Dr. Vivekananda Mukhopadhyay */}
                <div className="bg-gray-50 rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Rev. Dr. Vivekananda Mukhopadhyay
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Senior Faculty – New Testament & Life of Jesus
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    A respected theologian and Bible teacher, Dr. Mukhopadhyay
                    brings academic rigor and pastoral warmth to his
                    instruction. His teachings on the Gospels and the ministry
                    of Christ lay a strong foundation for all students.
                  </p>
                </div>

                {/* Dr. Mrinal Sarkar */}
                <div className="bg-gray-50 rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Dr. Mrinal Sarkar
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-4">
                    Faculty – Systematic Theology
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Dr. Sarkar teaches core doctrine with clarity and
                    conviction, helping students understand and articulate their
                    faith with theological precision and pastoral sensitivity.
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

export default AcademicLeadership;
