import React from "react";
import Link from "next/link";
import Image from "next/image";
import aboutImg from "@/assets/graduation-image-two.jpg";

const About: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
          {/* Content Column */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
              Word Impact Network
            </h2>

            <p className="text-gray-600 leading-relaxed text-lg">
              WIN (Word Impact Network) is a transformative educational
              initiative dedicated to making higher education accessible and
              affordable for underserved communities. Through a wide range of
              four-year courses, WIN equips individuals with the knowledge,
              skills, and spiritual foundation needed to thrive in life,
              leadership, and ministry.
            </p>

            <p className="text-gray-600 leading-relaxed text-lg">
              Committed to eliminating financial barriers, WIN offers education
              either completely free or at a significantly reduced cost. The
              curriculum is rooted in practical application and biblical
              principles, designed especially for those pursuing personal
              growth, social impact, and Christian service.
            </p>

            <div className="pt-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-md text-base font-semibold transition-colors shadow-sm"
              >
                Learn More
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Image Column */}
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <Image
              src={aboutImg}
              alt="Graduation ceremony"
              width={600}
              height={600}
              className="w-full h-[600px] rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
