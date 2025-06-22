"use client";

import React from "react";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

const SupportWinPage = () => {
  return (
    <div className="min-h-screen bg-[#f0eee6] pt-37">
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Support the Mission
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Join us in spreading the fragrance of Christ among
              Bengali-speaking communities
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Get in Touch
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  We&apos;d love to hear from you and discuss how you can
                  support WIN&apos;s mission of equipping Bengali-speaking
                  Christian leaders for contextual ministry.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Details */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Contact Information
                  </h3>

                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <Mail className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">
                        Email
                      </h4>
                      <a
                        href="mailto:wordimpactnetwork2025@gmail.com"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        wordimpactnetwork2025@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <Phone className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">
                        Phone
                      </h4>
                      <a
                        href="tel:+919434321542"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        +91- 94343 21542
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <MapPin className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">
                        Location
                      </h4>
                      <p className="text-gray-600">West Bengal, India</p>
                    </div>
                  </div>
                </div>

                {/* Support Options */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    How You Can Support
                  </h3>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Heart className="w-5 h-5 text-gray-600 mr-3" />
                        <h4 className="font-semibold text-gray-800">
                          Prayer Support
                        </h4>
                      </div>
                      <p className="text-gray-600">
                        Pray for our students, faculty, and the Bengali-speaking
                        communities we serve.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Heart className="w-5 h-5 text-gray-600 mr-3" />
                        <h4 className="font-semibold text-gray-800">
                          Financial Support
                        </h4>
                      </div>
                      <p className="text-gray-600">
                        Support our educational programs and ministry training
                        initiatives.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Heart className="w-5 h-5 text-gray-600 mr-3" />
                        <h4 className="font-semibold text-gray-800">
                          Partnership
                        </h4>
                      </div>
                      <p className="text-gray-600">
                        Partner with us in reaching Bengali-speaking communities
                        with the Gospel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center mt-16">
                <p className="text-gray-600 text-lg mb-6">
                  Ready to support WIN&apos;s mission?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:wordimpactnetwork2025@gmail.com"
                    className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                  >
                    <Mail className="w-5 h-5" />
                    Send us an Email
                  </a>
                  <a
                    href="tel:+919434321542"
                    className="inline-flex items-center gap-2 bg-transparent border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Call Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SupportWinPage;
