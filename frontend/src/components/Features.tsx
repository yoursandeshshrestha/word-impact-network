import React from "react";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesProps {
  features: FeatureItem[];
}

const Features: React.FC<FeaturesProps> = ({ features }) => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#f0eee6] to-[#f8f7f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Why Choose Us
          </h2>
          <p className="text-lg text-gray-700">
            Experience world-class education with modern learning tools and
            expert guidance.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative"
            >
              <div className="mb-6 text-blue-600">
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-700">{feature.description}</p>

              {/* Subtle accent that matches hero's blue accent and stats */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 opacity-30 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
