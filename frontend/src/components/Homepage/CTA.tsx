import React from "react";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070')] bg-cover bg-center"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-900">
            Join Our Mission to Educate & Empower
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Take the first step towards free education that can transform lives
            and communities around the world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-md text-base font-medium flex items-center justify-center mx-auto sm:mx-0 group transition-all">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
