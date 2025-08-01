import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ImageGallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const galleryImages = [
    "/Pictures/one.jpg",
    "/Pictures/two.png",
    "/Pictures/three.png",
    "/Pictures/four.png",
    "/Pictures/five.jpg",
    "/Pictures/six.jpg",
    "/Pictures/seven.jpg",
    "/Pictures/eight.jpg",
    "/Pictures/nine.png",
    "/Pictures/ten.jpg",
    "/Pictures/eleven.jpg",
    "/Pictures/thirteen.jpg",
  ];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const openGallery = (index: number) => {
    setSelectedImage(index);
    setIsOpen(true);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-6">
            Life at WIN
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Explore the vibrant community, learning environment, and ministry
            activities that make WIN a unique place for theological education.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
              onClick={() => openGallery(index)}
            >
              <Image
                src={image}
                alt={`WIN Gallery Image ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button
            onClick={() => openGallery(0)}
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            View Full Gallery
          </button>
        </div>

        {/* Dialog for Image Gallery */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 bg-black border-0">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-3"
              >
                <ChevronLeft size={32} />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-3"
              >
                <ChevronRight size={32} />
              </button>

              {/* Image */}
              <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center">
                <Image
                  src={galleryImages[selectedImage]}
                  alt={`WIN Gallery Image ${selectedImage + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
                <p className="text-sm bg-black/50 px-3 py-1 rounded-full">
                  {selectedImage + 1} of {galleryImages.length}
                </p>
              </div>

              {/* Pagination Dots */}
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === selectedImage
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ImageGallery;
