import React, { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PhotoCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
  isOwner?: boolean;
  isEditMode?: boolean;
  onImageEdit?: (index: number) => void;
  onImageDelete?: (index: number) => void;
  onImageUpload?: (file: File, index: number) => void;
}

export const PhotoCarouselModal: React.FC<PhotoCarouselModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title = 'Fotos de la propiedad',
  isOwner = false,
  isEditMode = false,
  onImageEdit,
  onImageDelete,
  onImageUpload
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            {/* Edit buttons - only show for owners in edit mode */}
            {isOwner && isEditMode && (
              <div className="flex gap-2">
                <button
                  onClick={() => onImageEdit?.(currentIndex)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                  title="Editar esta imagen"
                >
                  <PencilIcon className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
                      onImageDelete?.(currentIndex);
                      // If we're deleting the last image, go to previous
                      if (currentIndex >= images.length - 1 && images.length > 1) {
                        setCurrentIndex(Math.max(0, currentIndex - 1));
                      }
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                  title="Eliminar esta imagen"
                >
                  <TrashIcon className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main Image */}
        <div className="flex-1 flex items-center justify-center relative">
          <img
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Navigation Arrows - Always visible but disabled if only one image */}
          <button
            onClick={images.length > 1 ? prevImage : undefined}
            disabled={images.length <= 1}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
              images.length > 1 
                ? 'bg-black bg-opacity-50 text-white hover:bg-opacity-75 cursor-pointer' 
                : 'bg-black bg-opacity-30 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={images.length > 1 ? nextImage : undefined}
            disabled={images.length <= 1}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
              images.length > 1 
                ? 'bg-black bg-opacity-50 text-white hover:bg-opacity-75 cursor-pointer' 
                : 'bg-black bg-opacity-30 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="bg-black bg-opacity-50 p-4">
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white'
                      : 'border-transparent hover:border-gray-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute top-20 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default PhotoCarouselModal;
