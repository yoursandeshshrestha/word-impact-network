import React from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

const CTA = () => {
  return (
    <section className="cta bg-gradient-to-r from-gray-800 to-gray-700 py-16 md:py-24 text-white relative overflow-hidden">
      {/* Background pattern - subtle diagonal lines */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "10px 10px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto">
          <div className="text-center md:text-left mb-8 md:mb-0 md:mr-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the Mission
            </h2>
            <p className="text-lg md:text-xl text-gray-200 max-w-xl mb-6">
              Be part of spreading the fragrance of Christ among
              Bengali-speaking communities. Whether you&apos;re called to study,
              serve, or support, there&apos;s a place for you in this ministry.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link
                href="/auth/apply"
                className="inline-flex items-center bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Apply for Training
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/support-win"
                className="inline-flex items-center bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-3 px-6 rounded-full transition-all duration-300"
              >
                Support the Mission
                <Heart className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="hidden md:block bg-white/20 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Bengali-Speaking</div>
              <p className="text-gray-200">Community Focus</p>
            </div>

            <div className="h-px bg-white/30 my-4"></div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Contextual</div>
              <p className="text-gray-200">Ministry Training</p>
            </div>

            <div className="h-px bg-white/30 my-4"></div>

            <div className="text-sm italic text-center">
              &quot;Spreading the fragrance of Christ with the scent of the
              local soil&quot;
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
