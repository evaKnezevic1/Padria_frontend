'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export default function ImageGallery({ images, title = 'Property' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbnailOffset, setThumbnailOffset] = useState(0);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const VISIBLE_THUMBNAILS = 4;
  const hasMultipleImages = images.length > 1;
  const canScrollLeft = thumbnailOffset > 0;
  const canScrollRight = thumbnailOffset < images.length - VISIBLE_THUMBNAILS;

  // Navigate to previous image
  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // Navigate to next image
  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Scroll thumbnails left
  const scrollThumbnailsLeft = () => {
    setThumbnailOffset((prev) => Math.max(0, prev - 1));
  };

  // Scroll thumbnails right
  const scrollThumbnailsRight = () => {
    setThumbnailOffset((prev) => Math.min(images.length - VISIBLE_THUMBNAILS, prev + 1));
  };

  // Select thumbnail and adjust scroll position if needed
  const selectImage = (index: number) => {
    setSelectedIndex(index);
    
    // Auto-scroll thumbnails to keep selected visible
    if (index < thumbnailOffset) {
      setThumbnailOffset(index);
    } else if (index >= thumbnailOffset + VISIBLE_THUMBNAILS) {
      setThumbnailOffset(index - VISIBLE_THUMBNAILS + 1);
    }
  };

  // Open modal
  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal, goToPrevious, goToNext]);

  // Clean up body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (images.length === 0) {
    return (
      <div className="overflow-hidden">
        <div className="relative bg-gray-200 h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <span className="text-gray-500">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden">
        {/* Main Image */}
        <div 
          className="relative bg-gray-200 h-64 sm:h-80 md:h-96 cursor-pointer group"
          onClick={openModal}
        >
          <img
            src={images[selectedIndex]}
            alt={`${title} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300"
          />
          
          {/* Overlay hint on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-lg font-medium transition-opacity duration-300">
              Click to enlarge
            </span>
          </div>

          {/* Image counter badge */}
          {hasMultipleImages && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}

          {/* Main image navigation arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 sm:p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 sm:p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {hasMultipleImages && (
          <div className="p-3 sm:p-4 bg-[#c4b8a3] border-t-2 border-[#9e784a]">
            <div className="flex items-center gap-2">
              {/* Left scroll button */}
              {images.length > VISIBLE_THUMBNAILS && (
                <button
                  onClick={scrollThumbnailsLeft}
                  disabled={!canScrollLeft}
                  className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                    canScrollLeft 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Scroll thumbnails left"
                >
                  <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Thumbnails container */}
              <div 
                ref={thumbnailContainerRef}
                className="flex-1 overflow-hidden"
              >
                <div 
                  className="flex gap-2 sm:gap-3 transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateX(-${thumbnailOffset * (100 / VISIBLE_THUMBNAILS)}%)`,
                  }}
                >
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => selectImage(index)}
                      className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedIndex === index 
                          ? 'ring-2 ring-orange-500 ring-offset-2 scale-105' 
                          : 'ring-1 ring-gray-200 hover:ring-orange-300 hover:scale-102'
                      }`}
                      style={{ width: `calc((100% - ${(VISIBLE_THUMBNAILS - 1) * 8}px) / ${VISIBLE_THUMBNAILS})` }}
                      aria-label={`View image ${index + 1}`}
                    >
                      <div className="aspect-square">
                        <img
                          src={image}
                          alt={`${title} thumbnail ${index + 1}`}
                          className={`w-full h-full object-cover transition-opacity duration-200 ${
                            selectedIndex === index ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right scroll button */}
              {images.length > VISIBLE_THUMBNAILS && (
                <button
                  onClick={scrollThumbnailsRight}
                  disabled={!canScrollRight}
                  className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                    canScrollRight 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Scroll thumbnails right"
                >
                  <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={closeModal}
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-orange-400 p-2 transition-colors duration-200 z-10"
            aria-label="Close modal"
          >
            <FaTimes className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white text-lg sm:text-xl font-medium">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Navigation arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-10 hover:bg-opacity-30 text-white p-3 sm:p-4 rounded-full transition-all duration-200"
                aria-label="Previous image"
              >
                <FaChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-10 hover:bg-opacity-30 text-white p-3 sm:p-4 rounded-full transition-all duration-200"
                aria-label="Next image"
              >
                <FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Modal image */}
          <div 
            className="max-w-[90vw] max-h-[85vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex]}
              alt={`${title} - Image ${selectedIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Thumbnail strip in modal */}
          {hasMultipleImages && (
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black bg-opacity-50 rounded-lg max-w-[90vw] overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden transition-all duration-200 ${
                    selectedIndex === index 
                      ? 'ring-2 ring-orange-500 opacity-100' 
                      : 'opacity-50 hover:opacity-100'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
