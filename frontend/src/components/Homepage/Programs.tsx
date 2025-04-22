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
    <section id="programs" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-light mb-4 text-gray-900">
            Academic Programs
          </h2>
          <p className="text-lg text-gray-600">
            Choose from our comprehensive range of educational programs designed
            to equip you for success.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Diploma in Technology */}
          <div className="bg-gray-50 rounded-lg p-8 transition-all duration-300 hover:shadow-sm">
            <BookOpen className="h-8 w-8 mb-5 text-gray-900" />
            <h3 className="text-xl font-medium mb-3 text-gray-900">
              Diploma in Technology
            </h3>
            <p className="text-gray-600 mb-6">
              Foundation program covering essential technical and practical
              studies.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-3 text-gray-500" />
                1-year program
              </li>
              <li className="flex items-center text-gray-600">
                <Globe className="h-4 w-4 mr-3 text-gray-500" />
                Online learning
              </li>
              <li className="flex items-center text-gray-600">
                <Target className="h-4 w-4 mr-3 text-gray-500" />
                Flexible schedule
              </li>
            </ul>
            <a
              href="#"
              className="text-black font-medium hover:text-gray-600 inline-flex items-center group"
            >
              Learn More{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Bachelor's Degree */}
          <div className="bg-gray-50 rounded-lg p-8 transition-all duration-300 hover:shadow-sm">
            <Award className="h-8 w-8 mb-5 text-gray-900" />
            <h3 className="text-xl font-medium mb-3 text-gray-900">
              Bachelor&apos;s Degree
            </h3>
            <p className="text-gray-600 mb-6">
              Comprehensive education with practical training and industry
              projects.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-3 text-gray-500" />
                3-year program
              </li>
              <li className="flex items-center text-gray-600">
                <Book className="h-4 w-4 mr-3 text-gray-500" />
                Advanced courses
              </li>
              <li className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-3 text-gray-500" />
                Mentorship included
              </li>
            </ul>
            <a
              href="#"
              className="text-black font-medium hover:text-gray-600 inline-flex items-center group"
            >
              Learn More{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Certificate Programs */}
          <div className="bg-gray-50 rounded-lg p-8 transition-all duration-300 hover:shadow-sm">
            <Globe className="h-8 w-8 mb-5 text-gray-900" />
            <h3 className="text-xl font-medium mb-3 text-gray-900">
              Certificate Programs
            </h3>
            <p className="text-gray-600 mb-6">
              Specialized training in specific areas of technology and
              leadership.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-3 text-gray-500" />
                6-month programs
              </li>
              <li className="flex items-center text-gray-600">
                <Target className="h-4 w-4 mr-3 text-gray-500" />
                Focused learning
              </li>
              <li className="flex items-center text-gray-600">
                <Book className="h-4 w-4 mr-3 text-gray-500" />
                Practical application
              </li>
            </ul>
            <a
              href="#"
              className="text-black font-medium hover:text-gray-600 inline-flex items-center group"
            >
              Learn More{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs;
