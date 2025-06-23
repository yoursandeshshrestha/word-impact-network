"use client";

import React, { useState, useEffect } from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";
import {
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  Globe,
  Users,
  BookOpen,
  Heart,
  MapPin,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

// FAQ item interface
interface FAQItem {
  id: number;
  question: string;
  answer: string | React.ReactNode;
  category?: string;
}

const FAQ: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<number[]>([1]); // Default expanded item
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Toggle FAQ item expansion
  const toggleItem = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // FAQ data with categories
  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "What is Word Impact Network (WIN)?",
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            Word Impact Network (WIN) is a Christ-centered mission organization
            dedicated to advancing the Gospel among the Bengali-speaking
            population and unreached communities through contextual ministry,
            discipleship, education, church planting, and compassion-based
            outreach.
          </p>
          <div className="flex items-center gap-2 text-blue-600">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">
              Christ-centered mission organization
            </span>
          </div>
        </div>
      ),
      category: "about",
    },
    {
      id: 2,
      question:
        'What does "spreading the fragrance of Christ with the scent of the local soil" mean?',
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            This phrase captures our heart for contextual missions—sharing the
            unchanging Gospel in culturally relevant ways. We seek to honor
            local language, traditions, and context while proclaiming the
            life-transforming message of Jesus Christ.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 italic">
              &quot;We honor local culture while sharing the eternal Gospel
              message&quot;
            </p>
          </div>
        </div>
      ),
      category: "about",
    },
    {
      id: 3,
      question: "Where does WIN operate?",
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            Our primary ministry fields are in West Bengal and surrounding
            regions in India, with an expanding network of outreach among
            Bengali-speaking communities in both rural and urban areas. We are
            also building partnerships globally through our ambassadors and
            support base.
          </p>
          <div className="flex items-center gap-2 text-green-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">
              Primary focus: West Bengal, India
            </span>
          </div>
        </div>
      ),
      category: "operations",
    },
    {
      id: 4,
      question: "What programs or ministries does WIN run?",
      answer: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            WIN currently leads several initiatives, including:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Ministry Programs
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• Church Planting and Evangelism</li>
                <li>• Media Ministry</li>
                <li>• Business as Mission (BAM) Projects</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-green-600" />
                Educational Programs
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• 1-Year Pioneer Church Planters Training</li>
                <li>• Certificate in Theology</li>
                <li>• Diploma in Theology</li>
                <li>• Bachelor in Theology</li>
                <li>• 4-Year Bachelor of Ministry Program</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      category: "programs",
    },
    {
      id: 5,
      question: "Is WIN a registered nonprofit organisation?",
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            Yes. Word Impact Network is a registered nonprofit organisation in
            India, operating under legal compliance and financial transparency.
            We are committed to ethical stewardship of all resources entrusted
            to us for Gospel-centered work.
          </p>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Tax Benefits:</strong> Donations made within India may be
              eligible for tax benefits under applicable laws.
            </p>
          </div>
        </div>
      ),
      category: "legal",
    },
    {
      id: 6,
      question: "How can I support WIN's work?",
      answer: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            You can support us through multiple ways:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Heart className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Prayer</h4>
                  <p className="text-sm text-gray-600">
                    For workers, communities, and the expansion of the Gospel
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Giving</h4>
                  <p className="text-sm text-gray-600">
                    One-time or monthly donations to specific projects or
                    general support
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Invite Us</h4>
                  <p className="text-sm text-gray-600">
                    Speak at your church, mission event, or home group
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Heart className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Volunteer</h4>
                  <p className="text-sm text-gray-600">
                    Partner in awareness campaigns and events
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Give Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button className="inline-flex items-center bg-transparent border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200">
              Invite Us to Speak
              <Users className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      ),
      category: "support",
    },
    {
      id: 7,
      question: "Can I visit the mission field or volunteer with WIN?",
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            Yes! We welcome short-term mission visitors, volunteers, and
            partners who share our values. Opportunities include teaching,
            children&apos;s ministry, construction, medical support, and
            encouragement of local leaders.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Contact us</strong> to learn more about volunteer
              opportunities and mission field visits.
            </p>
          </div>
        </div>
      ),
      category: "volunteer",
    },
    {
      id: 8,
      question: "How are WIN's leaders and missionaries trained?",
      answer: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Our team is equipped through a structured academic and spiritual
            formation program that includes:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <GraduationCap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  1-Year Pioneer Church Planter Training
                </h4>
                <p className="text-sm text-gray-600">
                  Foundation training for church planting ministry
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  4-Year Bachelor of Ministry Program
                </h4>
                <p className="text-sm text-gray-600">
                  Taught by seasoned pastors and theologians
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  Ongoing Development
                </h4>
                <p className="text-sm text-gray-600">
                  Mentorship, field exposure, and leadership development
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      category: "training",
    },
    {
      id: 9,
      question: "How can I stay updated on WIN's work?",
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            You can stay connected with our ministry through multiple channels:
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">
                Email Newsletter
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="h-6 w-6 text-blue-600 mx-auto mb-2">📱</div>
              <p className="text-sm font-medium text-gray-800">Social Media</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">
                Website Updates
              </p>
            </div>
          </div>
        </div>
      ),
      category: "updates",
    },
    {
      id: 10,
      question: "Who can I contact for more information?",
      answer: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            We would love to connect with you! Please reach out to us through
            any of these channels:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">Email</p>
                <p className="text-sm text-gray-600">
                  wordimpactnetwork2025@gmail.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">Phone</p>
                <p className="text-sm text-gray-600">+91 94343 21542</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Globe className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-800">Website</p>
                <p className="text-sm text-gray-600">wordimpactnetwork.org</p>
              </div>
            </div>
          </div>
        </div>
      ),
      category: "contact",
    },
    {
      id: 11,
      question: "How can I apply for admission to WIN's training programs?",
      answer: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            We welcome men and women who feel called to serve the Lord through
            church planting, discipleship, and Gospel-centered ministry.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">
              Application Process:
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Contact Us:</strong> Reach out via email or phone to
                  express your interest.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Application Form:</strong> We will provide an
                  application form to be completed with personal, spiritual, and
                  educational background details.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Interview:</strong> Shortlisted applicants will go
                  through a spiritual and pastoral interview (in-person or
                  remote).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Recommendation:</strong> A letter of recommendation
                  from a pastor or church leader is required.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  5
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Confirmation:</strong> Upon approval, candidates will
                  receive admission details and orientation instructions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">
              Available Programs:
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    1-Year Certificate in Theology
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    2-Year Diploma in Theology
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    3-Year Bachelor in Theology
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    4-Year Bachelor of Ministry Program
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> Priority is given to those committed to
              serving in rural, unreached, or underserved communities.
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>
                For more details or to begin your application, contact:
              </strong>
              <br />
              📧 wordimpactnetwork2025@gmail.com
              <br />
              📞 +91 9434321542
            </p>
          </div>
        </div>
      ),
      category: "admission",
    },
  ];

  // Filter FAQ items by category
  const filteredItems =
    activeCategory === "all"
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(
      new Set(faqItems.map((item) => item.category).filter(Boolean))
    ),
  ];

  return (
    <>
      <main>
        {/* Hero Section with Purple Background */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-20 mt-37">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions (FAQs)
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about Word Impact Network and our
              ministry
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-gray-50 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category || "")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      activeCategory === category
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {category === "all"
                      ? "All Questions"
                      : category === "about"
                      ? "About WIN"
                      : category === "operations"
                      ? "Operations"
                      : category === "programs"
                      ? "Programs"
                      : category === "legal"
                      ? "Legal & Financial"
                      : category === "support"
                      ? "Support & Giving"
                      : category === "volunteer"
                      ? "Volunteering"
                      : category === "training"
                      ? "Training"
                      : category === "updates"
                      ? "Updates"
                      : category === "contact"
                      ? "Contact"
                      : category === "admission"
                      ? "Admissions"
                      : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                      onClick={() => toggleItem(item.id)}
                    >
                      <span className="font-semibold text-gray-800 pr-4">
                        {item.question}
                      </span>
                      {expandedItems.includes(item.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      )}
                    </button>
                    {expandedItems.includes(item.id) && (
                      <div className="px-6 py-4 bg-white border-t border-gray-100">
                        {typeof item.answer === "string" ? (
                          <p className="text-gray-700 leading-relaxed">
                            {item.answer}
                          </p>
                        ) : (
                          item.answer
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No questions found for this category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default FAQ;
