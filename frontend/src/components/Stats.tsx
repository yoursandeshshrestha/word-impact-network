import React from "react";

interface StatItem {
  number: string;
  label: string;
}

interface StatsProps {
  stats: StatItem[];
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <section className="py-16 bg-gradient-to-b from-[#f8f7f2] to-[#f0eee6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Subtle accent that matches hero's blue accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 opacity-30 rounded"></div>

              <h3 className="text-4xl font-bold text-gray-800 mb-3">
                {stat.number}
              </h3>
              <p className="text-gray-700">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
