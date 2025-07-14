"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  BookOpen,
} from "lucide-react";
import ScrollTop from "@/components/Homepage/ScrollTop";

const Contact: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

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

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate form submission (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general",
      });

      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-20 mt-37">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-gray-200">
              Get in touch with Word Impact Network
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Introduction */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">
                  We&apos;d Love to Hear from You
                </h2>
                <p className="text-gray-700 text-lg max-w-3xl mx-auto">
                  Whether you have questions about our educational programs,
                  want to learn more about our ministry training, or need
                  support with your spiritual journey, our team is here to help.
                  Reach out to us and let&apos;s start a conversation.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    Send Us a Message
                  </h3>

                  {submitStatus === "success" && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800">
                        Thank you for your message! We&apos;ll get back to you
                        within 24-48 hours.
                      </p>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800">
                        Sorry, there was an error sending your message. Please
                        try again or contact us directly.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+91 12345 67890"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="inquiryType"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Inquiry Type *
                        </label>
                        <select
                          id="inquiryType"
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="course">Course Information</option>
                          <option value="enrollment">
                            Enrollment Questions
                          </option>
                          <option value="technical">Technical Support</option>
                          <option value="ministry">Ministry Partnership</option>
                          <option value="prayer">Prayer Request</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief subject of your inquiry"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Please share your message, questions, or prayer requests..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-8">
                  {/* Direct Contact */}
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">
                      Get in Touch
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Mail className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800">Email</h4>
                          <a
                            href="mailto:wordimpactnetwork2025@gmail.com"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            wordimpactnetwork2025@gmail.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Phone className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800">Phone</h4>
                          <a
                            href="tel:+919434321542"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            +91 94343 21542
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Location
                          </h4>
                          <p className="text-gray-700">West Bengal, India</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Clock className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Response Time
                          </h4>
                          <p className="text-gray-700">24-48 hours</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">
                      Quick Links
                    </h3>
                    <div className="space-y-3">
                      <Link
                        href="/about-win-impact-network"
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Users className="h-5 w-5 mr-3" />
                        About WIN
                      </Link>
                      <Link
                        href="/courses"
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <BookOpen className="h-5 w-5 mr-3" />
                        Our Courses
                      </Link>
                      <Link
                        href="/educational-programs"
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <MessageSquare className="h-5 w-5 mr-3" />
                        Educational Programs
                      </Link>
                      <Link
                        href="/faq"
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <MessageSquare className="h-5 w-5 mr-3" />
                        Frequently Asked Questions
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Our Mission
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                At Word Impact Network, we are committed to &quot;spreading the
                fragrance of Christ with the scent of the local soil.&quot; We
                believe in providing contextual, culturally relevant biblical
                education that transforms lives and communities. Your questions,
                feedback, and partnership help us fulfill this mission more
                effectively.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mt-4">
                Whether you&apos;re a student, ministry partner, or someone
                seeking spiritual guidance, we&apos;re here to walk alongside
                you in your journey of faith and learning.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default Contact;
