import React from "react";
import { ArrowRight, Heart } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-[#f8f7f2] to-[#f0eee6] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070')] bg-cover bg-center"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300 rounded-full opacity-10 -z-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 rounded-full opacity-10 -z-10 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full text-blue-600 mb-8 mx-auto">
            <Heart className="h-10 w-10" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Join Our Mission to Educate & Empower
          </h2>

          <p className="text-lg md:text-xl text-gray-700 mb-12 mx-auto max-w-2xl">
            Take the first step towards free education that can transform lives
            and communities around the world.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-lg text-lg font-medium flex items-center justify-center group transition-colors">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="border-2 border-gray-800 text-gray-800 hover:bg-gray-100 px-8 py-5 rounded-lg text-lg font-medium transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
