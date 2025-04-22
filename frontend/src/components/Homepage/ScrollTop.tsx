import React from "react";
import { ChevronUp } from "lucide-react";

interface ScrollTopProps {
  showScrollTop: boolean;
  scrollToTop: () => void;
}

const ScrollTop: React.FC<ScrollTopProps> = ({
  showScrollTop,
  scrollToTop,
}) => {
  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-5 right-5 bg-white shadow-lg shadow-black/10 text-black w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 z-50"
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollTop;
