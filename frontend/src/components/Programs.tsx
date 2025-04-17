import React from "react";
import {
  ArrowRight,
  BookOpen,
  Award,
  Globe,
  Clock,
  Book,
  Users,
  Target,
} from "lucide-react";

const Programs = () => {
  return (
    <section
      id="programs"
      className="py-24 bg-gradient-to-b from-[#f8f7f2] to-[#f0eee6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Academic Programs
          </h2>
          <p className="text-lg text-gray-700">
            Choose from our comprehensive range of educational programs designed
            to equip you for success.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Diploma in Technology */}
          <div className="bg-white rounded-lg p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-lg text-blue-600">
                <BookOpen className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Diploma in Technology
            </h3>
            <p className="text-gray-700 mb-5">
              Foundation program covering essential technical and practical
              studies.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                  <Clock className="h-4 w-4 text-gray-600" />
                </span>
                1-year program
              </li>
              <li className="flex items-center text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                  <Globe className="h-4 w-4 text-gray-600" />
                </span>
                Online learning
              </li>
              <li className="flex items-center text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                  <Target className="h-4 w-4 text-gray-600" />
                </span>
                Flexible schedule
              </li>
            </ul>
            <a
              href="#"
              className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center group"
            >
              Learn More{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 opacity-30 rounded"></div>
          </div>

          {/* Bachelor's Degree */}
          <div className="bg-white rounded-lg p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-lg text-blue-600">
                <Award className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Bachelor's Degree
            </h3>
            <p className="text-gray-700 mb-5">
              Comprehensive education with practical training and industry
              projects.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                  <Clock className="h-4 w-4 text-gray-600" />
                </span>
                3-year program
              </li>
              <li className="flex items-center text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                  <Book className="h-4 w-4 text-gray-600" />
                </span>
                Advanced courses
              </li>
              <li className="flex items-center text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                  <Users className="h-4 w-4 text-gray-600" />
                </span>
                Mentorship included
              </li>
            </ul>
            <a
              href="#"
              className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center group"
            >
              Learn More{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 opacity-30 rounded"></div>
          </div>

          {/* Certificate Programs */}
          <div className="bg-white rounded-lg p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-lg text-blue-600">
                <Globe className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Certificate Programs
            </h3>
            <p className="text-gray-700 mb-5">
              Specialized training in specific areas of technology and
              leadership.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                  <Clock className="h-4 w-4 text-gray-600" />
                </span>
                6-month programs
              </li>
              <li className="flex items-center text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                  <Target className="h-4 w-4 text-gray-600" />
                </span>
                Focused learning
              </li>
              <li className="flex items-center text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                  <Book className="h-4 w-4 text-gray-600" />
                </span>
                Practical application
              </li>
            </ul>
            <a
              href="#"
              className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center group"
            >
              Learn More{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 opacity-30 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs;
