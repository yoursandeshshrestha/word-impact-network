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
              Be A Mission Partner
            </h2>
            <p className="text-lg md:text-xl text-purple-100 max-w-xl mb-6">
              Join us in empowering pastors and church leaders across the
              Himalayan region. Your partnership makes a lasting difference in
              communities worldwide.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center bg-white text-purple-900 hover:bg-purple-100 font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Contact WIN
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="hidden md:block bg-white/20 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">230+</div>
              <p className="text-purple-100">Partners globally</p>
            </div>

            <div className="h-px bg-white/30 my-4"></div>

            <div className="text-sm italic">
              "Alone we can do so little, together we can do so much."
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
