"use client";

import React from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

const TermsAndConditions: React.FC = () => {
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
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-20 mt-37">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms and Conditions
            </h1>
            <p className="text-xl text-gray-200">
              Governing the use of our educational platform and services
            </p>
          </div>
        </section>

        {/* Terms and Conditions Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {/* Introduction */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Introduction
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms and Conditions govern your use of the Word
                    Impact Network (WIN) educational platform, courses, and
                    services. By accessing or using our services, you agree to
                    be bound by these terms and our mission of spreading the
                    fragrance of Christ with the scent of the local soil.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    WIN is dedicated to providing biblical education and
                    ministry training to Bengali-speaking communities worldwide.
                    Our services include online courses, educational resources,
                    ministry training programs, and community support.
                  </p>
                </div>

                {/* Acceptance of Terms */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing our platform, enrolling in courses, or using
                    any of our services, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms and
                    Conditions. If you do not agree with any part of these
                    terms, you must not use our services.
                  </p>
                </div>

                {/* Eligibility */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Eligibility and Registration
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      To use our services, you must:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Be at least 18 years old or have parental consent</li>
                      <li>
                        Provide accurate and complete registration information
                      </li>
                      <li>Maintain the security of your account credentials</li>
                      <li>Notify us immediately of any unauthorized use</li>
                      <li>Comply with all applicable laws and regulations</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      We reserve the right to refuse service, terminate
                      accounts, or remove content at our discretion.
                    </p>
                  </div>
                </div>

                {/* Course Enrollment and Payment */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Course Enrollment and Payment
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Course enrollment is subject to the following terms:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>
                        Course fees must be paid in full before access is
                        granted
                      </li>
                      <li>
                        All payments are non-refundable unless otherwise
                        specified
                      </li>
                      <li>
                        Course access is granted for the specified duration
                      </li>
                      <li>
                        Sharing course materials with non-enrolled users is
                        prohibited
                      </li>
                      <li>
                        We reserve the right to modify course content and
                        requirements
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Academic Standards */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Academic Standards and Conduct
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      As a ministry-focused educational institution, we expect
                      all students to:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Maintain academic integrity and honesty</li>
                      <li>Respect the biblical foundation of our teachings</li>
                      <li>Engage in respectful and constructive dialogue</li>
                      <li>
                        Complete assignments and assessments independently
                      </li>
                      <li>Uphold Christian values in all interactions</li>
                      <li>
                        Use course materials for personal and ministry
                        development only
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Violation of academic standards may result in course
                      failure, suspension, or permanent dismissal.
                    </p>
                  </div>
                </div>

                {/* Intellectual Property */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Intellectual Property Rights
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      All content on our platform, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Course materials, videos, and presentations</li>
                      <li>Textbooks, study guides, and assessments</li>
                      <li>Website design and functionality</li>
                      <li>WIN logos, trademarks, and branding</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Are the property of Word Impact Network and are protected
                      by copyright and other intellectual property laws. You may
                      not reproduce, distribute, or create derivative works
                      without our express written permission.
                    </p>
                  </div>
                </div>

                {/* User Content */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    User-Generated Content
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    By submitting content to our platform (discussions,
                    assignments, feedback), you grant WIN a non-exclusive,
                    royalty-free license to use, modify, and display such
                    content for educational and ministry purposes. You represent
                    that you have the right to grant this license and that your
                    content does not violate any third-party rights.
                  </p>
                </div>

                {/* Prohibited Activities */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Prohibited Activities
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You agree not to engage in any of the following activities:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Sharing account credentials with others</li>
                    <li>
                      Attempting to gain unauthorized access to our systems
                    </li>
                    <li>Uploading malicious software or content</li>
                    <li>
                      Harassing, bullying, or discriminating against other users
                    </li>
                    <li>
                      Using our platform for commercial purposes without
                      permission
                    </li>
                    <li>Violating any applicable laws or regulations</li>
                    <li>Attempting to reverse engineer our platform</li>
                  </ul>
                </div>

                {/* Privacy and Data */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Privacy and Data Protection
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Your privacy is important to us. Our collection and use of
                    your personal information is governed by our Privacy Policy,
                    which is incorporated into these Terms and Conditions by
                    reference. By using our services, you consent to our
                    collection and use of your information as described in our
                    Privacy Policy.
                  </p>
                </div>

                {/* Disclaimers */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Disclaimers and Limitations
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Our services are provided &quot;as is&quot; without warranties of
                      any kind. WIN does not guarantee:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Uninterrupted or error-free service</li>
                      <li>Compatibility with all devices or browsers</li>
                      <li>
                        Employment or ministry opportunities upon completion
                      </li>
                      <li>Transferability of credits to other institutions</li>
                      <li>Accuracy of all course content or materials</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      WIN shall not be liable for any indirect, incidental,
                      special, or consequential damages arising from your use of
                      our services.
                    </p>
                  </div>
                </div>

                {/* Termination */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Termination
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may terminate or suspend your access to our services
                    immediately, without prior notice, for conduct that we
                    believe violates these Terms and Conditions or is harmful to
                    other users, WIN, or third parties. Upon termination, your
                    right to use our services will cease immediately.
                  </p>
                </div>

                {/* Governing Law */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Governing Law and Dispute Resolution
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms and Conditions shall be governed by and
                    construed in accordance with the laws of India. Any disputes
                    arising from these terms or your use of our services shall
                    be resolved through good faith negotiation, and if
                    necessary, through appropriate legal channels in West
                    Bengal, India.
                  </p>
                </div>

                {/* Changes to Terms */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Changes to Terms and Conditions
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify these Terms and Conditions at
                    any time. We will notify users of any material changes by
                    posting the updated terms on our platform. Your continued
                    use of our services after such changes constitutes
                    acceptance of the new terms.
                  </p>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions about these Terms and Conditions,
                    please contact us:
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">
                      <strong>Email:</strong> wordimpactnetwork2025@gmail.com
                    </p>
                    <p className="text-gray-700">
                      <strong>Phone:</strong> +91 94343 21542
                    </p>
                    <p className="text-gray-700">
                      <strong>Address:</strong> West Bengal, India
                    </p>
                  </div>
                </div>

                {/* Effective Date */}
                <div className="border-t pt-6">
                  <p className="text-gray-600 text-sm">
                    <strong>Effective Date:</strong> January 1, 2025
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <strong>Last Updated:</strong> January 1, 2025
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

export default TermsAndConditions;
