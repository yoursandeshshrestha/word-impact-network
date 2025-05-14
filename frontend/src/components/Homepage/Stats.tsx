import React from "react";
import { Award, GraduationCap, Globe, Handshake, BookOpen } from "lucide-react";

const Stats = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            OUR MILESTONE
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
            Trained Pastors & Leaders Globally
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="stat-item text-center p-6 rounded-xl   transition-colors duration-300">
            <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              0<span className="text-gray-500">+</span>
            </div>
            <div className="text-gray-600 mt-2 font-medium">
              Certificate Distributed
            </div>
          </div>

          <div className="stat-item text-center p-6 rounded-xl   transition-colors duration-300">
            <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              0<span className="text-gray-500">+</span>
            </div>
            <div className="text-gray-600 mt-2 font-medium">
              Total Graduates
            </div>
          </div>

          <div className="stat-item text-center p-6 rounded-xl   transition-colors duration-300">
            <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Globe className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              0<span className="text-gray-500">+</span>
            </div>
            <div className="text-gray-600 mt-2 font-medium">
              Countries & Territories
            </div>
          </div>

          <div className="stat-item text-center p-6 rounded-xl   transition-colors duration-300">
            <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Handshake className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              0<span className="text-gray-500">+</span>
            </div>
            <div className="text-gray-600 mt-2 font-medium">
              Partnership with local Churches
            </div>
          </div>

          <div className="stat-item text-center p-6 rounded-xl   transition-colors duration-300">
            <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              0<span className="text-gray-500">+</span>
            </div>
            <div className="text-gray-600 mt-2 font-medium">Courses Taught</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
