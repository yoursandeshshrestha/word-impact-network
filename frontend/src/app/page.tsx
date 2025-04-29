"use client";
import React, { useEffect, useState } from "react";
import Header from "@/src/components/Homepage/Header";
import Hero from "@/src/components/Homepage/Hero";
import Stats from "@/src/components/Homepage/Stats";
import Testimonials from "@/src/components/Homepage/Testimonials";
import CTA from "@/src/components/Homepage/CTA";
import Footer from "@/src/components/Homepage/Footer";
import ScrollTop from "@/src/components/Homepage/ScrollTop";
import About from "@/src/components/Homepage/About";
import AcademicProgram from "../components/Homepage/AcademicProgram";
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
      <Header />
      <main>
        <Hero />
        <About />
        <AcademicProgram />
        <Stats />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </div>
  );
};

export default Index;
