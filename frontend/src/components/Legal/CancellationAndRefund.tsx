"use client";

import React from "react";
import ScrollTop from "@/components/Homepage/ScrollTop";

const CancellationAndRefund: React.FC = () => {
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
              Cancellation and Refund Policy
            </h1>
            <p className="text-xl text-gray-200">
              Understanding our policies for course cancellations and refunds
            </p>
          </div>
        </section>

        {/* Cancellation and Refund Content */}
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
                    Word Impact Network (WIN) is committed to providing quality
                    biblical education and ministry training. This Cancellation
                    and Refund Policy outlines the terms and conditions for
                    canceling course enrollments and requesting refunds. We
                    strive to be fair and transparent in all our policies while
                    maintaining the integrity of our educational programs.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    By enrolling in our courses, you acknowledge that you have
                    read and understood this policy. We encourage all students
                    to carefully consider their commitment before enrolling, as
                    our courses are designed to provide comprehensive ministry
                    training and spiritual development.
                  </p>
                </div>

                {/* General Policy */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    General Refund Policy
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Our general refund policy is as follows:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>
                        Course fees are generally non-refundable once access is
                        granted
                      </li>
                      <li>Refunds may be considered on a case-by-case basis</li>
                      <li>
                        Processing fees and administrative costs are
                        non-refundable
                      </li>
                      <li>
                        Refund requests must be submitted in writing with valid
                        reasons
                      </li>
                      <li>
                        Approved refunds will be processed within 15-30 business
                        days
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Refund Eligibility */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Refund Eligibility Criteria
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Refunds may be considered in the following circumstances:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                          ✅ Eligible for Refund
                        </h3>
                        <ul className="text-green-700 space-y-1 text-sm">
                          <li>• Technical issues preventing course access</li>
                          <li>• Course cancellation by WIN</li>
                          <li>• Serious illness or medical emergency</li>
                          <li>• Death in the immediate family</li>
                          <li>• Military deployment or relocation</li>
                          <li>
                            • Course significantly differs from description
                          </li>
                        </ul>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                          ❌ Not Eligible for Refund
                        </h3>
                        <ul className="text-red-700 space-y-1 text-sm">
                          <li>• Change of mind after course access</li>
                          <li>• Lack of time to complete course</li>
                          <li>• Dissatisfaction with course content</li>
                          <li>• Personal conflicts or schedule changes</li>
                          <li>• Failure to meet course requirements</li>
                          <li>• Violation of academic integrity policies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refund Process */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Refund Request Process
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      To request a refund, follow these steps:
                    </p>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <ol className="list-decimal list-inside text-gray-700 space-y-3">
                        <li>
                          <strong>Submit Written Request:</strong> Send an email
                          to wordimpactnetwork2025@gmail.com with the subject
                          line &quot;Refund Request - [Your Name]&quot;
                        </li>
                        <li>
                          <strong>Include Required Information:</strong>
                          <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                            <li>Full name and student ID</li>
                            <li>Course name and enrollment date</li>
                            <li>Detailed reason for refund request</li>
                            <li>Supporting documentation (if applicable)</li>
                            <li>Preferred refund method</li>
                          </ul>
                        </li>
                        <li>
                          <strong>Review Process:</strong> Our team will review
                          your request within 5-7 business days
                        </li>
                        <li>
                          <strong>Notification:</strong> You will receive an
                          email notification of the decision
                        </li>
                        <li>
                          <strong>Processing:</strong> If approved, refund will
                          be processed within 15-30 business days
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Course Cancellation */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Course Cancellation by WIN
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      WIN reserves the right to cancel courses under certain
                      circumstances:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Insufficient enrollment numbers</li>
                      <li>
                        Instructor unavailability due to unforeseen
                        circumstances
                      </li>
                      <li>Technical issues affecting course delivery</li>
                      <li>Changes in curriculum or program structure</li>
                      <li>Force majeure events (natural disasters, etc.)</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      In the event of course cancellation by WIN, enrolled
                      students will receive:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Full refund of course fees</li>
                      <li>Option to enroll in alternative courses</li>
                      <li>Credit toward future courses</li>
                      <li>Timely notification of cancellation</li>
                    </ul>
                  </div>
                </div>

                {/* Partial Refunds */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Partial Refunds and Credits
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      In certain cases, partial refunds or course credits may be
                      offered:
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        Partial Refund Scenarios
                      </h3>
                      <ul className="text-blue-700 space-y-2">
                        <li>
                          <strong>Course Progress:</strong> Refund percentage
                          based on course completion
                        </li>
                        <li>
                          <strong>Technical Issues:</strong> Partial refund for
                          significant platform problems
                        </li>
                        <li>
                          <strong>Course Modifications:</strong> Refund for
                          removed course content
                        </li>
                        <li>
                          <strong>Instructor Changes:</strong> Partial refund if
                          instructor changes significantly
                        </li>
                      </ul>
                    </div>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Course credits may be offered as an alternative to cash
                      refunds and can be used for future course enrollments
                      within 12 months.
                    </p>
                  </div>
                </div>

                {/* Refund Methods */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Refund Methods and Processing
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Approved refunds will be processed using the original
                      payment method:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>
                        <strong>Credit/Debit Cards:</strong> Refunded to the
                        original card (5-10 business days)
                      </li>
                      <li>
                        <strong>Bank Transfers:</strong> Direct transfer to your
                        bank account (3-7 business days)
                      </li>
                      <li>
                        <strong>Digital Wallets:</strong> Refunded to the
                        original wallet (1-3 business days)
                      </li>
                      <li>
                        <strong>Course Credits:</strong> Applied to your WIN
                        account immediately
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Processing times may vary depending on your financial
                      institution and payment method.
                    </p>
                  </div>
                </div>

                {/* Appeals Process */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Appeals Process
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    If your refund request is denied, you may appeal the
                    decision by submitting additional documentation or
                    requesting a review by our management team. Appeals must be
                    submitted within 30 days of the initial decision and should
                    include new information or circumstances not previously
                    considered.
                  </p>
                </div>

                {/* Special Circumstances */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Special Circumstances
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      WIN recognizes that exceptional circumstances may arise.
                      We are committed to working with students on a
                      case-by-case basis for situations including:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Natural disasters or emergencies</li>
                      <li>Government-imposed restrictions</li>
                      <li>
                        Significant life changes affecting ability to continue
                      </li>
                      <li>Documented financial hardship</li>
                      <li>Medical conditions requiring extended absence</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Students facing such circumstances should contact us
                      directly to discuss available options.
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    For questions about this policy or to submit refund
                    requests:
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
                    <p className="text-gray-700 mt-2">
                      <strong>Response Time:</strong> 5-7 business days for
                      initial review
                    </p>
                  </div>
                </div>

                {/* Policy Updates */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Policy Updates
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    This Cancellation and Refund Policy may be updated from time
                    to time. Students will be notified of any material changes
                    through email and platform announcements. The policy in
                    effect at the time of enrollment will apply to your course.
                  </p>
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

export default CancellationAndRefund;
