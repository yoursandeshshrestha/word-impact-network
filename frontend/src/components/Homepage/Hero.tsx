import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const Hero: React.FC = () => {
  // Array of images from the Pictures directory - only 3 for main banner
  const heroImages = ["/Pictures/one.jpg", "/Pictures/ten.jpg"];

  return (
    <section className="relative h-[90vh] min-h-[600px]">
      {/* Swiper Slider */}
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        allowTouchMove={true}
        grabCursor={true}
        className="h-full"
      >
        {heroImages.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full">
              <Image
                src={image}
                alt={`Hero background ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="container mx-auto px-4">
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
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white rounded-full animate-bounce"></div>
        </div>
      </div>

      {/* Custom CSS for Swiper */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
          width: 12px !important;
          height: 12px !important;
          margin: 0 4px !important;
        }
        .swiper-pagination-bullet-active {
          background: white !important;
          transform: scale(1.25) !important;
        }
        .swiper-pagination {
          bottom: 80px !important;
        }
        .swiper-button-prev,
        .swiper-button-next {
          display: none !important;
        }
      `}</style>
    </section>
  );
};

export default Hero;
