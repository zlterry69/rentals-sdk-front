import React, { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiClient, API_ENDPOINTS } from '../app/api';
import { useAuth } from '../contexts/AuthContext';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string) => void;
  className?: string;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  className = ''
}) => {
  const { updateProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPEG, PNG y WebP');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('El archivo debe ser menor a 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formDataWithImage = new FormData();
      formDataWithImage.append('profile_image', file);

      const response = await apiClient.put('/auth/profile', formDataWithImage, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data;
      const image_url = updatedUser.profile_image;
      
      onImageUpdate(image_url);
      toast.success('Foto de perfil actualizada correctamente');
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      // Reset preview on error
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      // Update profile with empty image URL
      await updateProfile({ profile_image: '' });
      
      setPreviewUrl(null);
      onImageUpdate('');
      toast.success('Foto de perfil eliminada');
      
    } catch (error) {
      toast.error('Error al eliminar la imagen');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="relative group">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            
            {/* Remove button */}
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Eliminar foto"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
            
            {/* Upload overlay */}
            <div 
              onClick={openFileDialog}
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <PhotoIcon className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
        ) : (
          <div 
            onClick={openFileDialog}
            className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            ) : (
              <PhotoIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-2 text-center">
        Click para {previewUrl ? 'cambiar' : 'subir'} foto
      </p>
      <p className="text-xs text-gray-400 text-center">
        JPEG, PNG, WebP (máx. 5MB)
      </p>
    </div>
  );
};

export default ProfileImageUpload;
