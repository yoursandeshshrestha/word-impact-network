import React from "react";
import { Heart, Users, BookOpen, Award, ArrowRight } from "lucide-react";

const Testimonials = () => {
  // WIN's core values and approach
  const values = [
    {
      title: "Contextual Ministry",
      description:
        "We believe in understanding the culture, language, and needs of Bengali-speaking communities to share the Gospel effectively.",
      icon: Heart,
      bgColor: "bg-[#2c3e50]",
    },
    {
      title: "Practical Training",
      description:
        "Our programs combine biblical knowledge with hands-on ministry experience, preparing students for real-world service.",
      icon: Users,
      bgColor: "bg-[#7a9e7e]",
    },
    {
      title: "Cultural Sensitivity",
      description:
        "We train leaders to minister with cultural awareness and respect, honoring local traditions while sharing Christ's love.",
      icon: BookOpen,
      bgColor: "bg-[#b7773a]",
    },
    {
      title: "Community Impact",
      description:
        "Our graduates are equipped to serve their communities through church planting, discipleship, and social ministry.",
      icon: Award,
      bgColor: "bg-[#2c3e50]",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            OUR APPROACH
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
            Ministry with Purpose
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg mt-4">
            At WIN, we focus on equipping leaders with the knowledge, skills,
            and heart to serve Bengali-speaking communities effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div
                key={index}
                className={`${value.bgColor} text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full`}
              >
                {/* Icon */}
                <div className="bg-white/10 p-4 rounded-full mb-6 w-fit">
                  <IconComponent size={48} className="text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 tracking-wide">
                  {value.title}
                </h3>

                {/* Description */}
                <div className="text-gray-100 text-lg leading-relaxed flex-grow">
                  {value.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 text-lg mb-6">
            Ready to be part of this ministry?
          </p>
          <a
            href="/auth/apply"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
          >
            Apply Now
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
