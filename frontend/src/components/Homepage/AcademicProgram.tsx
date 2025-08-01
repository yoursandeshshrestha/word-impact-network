import React from "react";
import {
  BookOpen,
  Users,
  Presentation,
  GraduationCap,
  ArrowRight,
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Certificate in Theology - First Year */}
          <div className="bg-[#2c3e50] text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col h-full text-center">
              <div className="bg-white/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-xl font-bold text-white mb-2">
                Certificate in Theology
              </div>
              <div className="text-gray-200 font-medium">First Year</div>
            </div>
          </div>

          {/* Diploma in Theology - Second Year */}
          <div className="bg-[#7a9e7e] text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col h-full text-center">
              <div className="bg-white/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-xl font-bold text-white mb-2">
                Diploma in Theology
              </div>
              <div className="text-gray-200 font-medium">Second Year</div>
            </div>
          </div>

          {/* Bachelor in Theology - Third Year */}
          <div className="bg-[#b7773a] text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col h-full text-center">
              <div className="bg-white/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Presentation className="w-8 h-8 text-white" />
              </div>
              <div className="text-xl font-bold text-white mb-2">
                Bachelor in Theology
              </div>
              <div className="text-gray-200 font-medium">Third Year</div>
            </div>
          </div>

          {/* Bachelor in Ministry - Fourth Year */}
          <div className="bg-[#2c3e50] text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col h-full text-center">
              <div className="bg-white/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="text-xl font-bold text-white mb-2">
                Bachelor in Ministry
              </div>
              <div className="text-gray-200 font-medium">Fourth Year</div>
            </div>
          </div>
        </div>

        {/* Program Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default AcademicProgram;
