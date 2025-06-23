import React from "react";
import {
  BookOpen,
  Users,
  Presentation,
  GraduationCap,
  Heart,
} from "lucide-react";

const AcademicProgram: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-gray-800 tracking-wide">
            Our Educational Programs
          </h2>
          <p className="text-gray-700 max-w-4xl mx-auto text-xl font-medium leading-relaxed">
            Equipping the Called to Serve the Unreached
          </p>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg mt-4">
            At Word Impact Network (WIN), we are committed to training men and
            women who are not only biblically grounded but also culturally
            sensitive and practically prepared.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 1-Year Pioneer Church Planters Training */}
          <div className="bg-[#2c3e50] text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col h-full">
              <div className="bg-white/10 p-4 rounded-full mb-6 w-fit">
                <Heart size={48} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-wide">
                1-Year Pioneer Church Planters Training
              </h3>
              <p className="text-gray-200 mb-6 font-medium text-lg">
                A foundational, hands-on training program designed for believers
                with a passion for frontline Gospel work.
              </p>
              <ul className="space-y-3 text-base font-medium flex-grow">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Life of Jesus & Evangelism
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Discipleship Principles
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Introduction to Church Planting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Business as Mission (BAM)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Field Exposure & Mentorship
                </li>
              </ul>
            </div>
          </div>

          {/* 4-Year Bachelor of Ministry Program */}
          <div className="bg-[#7a9e7e] text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col h-full">
              <div className="bg-white/10 p-4 rounded-full mb-6 w-fit">
                <GraduationCap size={48} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-wide">
                4-Year Bachelor of Ministry Program
              </h3>
              <p className="text-gray-200 mb-6 font-medium text-lg">
                A comprehensive, contextual training program for those called to
                full-time ministry leadership.
              </p>
              <ul className="space-y-3 text-base font-medium flex-grow">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Certificate in Theology (Year 1)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Diploma in Theology (Year 2)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Bachelor in Theology (Year 3)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Preparing for Multiplication (Year 4)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Hands-on Ministry Experience
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Program Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
              <BookOpen size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Biblical Foundation
            </h3>
            <p className="text-gray-600">
              Rooted in Scripture with contextual application for
              Bengali-speaking communities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
              <Users size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Cultural Relevance
            </h3>
            <p className="text-gray-600">
              Designed specifically for the Bengali-speaking population and
              local contexts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
              <Presentation size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Practical Ministry
            </h3>
            <p className="text-gray-600">
              From day one, students engage in hands-on ministry and church
              planting.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <a
            href="/educational-programs"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
          >
            Explore All Programs
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AcademicProgram;
