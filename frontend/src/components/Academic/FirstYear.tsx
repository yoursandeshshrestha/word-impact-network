"use client";

import React from "react";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import ScrollTop from "@/src/components/Homepage/ScrollTop";

const FirstYear: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-purple-900 text-white py-20 mt-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Academic Program
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              et dignissim nisl. Pellentesque habitant morbi tristique.
            </p>
          </div>
        </section>

        {/* Program Overview */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-200 pb-4">
                Program Overview
              </h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec
                magna eget nunc consequat tristique. Donec ac felis porttitor,
                dictum nulla non, vehicula nisi. Vivamus lacinia feugiat velit.
              </p>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Proin a justo nec augue euismod laoreet. Integer non tellus nec
                sapien vulputate facilisis. Suspendisse potenti. Curabitur
                imperdiet elit et orci pretium, nec tincidunt ligula tempor.
              </p>
            </div>
          </div>
        </section>

        {/* Course Structure */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800">
                Course Structure
              </h2>
              <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {/* Module 1 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#2c3e50] p-4 text-white">
                  <h3 className="text-xl font-bold">Module 1</h3>
                  <p>Biblical Foundations</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2c3e50] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Lorem Ipsum Dolor</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2c3e50] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Sit Amet Consectetur</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2c3e50] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Adipiscing Elit</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2c3e50] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Sed Do Eiusmod</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Module 2 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#7a9e7e] p-4 text-white">
                  <h3 className="text-xl font-bold">Module 2</h3>
                  <p>Theological Studies</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#7a9e7e] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Ut Labore Et Dolore</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#7a9e7e] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Magna Aliqua</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#7a9e7e] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Exercitation Ullamco</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#7a9e7e] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Laboris Nisi Ut</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Module 3 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#b7773a] p-4 text-white">
                  <h3 className="text-xl font-bold">Module 3</h3>
                  <p>Spiritual Formation</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#b7773a] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Aliquip Ex Ea Commodo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#b7773a] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Consequat Duis Aute</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#b7773a] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Irure Dolor</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#b7773a] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>In Reprehenderit</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Module 4 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#2c3e50] p-4 text-white">
                  <h3 className="text-xl font-bold">Module 4</h3>
                  <p>Ministry Foundations</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2c3e50] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Voluptate Velit Esse</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2c3e50] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Cillum Dolore Eu</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2c3e50] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Fugiat Nulla Pariatur</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2c3e50] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Excepteur Sint Occaecat</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
              blandit, nulla a fermentum placerat, nisi sapien consequat libero,
              vel convallis tortor orci in ex.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apply"
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-md text-lg font-semibold transition-colors"
              >
                Apply Now
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </>
  );
};

export default FirstYear;
