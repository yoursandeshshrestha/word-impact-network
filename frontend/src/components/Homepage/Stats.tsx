import React from "react";
import {
  GraduationCap,
  Heart,
  BookOpen,
  Users,
} from "lucide-react";

const Stats = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            OUR MISSION
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
            Spreading the Fragrance of Christ
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg mt-4">
            Through contextual ministry and dedicated training, we&apos;re
            reaching Bengali-speaking communities across West Bengal and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="stat-item text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
            <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">Quality</div>
            <div className="text-gray-600 mt-2 font-medium">
              Theological Education
            </div>
          </div>

          <div className="stat-item text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
            <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">Contextual</div>
            <div className="text-gray-600 mt-2 font-medium">
              Ministry Training
            </div>
          </div>

          <div className="stat-item text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
            <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">Practical</div>
            <div className="text-gray-600 mt-2 font-medium">
              Hands-on Experience
            </div>
          </div>

          <div className="stat-item text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
            <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">Biblical</div>
            <div className="text-gray-600 mt-2 font-medium">Foundation</div>
          </div>
        </div>

        {/* Additional Impact Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              Bengali-Speaking Focus
            </h4>
            <p className="text-gray-600">
              Dedicated to reaching the Bengali-speaking population with
              culturally relevant ministry.
            </p>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              Contextual Training
            </h4>
            <p className="text-gray-600">
              Programs designed specifically for rural and urban ministry
              contexts in West Bengal.
            </p>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              Hands-on Ministry
            </h4>
            <p className="text-gray-600">
              Students engage in practical ministry from day one, not just after
              graduation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
