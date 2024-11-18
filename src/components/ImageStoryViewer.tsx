import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface Image {
  id: string;
  url: string;
  created_at: string;
}

interface ImageStoryViewerProps {
  images: Image[];
  currentIndex: number;
  onClose: () => void;
}

export default function ImageStoryViewer({ images, currentIndex, onClose }: ImageStoryViewerProps) {
  const [index, setIndex] = useState(currentIndex);
  const [touchStart, setTouchStart] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 30); // 3 seconds total duration

    return () => clearInterval(timer);
  }, [index]);

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
    if (index > 0) {
      setIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (index < images.length - 1) {
      setIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-0 left-0 right-0 z-10 p-2">
        <div className="flex space-x-1">
          {images.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-neutral-700 rounded-full overflow-hidden">
              {i === index && (
                <div 
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              )}
              {i < index && (
                <div className="h-full bg-white w-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
      >
        <X size={24} />
      </button>

      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={handlePrevious}
          className="absolute left-4 text-white hover:text-gray-300 z-10"
          disabled={index === 0}
        >
          <ChevronLeft size={36} />
        </button>

        <img
          src={images[index].url}
          alt=""
          className="max-h-[90vh] max-w-full object-contain"
        />

        <button
          onClick={handleNext}
          className="absolute right-4 text-white hover:text-gray-300 z-10"
          disabled={index === images.length - 1}
        >
          <ChevronRight size={36} />
        </button>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white z-10">
        <p className="text-sm opacity-75">
          {format(new Date(images[index].created_at), 'MMMM d, yyyy')}
        </p>
      </div>
    </div>
  );
}