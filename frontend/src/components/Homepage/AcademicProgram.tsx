import React from "react";
import { BookOpen, Users, Presentation, Award } from "lucide-react";

const AcademicProgram: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-gray-800 tracking-wide">
            Academic Program
          </h2>
          <p className="text-gray-700 max-w-4xl mx-auto text-xl font-medium leading-relaxed">
            Word Impact Network (WIN) offers a comprehensive four-year
            educational program designed to equip Christian leaders with
            biblical knowledge and leadership skills for effective ministry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Year 1 Card */}
          <div className="bg-[#2c3e50] text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col items-center h-full">
              <div className="bg-white/10 p-4 rounded-full mb-6">
                <BookOpen size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-wide">Year 1</h3>
              <p className="text-center text-gray-200 mb-6 font-medium text-lg">
                Biblical Foundations
              </p>
              <ul className="space-y-3 text-base font-medium flex-grow">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Introduction to the Bible
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Systematic Theology I
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Christian Ethics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Spiritual Formation
                </li>
              </ul>
            </div>
          </div>

          {/* Year 2 Card */}
          <div className="bg-[#7a9e7e] text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col items-center h-full">
              <div className="bg-white/10 p-4 rounded-full mb-6">
                <Users size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-wide">Year 2</h3>
              <p className="text-center text-gray-200 mb-6 font-medium text-lg">
                Christian Leadership
              </p>
              <ul className="space-y-3 text-base font-medium flex-grow">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Church History
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Pastoral Ministry
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Leadership Principles
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Biblical Counseling
                </li>
              </ul>
            </div>
          </div>

          {/* Year 3 Card */}
          <div className="bg-[#b7773a] text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col items-center h-full">
              <div className="bg-white/10 p-4 rounded-full mb-6">
                <Presentation size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-wide">Year 3</h3>
              <p className="text-center text-gray-200 mb-6 font-medium text-lg">
                Ministry Development
              </p>
              <ul className="space-y-3 text-base font-medium flex-grow">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Homiletics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Mission and Evangelism
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Church Planting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Discipleship
                </li>
              </ul>
            </div>
          </div>

          {/* Year 4 Card */}
          <div className="bg-[#2c3e50] text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col items-center h-full">
              <div className="bg-white/10 p-4 rounded-full mb-6">
                <Award size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-wide">Year 4</h3>
              <p className="text-center text-gray-200 mb-6 font-medium text-lg">
                Practical Application
              </p>
              <ul className="space-y-3 text-base font-medium flex-grow">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Ministry Internship
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Capstone Project
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Advanced Leadership
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Cross-cultural Ministry
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcademicProgram;
