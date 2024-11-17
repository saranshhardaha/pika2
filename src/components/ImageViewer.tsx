import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  name: string;
  avatar_url: string;
}

interface Image {
  id: string;
  url: string;
  location: string;
  created_at: string;
  profiles: User | null;
}

interface ImageViewerProps {
  images: Image[];
  currentIndex: number;
  onClose: () => void;
}

export default function ImageViewer({ images, currentIndex, onClose }: ImageViewerProps) {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  const handlePrevious = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[index];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <X size={24} />
      </button>

      <button
        onClick={handlePrevious}
        className="absolute left-4 text-white hover:text-gray-300"
      >
        <ChevronLeft size={36} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 text-white hover:text-gray-300"
      >
        <ChevronRight size={36} />
      </button>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <img
          src={currentImage.url}
          alt=""
          className="max-h-[90vh] max-w-full object-contain"
        />
        
        <div className="absolute bottom-4 left-0 right-0 text-center text-white">
          <p className="text-sm">
            {index + 1} / {images.length}
          </p>
          <p className="mt-2 text-sm opacity-75">
            {currentImage.location} - {currentImage.profiles?.name || 'Anonymous'}
          </p>
        </div>
      </div>
    </div>
  );
}