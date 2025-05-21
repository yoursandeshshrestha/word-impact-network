import React from "react";
import Image from "next/image";

import testimonial1 from "@/assets/graduation-cap-image.jpg";

const Testimonials = () => {
  // Testimonials data
  const testimonials = [
    {
      text: "Dummy text for testing, please ignore, real text will be added soon",
      name: "Ps. Amitabh Ghosh",
      location: "Kolkata, India",
      image: testimonial1,
      bgColor: "bg-[#2c3e50]",
    },
    {
      text: "Dummy text for testing, please ignore, real text will be added soon",

      name: "Ps. Sameeran Mondal",
      location: "Delhi, India",
      image: testimonial1,
      bgColor: "bg-[#7a9e7e]",
    },
    {
      text: "Dummy text for testing, please ignore, real text will be added soon",

      name: "Ps. Priya Das",
      location: "Mumbai, India",
      image: testimonial1,
      bgColor: "bg-[#b7773a]",
    },
    {
      text: "Dummy text for testing, please ignore, real text will be added soon",

      name: "Eld. Ranjan Chakraborty",
      location: "Chennai, India",
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
