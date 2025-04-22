import React from "react";
import { Quote, Star } from "lucide-react";
import Image from "next/image";

interface TestimonialItem {
  text: string;
  author: string;
  location: string;
  image: string;
}

interface TestimonialsProps {
  testimonials: TestimonialItem[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  return (
    <section id="testimonials" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-light mb-4 text-gray-900">
            Student Testimonials
          </h2>
          <p className="text-lg text-gray-600">
            Hear from our alumni about their transformative learning experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 transition-all duration-300 hover:shadow-sm"
            >
              <Quote className="h-6 w-6 mb-4 text-gray-400" />
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-8 italic">{testimonial.text}</p>
              <div className="flex items-center">
                <Image
                  src={testimonial.image || "/api/placeholder/40/40"}
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {testimonial.author}
                  </h4>
                  <p className="text-gray-500 text-sm">
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
