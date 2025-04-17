import React from "react";
import { Quote, Star } from "lucide-react";

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
    <section
      id="testimonials"
      className="py-24 bg-gradient-to-b from-[#f0eee6] to-[#f8f7f2]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Student Testimonials
          </h2>
          <p className="text-lg text-gray-700">
            Hear from our alumni about their transformative learning experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative"
            >
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-lg text-blue-600 mb-6">
                <Quote className="h-6 w-6" />
              </div>

              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-amber-500 fill-amber-500"
                  />
                ))}
              </div>

              <p className="text-gray-700 mb-8">{testimonial.text}</p>

              <div className="flex items-center">
                <img
                  src={testimonial.image || "/api/placeholder/40/40"}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full mr-4 border-2 border-gray-100"
                />
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">
                    {testimonial.author}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {testimonial.location}
                  </p>
                </div>
              </div>

              {/* Accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 opacity-30 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
