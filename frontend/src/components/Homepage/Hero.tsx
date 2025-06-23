import React from "react";
import Image from "next/image";

import heroBg from "@/assets/graduation-cap-image.jpg";

const Hero: React.FC = () => {
  return (
    <section className="relative h-[90vh] min-h-[600px]">
      {/* Hero Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBg}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
            Word Impact Network
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-6 text-gray-200 font-light text-center">
            Spreading the fragrance of Christ with the scent of the local soil
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/educational-programs"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-md transition-colors hover:bg-gray-100"
            >
              Explore Programs
            </a>
            <a
              href="/about-win-impact-network"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-white font-medium rounded-md transition-colors hover:bg-white hover:text-gray-900"
            >
              Learn About WIN
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
