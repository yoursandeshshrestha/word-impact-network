"use client";
import React, { useEffect, useState } from "react";
import { Video, Book, MessageSquare, Target } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Programs from "@/components/Programs";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollTop from "@/components/ScrollTop";
import Features from "@/components/Features";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const testimonials = [
    {
      text: "The program has transformed my understanding of leadership and technology. The flexible online learning platform made it possible for me to study while continuing my work.",
      author: "John Smith",
      location: "New York",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
    },
    {
      text: "The quality of education and mentorship I received here is unparalleled. The program equipped me with practical tools for effective work in our industry.",
      author: "Sarah Chen",
      location: "Singapore",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
    },
    {
      text: "This academy provides exactly what modern professionals need - a perfect blend of theoretical education and practical training.",
      author: "David Kumar",
      location: "India",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100",
    },
  ];

  const stats = [
    { number: "1000+", label: "Students Enrolled" },
    { number: "50+", label: "Countries Reached" },
    { number: "95%", label: "Completion Rate" },
    { number: "100+", label: "Expert Mentors" },
  ];

  const features = [
    {
      icon: <Video className="h-6 w-6" />,
      title: "Live Online Classes",
      description:
        "Interactive sessions with experienced instructors and real-time discussions.",
    },
    {
      icon: <Book className="h-6 w-6" />,
      title: "Digital Library",
      description: "Access to thousands of resources and study materials.",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Community Forums",
      description:
        "Engage with fellow students and share experiences in our online community.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Personalized Learning",
      description: "Customized study plans tailored to your career goals.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0eee6]">
      <Header />
      <main>
        <Hero isVisible={isVisible} />
        <Stats stats={stats} />
        <Features features={features} />
        <Programs />
        <Testimonials testimonials={testimonials} />
        <CTA />
      </main> 
      <Footer />
      <ScrollTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </div>
  );
};

export default Index;
