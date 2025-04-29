import React from "react";
import Image from "next/image";

import testimonial1 from "@/public/graduation-cap-image.jpg";

const Testimonials = () => {
  // Testimonials data
  const testimonials = [
    {
      text: "INBST has offered online learning since 2020. WIN will improve impact for Nepalese students across college. Based on my years with INBST, I'm confident it will serve as more helpful. Best wishes to the team.",
      name: "Ps. Yubraj Pradhan",
      location: "Banepa, Nepal",
      image: testimonial1,
      bgColor: "bg-[#2c3e50]",
    },
    {
      text: "As a Nepali pastor in the US, I'm excited for WIN. INBST training improved me, and now HDA will offer even better resources. Thank you, INBST, for following in Nepali Christian leaders!",
      name: "Ps. Subash Luhagun",
      location: "United States",
      image: testimonial1,
      bgColor: "bg-[#7a9e7e]",
    },
    {
      text: "My three years with INBST have been enriching, thanks to the dedicated teachers and curriculum. I truly believe the Word Impact Network (WIN) will further empower Nepali church leaders worldwide.",
      name: "Ps. Sona Chhetri",
      location: "Gangtok, India",
      image: testimonial1,
      bgColor: "bg-[#b7773a]",
    },
    {
      text: "I'm excited for the launch of the Word Impact Network (WIN) after seeing INBST's great work for Nepali-speaking church leaders. This program will empower and strengthen congregations.",
      name: "Eld. Krishna Sharma",
      location: "Kathmandu, Nepal",
      image: testimonial1,
      bgColor: "bg-[#2c3e50]",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-lg font-medium text-indigo-700 mb-2">
            COMMUNITY IMPACT
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
            What Our Community Says
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`${testimonial.bgColor} text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full`}
            >
              {/* Quote marks */}
              <div className="text-4xl opacity-50 mb-4 leading-none font-serif">
                &#8220;
              </div>

              {/* Testimonial text */}
              <div className="mb-6 text-gray-100 text-lg leading-relaxed flex-grow">
                {testimonial.text}
              </div>

              {/* Star rating */}
              <div className="flex mb-6 text-yellow-300">{"★".repeat(5)}</div>

              {/* Profile */}
              <div className="flex items-center mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-white/20">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-gray-200 text-sm">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
