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
            World Impact Network
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-200 leading-relaxed">
            Equipping Bengali speaking Christian leaders for the great
            commission through quality education and spiritual formation.
          </p>
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
