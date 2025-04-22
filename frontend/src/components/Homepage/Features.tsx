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
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-light mb-4 text-gray-900">
            Why Choose Us
          </h2>
          <p className="text-lg text-gray-600">
            Experience world-class education with modern learning tools and
            expert guidance.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-8 transition-all duration-300 hover:shadow-sm"
            >
              <div className="mb-5 text-gray-900">{feature.icon}</div>
              <h3 className="text-lg font-medium mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
