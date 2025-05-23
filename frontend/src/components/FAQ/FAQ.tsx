"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Homepage/Header";
import Footer from "@/components/Homepage/Footer";
import ScrollTop from "@/components/Homepage/ScrollTop";
import { ChevronUp, ChevronDown } from "lucide-react";

// FAQ item interface
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<number[]>([16]); // Default expanded item
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Toggle FAQ item expansion
  const toggleItem = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter FAQ items by category
  const filterByCategory = (category: string) => {
    setActiveCategory(category);
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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // FAQ data
  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "What degree programs are offered by Word Impact Network?",
      answer:
        "Word Impact Network offers a Bachelor of Theology (B.Th.) degree and Associate degree programs in Theology. We also provide various certificate programs in Biblical Studies, Ministry Leadership, and Christian Education.",
      category: "programs",
    },
    {
      id: 2,
      question:
        "What are the qualifications for enrolling in the degree program?",
      answer:
        "To enroll in our degree programs, applicants should have a high school diploma or equivalent. Additionally, applicants need to provide a personal testimony of faith, a recommendation from their local church pastor, and a commitment to complete the program requirements.",
      category: "admissions",
    },
    {
      id: 3,
      question: "Is the degree program offered online or on-campus?",
      answer:
        "Our programs are primarily offered online to serve the diaspora community across different geographic locations. This allows students to access education from anywhere while remaining connected to their local churches and ministries.",
      category: "programs",
    },
    {
      id: 4,
      question: "How will the courses be conducted in the online program?",
      answer:
        "Courses are conducted through our learning management system which includes recorded video lectures, live virtual classroom sessions, discussion forums, and digital resources. Students will have regular interaction with instructors and peers through online platforms.",
      category: "academics",
    },
    {
      id: 5,
      question: "How long does it take to complete the degree program?",
      answer:
        "The Bachelor of Theology program typically takes four years to complete if following the standard academic schedule. The Associate degree can be completed in two years. Certificate programs range from 3 months to 1 year depending on the specific program.",
      category: "programs",
    },
    {
      id: 16,
      question: "What happens if I miss a class?",
      answer:
        "Since classes are online, you can watch recorded lectures at any time. However, you should stay up-to-date with assignments and discussions. We encourage regular participation, but understand that circumstances may arise. Please communicate with your instructor if you anticipate missing multiple sessions.",
      category: "academics",
    },
    {
      id: 17,
      question: "What is the grading system at Word Impact Network?",
      answer:
        "We use a standard letter grading system (A, B, C, D, F) with corresponding grade points. Students must maintain a minimum GPA of 2.0 to remain in good academic standing. Detailed grading criteria are provided in each course syllabus.",
      category: "academics",
    },
    {
      id: 18,
      question:
        "What support does Word Impact Network offer if I have trouble with my studies?",
      answer:
        "We provide academic support through tutoring, study groups, and direct access to instructors. Additionally, we offer technical support for our online learning platforms, spiritual mentoring, and academic advising to help students succeed in their educational journey.",
      category: "student-support",
    },
    {
      id: 6,
      question: "What is the cost of tuition?",
      answer:
        "Word Impact Network is committed to making education affordable. Our tuition rates are significantly lower than traditional institutions. We also offer scholarships and financial assistance options for qualified students. Please contact our admissions office for current tuition information.",
      category: "financial",
    },
    {
      id: 7,
      question: "Are there scholarships available?",
      answer:
        "Yes, we offer various scholarships based on financial need, ministry involvement, and academic merit. We also work with ministry partners who sponsor students. We encourage all prospective students to apply for financial assistance.",
      category: "financial",
    },
    {
      id: 8,
      question: "How do I apply for admission?",
      answer:
        "You can apply online through our website by completing the application form, submitting required documents (including transcripts and recommendations), and paying the application fee. After review, qualified applicants will be invited for an interview.",
      category: "admissions",
    },
    {
      id: 9,
      question: "Is Word Impact Network accredited?",
      answer:
        "Word Impact Network is in the process of pursuing accreditation. Our curriculum is designed according to recognized academic standards in theological education. We maintain partnerships with accredited institutions to ensure quality education.",
      category: "general",
    },
    {
      id: 10,
      question: "Can I transfer credits from another institution?",
      answer:
        "Yes, we consider transfer credits from recognized institutions. The Admissions Committee evaluates transfer applications on a case-by-case basis. Generally, credits in relevant subjects with a grade of C or higher may be eligible for transfer.",
      category: "admissions",
    },
    {
      id: 11,
      question: "What language are the courses taught in?",
      answer:
        "Our courses are primarily taught in English, with some courses available in Nepali. Learning materials and resources are available in both languages to support students from diverse linguistic backgrounds within the Nepali-speaking diaspora.",
      category: "academics",
    },
    {
      id: 12,
      question: "Is there a ministry practicum component?",
      answer:
        "Yes, our degree programs include ministry practicum requirements where students apply their learning in real-world ministry settings. This practical component is typically coordinated with students' local churches or ministry organizations.",
      category: "programs",
    },
  ];

  // Get unique categories
  const categories = ["all", ...new Set(faqItems.map((item) => item.category))];

  // Filter FAQ items based on active category
  const filteredFAQs =
    activeCategory === "all"
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-purple-900 text-white py-20 mt-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Category Filter */}
              <div className="mb-12">
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === category
                          ? "bg-[#2c3e50] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => filterByCategory(category)}
                    >
                      {category === "all"
                        ? "All Questions"
                        : formatCategoryName(category)}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-100"
                  >
                    {/* Question Header */}
                    <button
                      className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                      onClick={() => toggleItem(item.id)}
                    >
                      <span className="font-medium text-lg text-gray-800">
                        {item.id}. {item.question}
                      </span>
                      <span
                        className={`ml-2 p-1 rounded-full ${
                          expandedItems.includes(item.id)
                            ? "bg-[#2c3e50] text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {expandedItems.includes(item.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </span>
                    </button>

                    {/* Answer Content */}
                    {expandedItems.includes(item.id) && (
                      <div className="px-5 pb-5">
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-gray-700">{item.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact for More Questions */}
              <div className="mt-16 p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Can&apos;t find what you&apos;re looking for?
                </h3>
                <p className="text-gray-700 mb-6">
                  If you have additional questions or need more information,
                  please don&apos;t hesitate to contact us.
                </p>
                <a
                  href="/contact"
                  className="inline-block bg-[#2c3e50] text-white px-6 py-3 rounded-md hover:bg-[#34495e] transition-colors"
                >
                  Contact Us
                </a>
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

export default FAQ;
