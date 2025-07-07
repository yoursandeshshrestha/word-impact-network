import React from "react";
import {
  Calendar,
  MapPin,
  Users,
  BookOpen,
  CheckCircle,
  Phone,
  Mail,
} from "lucide-react";

const OnlineTraining = () => {
  const orientationLocations = [
    "Alipurduar",
    "Medinipur",
    "Sundarban",
    "Malda",
    "Kolkata",
    "Howrah",
    "Siliguri",
    "Purulia",
  ];

  const programFeatures = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "15 Video Classes Per Month",
      description: "Structured learning with comprehensive video content",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Progress-Based Unlocking",
      description: "Complete tests to unlock next video content",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Flexible Learning",
      description: "Study at your own pace with accountability",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Structured Curriculum",
      description:
        "Discipleship, Bible Study, Theology, Church Planting, and more",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-40 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            WIN Online Training Program – 2025
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Train from Where You Are. Serve Where God Sends You.
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            We&apos;re excited to announce the launch of WIN&apos;s Online
            Ministry Training Program for 2025— designed especially for those
            who are called to serve but cannot attend in-person Bible school.
            Whether you&apos;re in a remote village or a busy town, now you can
            be trained, equipped, and empowered through our structured and
            Spirit-led digital platform.
          </p>
        </div>

        {/* Orientation Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Orientation Starts August 2025
            </h2>
            <p className="text-lg text-gray-600">
              This year, 8 in-person Orientation Sessions will take place in the
              following locations:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {orientationLocations.map((location, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
              >
                <MapPin className="w-5 h-5 text-[#7a9e7e] mx-auto mb-2" />
                <p className="font-medium text-gray-900">{location}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Attendance at one of these orientations is strongly encouraged to
              help you begin well, connect with mentors, and understand the flow
              of the program.
            </p>
          </div>
        </div>

        {/* Registration Section */}
        <div className="bg-gradient-to-br from-[#7a9e7e] to-[#6a8e6e] rounded-2xl shadow-lg p-8 mb-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Registration Details</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <p>Online Registration is Mandatory for all students</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <p>Registration is NOW OPEN</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <p>
                  To confirm your registration, please complete the online
                  admission fee payment
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <p>Seats are limited, so register early to secure your spot</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-6">
                <p className="text-lg font-semibold mb-2">Register today:</p>
                <a
                  href="https://wordimpactnetwork.org"
                  className="text-xl font-bold underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  wordimpactnetwork.org
                </a>
                <p className="text-lg font-semibold mt-4">
                  Admission fee: ??????? Rs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How the Online Classes Work
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#7a9e7e]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <div className="text-[#7a9e7e]">{feature.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              This program is perfect for those who are working, serving in
              ministry, or living in areas where in- person training is
              difficult.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contact for More Info
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Seats are filling quickly—don&apos;t wait!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6">
                <Phone className="w-8 h-8 text-[#7a9e7e] mx-auto mb-4" />
                <p className="font-semibold text-gray-900 mb-2">
                  Call/WhatsApp
                </p>
                <a
                  href="tel:+919434321542"
                  className="text-lg text-[#7a9e7e] hover:underline"
                >
                  +91 94343 21542
                </a>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6">
                <Mail className="w-8 h-8 text-[#7a9e7e] mx-auto mb-4" />
                <p className="font-semibold text-gray-900 mb-2">Email</p>
                <a
                  href="mailto:wordimpactnetwork2025@gmail.com"
                  className="text-lg text-[#7a9e7e] hover:underline"
                >
                  wordimpactnetwork2025@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-[#7a9e7e] to-[#6a8e6e] rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Learn the Word. Live the Mission. Lead the Church.
            </h2>
            <p className="text-lg mb-6">
              Join WIN&apos;s online training and be part of a movement that is
              transforming India —one servant leader at a time.
            </p>
            <a
              href="/auth/apply"
              className="inline-flex items-center px-8 py-3 bg-white text-[#7a9e7e] font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineTraining;
