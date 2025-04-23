import React from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  isVisible: boolean;
}

const Hero: React.FC<HeroProps> = ({ isVisible }) => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 h-[90vh] flex justify-center items-center bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Transform Your Future Through{" "}
              <span className="font-semibold">Excellence</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl">
              Join our innovative learning platform designed to equip the next
              generation of leaders with world-class education and practical
              skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-md text-base font-medium flex items-center justify-center group transition-all">
                Begin Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-gray-300 text-gray-800 hover:border-gray-500 px-8 py-3 rounded-md text-base font-medium transition-all">
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
            <div className="relative z-10">
              <Image
                src="/education-vector.svg"
                alt="Education illustration"
                className="w-full h-auto max-w-lg mx-auto"
                width={1000}
                height={1000}
              />
            </div>

            {/* Subtle gradient background */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 blur-3xl -z-10 opacity-70"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
