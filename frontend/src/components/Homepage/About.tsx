import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const About: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
          {/* Content Column */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
              Word Impact Network (WIN)
            </h2>

            <p className="text-gray-600 leading-relaxed text-lg">
              At Word Impact Network (WIN), we believe that true ministry begins
              with understanding—understanding the people we serve, their
              culture, their language, and their deepest needs. In a world
              marked by diversity, advancing the Kingdom of Christ calls for
              more than passion—it demands a thoughtful, contextual approach
              that connects with hearts at the deepest level.
            </p>

            <p className="text-gray-600 leading-relaxed text-lg">
              We focus especially on the Bengali-speaking population, seeking to
              share the Gospel in ways that are both authentic and
              transformational. Rather than using one-size-fits-all methods, we
              embrace culturally relevant strategies that speak directly into
              the lives, struggles, and dreams of the communities we reach.
            </p>

            <p className="text-gray-600 leading-relaxed text-lg">
              At WIN, we don&apos;t just deliver a message. We walk alongside
              people, honoring their story while pointing them to the story of
              Christ.
            </p>

            <div className="pt-6">
              <Link
                href="/about-win-impact-network"
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-md text-base font-semibold transition-colors shadow-sm"
              >
                Learn More
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Image Grid Column */}
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-48 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/Pictures/one.jpg"
                    alt="WIN ministry activities"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-32 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/Pictures/two.png"
                    alt="Community engagement"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-32 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/Pictures/three.png"
                    alt="Training and education"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-48 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/Pictures/four.png"
                    alt="WIN ministry and training"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
