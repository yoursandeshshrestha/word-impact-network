"use client";

import React from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

const PrivacyPolicy: React.FC = () => {
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
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-200">
              How we protect and handle your information
            </p>
          </div>
        </section>

        {/* Privacy Policy Content */}
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
                    Word Impact Network (WIN) is committed to protecting your
                    privacy and ensuring the security of your personal
                    information. This Privacy Policy explains how we collect,
                    use, disclose, and safeguard your information when you use
                    our educational platform, enroll in our courses, or interact
                    with our ministry services.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    By using our services, you agree to the collection and use
                    of information in accordance with this policy. We are
                    dedicated to transparency and will only use your information
                    to further our mission of spreading the fragrance of Christ
                    with the scent of the local soil.
                  </p>
                </div>

                {/* Information We Collect */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Information We Collect
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-700">
                        Personal Information
                      </h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                        <li>Name, email address, and contact information</li>
                        <li>Educational background and ministry experience</li>
                        <li>Course enrollment and progress information</li>
                        <li>Payment and billing information</li>
                        <li>Profile pictures and biographical information</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-700">
                        Usage Information
                      </h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                        <li>Course progress and completion data</li>
                        <li>Platform usage patterns and preferences</li>
                        <li>Communication history with our team</li>
                        <li>
                          Technical information (IP address, browser type)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How We Use Your Information */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    How We Use Your Information
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      We use your information for the following purposes:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Providing and improving our educational services</li>
                      <li>Processing course enrollments and payments</li>
                      <li>
                        Communicating with you about courses and ministry
                        updates
                      </li>
                      <li>Providing technical support and customer service</li>
                      <li>
                        Analyzing platform usage to enhance user experience
                      </li>
                      <li>
                        Ensuring compliance with our educational standards
                      </li>
                      <li>
                        Sharing ministry opportunities and prayer requests
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Information Sharing */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Information Sharing and Disclosure
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We do not sell, trade, or rent your personal information to
                    third parties. We may share your information only in the
                    following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>With your explicit consent</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>
                      With trusted service providers who assist in our
                      operations
                    </li>
                    <li>
                      For ministry collaboration with partner organizations
                      (with your consent)
                    </li>
                  </ul>
                </div>

                {/* Data Security */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Data Security
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We implement appropriate security measures to protect your
                    personal information against unauthorized access,
                    alteration, disclosure, or destruction. These measures
                    include:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
                    <li>Encryption of sensitive data</li>
                    <li>Regular security assessments</li>
                    <li>Secure hosting and data storage</li>
                    <li>Access controls and authentication</li>
                    <li>Regular backups and disaster recovery</li>
                  </ul>
                </div>

                {/* Your Rights */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Your Rights and Choices
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You have the following rights regarding your personal
                    information:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Access and review your personal information</li>
                    <li>Update or correct inaccurate information</li>
                    <li>
                      Request deletion of your information (subject to legal
                      requirements)
                    </li>
                    <li>Opt-out of marketing communications</li>
                    <li>Withdraw consent for specific data processing</li>
                    <li>Request data portability</li>
                  </ul>
                </div>

                {/* Cookies and Tracking */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Cookies and Tracking Technologies
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies and similar technologies to enhance your
                    experience on our platform. These technologies help us:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
                    <li>Remember your preferences and login status</li>
                    <li>Analyze platform usage and performance</li>
                    <li>Provide personalized content and recommendations</li>
                    <li>Ensure security and prevent fraud</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    You can control cookie settings through your browser
                    preferences.
                  </p>
                </div>

                {/* Children's Privacy */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Children&apos;s Privacy
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our services are primarily designed for adults seeking
                    ministry education. We do not knowingly collect personal
                    information from children under 13 without parental consent.
                    If you believe we have collected information from a child,
                    please contact us immediately.
                  </p>
                </div>

                {/* International Transfers */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    International Data Transfers
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    As a global ministry serving Bengali-speaking communities
                    worldwide, your information may be transferred to and
                    processed in countries other than your own. We ensure
                    appropriate safeguards are in place to protect your
                    information during such transfers.
                  </p>
                </div>

                {/* Policy Updates */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Changes to This Privacy Policy
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this Privacy Policy from time to time to
                    reflect changes in our practices or legal requirements. We
                    will notify you of any material changes by posting the
                    updated policy on our platform and updating the effective
                    date.
                  </p>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Contact Us
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions about this Privacy Policy or our
                    data practices, please contact us:
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

export default PrivacyPolicy;
