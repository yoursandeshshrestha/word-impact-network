"use client";

import React, { useEffect, useState } from "react";
import Hero from "@/components/Homepage/Hero";
import Stats from "@/components/Homepage/Stats";
import Testimonials from "@/components/Homepage/Testimonials";
import CTA from "@/components/Homepage/CTA";
import ScrollTop from "@/components/Homepage/ScrollTop";
import About from "@/components/Homepage/About";
import AcademicProgram from "@/components/Homepage/AcademicProgram";
import News from "@/components/Homepage/News";
import ImageGallery from "@/components/Homepage/ImageGallery";

const Index = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f0eee6]">
      <main>
        <Hero />
        <About />
        <AcademicProgram />
        <Stats />
        <ImageGallery />
        <News />
        <Testimonials />
        <CTA />
      </main>
      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </div>
  );
};

export default Index;
