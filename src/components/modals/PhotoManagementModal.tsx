import React, { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon, PencilIcon, PlusIcon, CheckIcon, StarIcon } from '@heroicons/react/24/outline';

interface PhotoManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  onImageDelete: (index: number) => void;
  onImageUpload: (file: File, index: number) => void;
  onImageReorder?: (fromIndex: number, toIndex: number) => void;
  onImageReplace?: (file: File, index: number) => void;
  onSetCoverImage?: (index: number) => void;
  coverImageIndex?: number;
  title?: string;
}

export const PhotoManagementModal: React.FC<PhotoManagementModalProps> = ({
  isOpen,
  onClose,
  images,
  onImageDelete,
  onImageUpload,
  onImageReorder,
  onImageReplace,
  onSetCoverImage,
  coverImageIndex = 0,
  title = 'Gestionar Fotos'
}) => {
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 8;

  // Reset page when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Reset page when images change (e.g., after reordering)
  useEffect(() => {
    if (isOpen && currentPage > 1) {
      const newTotalPages = Math.ceil((images.length + 1) / imagesPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    }
  }, [images.length, isOpen, currentPage, imagesPerPage]);

  if (!isOpen) return null;

  // Pagination logic
  const totalPages = Math.ceil((images.length + 1) / imagesPerPage); // +1 for add button
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = images.slice(startIndex, endIndex);
  const hasAddButton = images.length < 20; // Max 20 images
  const showAddButtonOnThisPage = hasAddButton && currentPage === totalPages;

  const handleImageSelect = (index: number) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    if (selectedImages.size === 0) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedImages.size} foto(s)?`)) {
      // Delete in reverse order to maintain indices
      const sortedIndices = Array.from(selectedImages).sort((a, b) => b - a);
      sortedIndices.forEach(index => onImageDelete(index));
      setSelectedImages(new Set());
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setIsDragging(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (isDragging !== null && isDragging !== targetIndex && onImageReorder) {
      onImageReorder(isDragging, targetIndex);
    }
    setIsDragging(null);
    setDragOverIndex(null);
  };

  // File upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (images[index]) {
        // Replace existing image
        onImageReplace?.(file, index);
      } else {
        // Upload new image
        onImageUpload(file, index);
      }
    }
  };

  const handleSetCoverImage = (index: number) => {
    if (onSetCoverImage) {
      onSetCoverImage(index);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            {selectedImages.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                Eliminar ({selectedImages.size})
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border-b">
          <p className="text-sm text-blue-800">
            💡 <strong>Consejos:</strong> Arrastra las fotos para reordenar y elegir la portada, 
            haz clic en las fotos para seleccionarlas, o haz clic en el botón + para agregar nuevas fotos.
          </p>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((image, index) => {
              const actualIndex = startIndex + index;
              return (
              <div
                key={actualIndex}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImages.has(actualIndex)
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isDragging === actualIndex ? 'opacity-50' : ''} ${
                  dragOverIndex === actualIndex ? 'border-green-500 ring-2 ring-green-200' : ''
                } ${actualIndex === coverImageIndex ? 'ring-4 ring-yellow-400 border-yellow-500' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, actualIndex)}
                onDragOver={(e) => handleDragOver(e, actualIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, actualIndex)}
                onClick={() => handleImageSelect(actualIndex)}
              >
                <img
                  src={image}
                  alt={`Foto ${actualIndex + 1}`}
                  className="w-full h-32 object-cover"
                />
                
                {/* Selection indicator */}
                {selectedImages.has(actualIndex) && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <CheckIcon className="h-4 w-4" />
                  </div>
                )}

                {/* Image number */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {actualIndex + 1}
                </div>

                {/* Cover image indicator */}
                {actualIndex === coverImageIndex && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <StarIcon className="h-4 w-4" />
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetCoverImage(actualIndex);
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-full transition-colors"
                      title="Establecer como portada"
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageDelete(actualIndex);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                      title="Eliminar esta foto"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <label className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors cursor-pointer">
                      <PencilIcon className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, actualIndex)}
                      />
                    </label>
                  </div>
                </div>
              </div>
              );
            })}

            {/* Add new photo slots - only show on last page */}
            {showAddButtonOnThisPage && Array.from({ length: Math.min(imagesPerPage - currentImages.length, 20 - images.length) }, (_, index) => {
              const slotIndex = images.length + index;
              return (
                <div
                  key={`add-${slotIndex}`}
                  className="relative group border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                    <PlusIcon className="h-8 w-8 text-gray-400 group-hover:text-gray-600" />
                    <span className="text-sm text-gray-500 mt-2">Agregar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(e, slotIndex);
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {images.length} foto(s) • {selectedImages.size} seleccionada(s)
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoManagementModal;
