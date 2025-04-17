import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  isVisible: boolean;
}

const Hero: React.FC<HeroProps> = ({ isVisible }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <section className="pt-32 pb-32 md:py-40 bg-gradient-to-b from-[#f0eee6] to-[#f8f7f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8 leading-tight">
              Transform Your Future Through{" "}
              <span className="text-black relative inline-block">
                Excellence
                <span className="absolute -bottom-2 left-0 w-full h-2 bg-blue-500 opacity-30 rounded"></span>
              </span>
            </h1>
            <p className="text-lg text-gray-700 max-w-xl mb-10">
              Join our innovative learning platform designed to equip the next
              generation of leaders with world-class education and practical
              skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium flex items-center justify-center group transition-colors">
                Begin Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-gray-800 text-gray-800 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-medium transition-colors">
                Explore Programs
              </button>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="relative z-10 p-4">
              <img
                src="/education-vector.svg"
                alt="Education illustration"
                className="w-full h-auto max-w-lg mx-auto transform hover:scale-105 transition-transform duration-500"
                onLoad={() => setIsImageLoaded(true)}
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-300 rounded-full opacity-20 -z-10 blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-400 rounded-full opacity-20 -z-10 blur-xl"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-300 rounded-full opacity-10 -z-10 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
