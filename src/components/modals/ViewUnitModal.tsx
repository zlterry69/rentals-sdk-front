import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { 
  HomeModernIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Interface
interface Unit {
  id: string;
  public_id: string;
  title: string;
  address: string;
  district: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  monthly_rent: number;
  status: 'available' | 'occupied' | 'maintenance';
  tenant_name?: string;
  images: string[];
  rating: number;
  total_reviews: number;
}

interface ViewUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
}

const ViewUnitModal: React.FC<ViewUnitModalProps> = ({
  isOpen,
  onClose,
  unit
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  if (!unit) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return {
          icon: CheckCircleIcon,
          text: 'Disponible',
          color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
        };
      case 'occupied':
        return {
          icon: UserGroupIcon,
          text: 'Ocupado',
          color: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
        };
      case 'maintenance':
        return {
          icon: WrenchScrewdriverIcon,
          text: 'Mantenimiento',
          color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
        };
      default:
        return {
          icon: XCircleIcon,
          text: status,
          color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
        };
    }
  };

  const getPropertyTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      apartment: 'Departamento',
      house: 'Casa',
      studio: 'Estudio',
      room: 'Habitación'
    };
    return types[type] || type;
  };

  const statusInfo = getStatusInfo(unit.status);
  const StatusIcon = statusInfo.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === unit.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? unit.images.length - 1 : prev - 1
    );
  };

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Propiedad"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header con imagen y estado */}
        <div className="relative">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {unit.images && unit.images.length > 0 ? (
              <img 
                src={unit.images[0]} 
                alt={unit.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <HomeModernIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Estado overlay */}
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* Título y ubicación */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {unit.title}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPinIcon className="h-5 w-5 mr-2" />
            <span>{unit.address}, {unit.district}</span>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detalles de la propiedad */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
              Detalles de la Propiedad
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {getPropertyTypeText(unit.property_type)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Habitaciones</span>
                <span className="text-sm text-gray-900 dark:text-white">{unit.bedrooms}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Baños</span>
                <span className="text-sm text-gray-900 dark:text-white">{unit.bathrooms}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Área</span>
                <span className="text-sm text-gray-900 dark:text-white">{unit.area_sqm} m²</span>
              </div>
            </div>
          </div>

          {/* Información financiera y ocupación */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
              Información Financiera
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Alquiler Mensual</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(unit.monthly_rent)}
                  </p>
                </div>
              </div>

              {unit.tenant_name && (
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inquilino Actual</p>
                    <p className="text-sm text-gray-900 dark:text-white">{unit.tenant_name}</p>
                  </div>
                </div>
              )}

              {unit.rating > 0 && (
                <div className="flex items-center space-x-3">
                  <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Calificación</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {unit.rating.toFixed(1)} ⭐ ({unit.total_reviews} reseñas)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Galería de imágenes */}
        {unit.images && unit.images.length > 1 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
              Galería de Imágenes ({unit.images.length})
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {unit.images.slice(0, 8).map((image, index) => (
                <div 
                  key={index} 
                  className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => openImageViewer(index)}
                >
                  <img 
                    src={image} 
                    alt={`${unit.title} - Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {unit.images.length > 8 && (
                <div 
                  className="aspect-square bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  onClick={() => openImageViewer(8)}
                >
                  <div className="text-center">
                    <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{unit.images.length - 8} más
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del sistema */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Información del Sistema
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">ID Público</p>
              <p className="text-gray-900 dark:text-white font-mono">{unit.public_id}</p>
            </div>
            
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Precio por m²</p>
              <p className="text-gray-900 dark:text-white">
                {formatCurrency(unit.monthly_rent / unit.area_sqm)}/m²
              </p>
            </div>
          </div>
        </div>

        {/* Alertas según el estado */}
        {unit.status === 'maintenance' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-500 mr-2" />
              <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Propiedad en Mantenimiento
              </h5>
            </div>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              Esta propiedad está actualmente en mantenimiento y no está disponible para alquiler.
            </p>
          </div>
        )}

        {unit.status === 'available' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <h5 className="text-sm font-medium text-green-800 dark:text-green-300">
                Propiedad Disponible
              </h5>
            </div>
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
              Esta propiedad está disponible para alquiler inmediato.
            </p>
          </div>
        )}

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>

    {/* Modal del visor de imágenes - FUERA del modal principal */}
    {isImageViewerOpen && unit && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]"
        onClick={() => setIsImageViewerOpen(false)}
      >
        <div 
          className="relative max-w-4xl w-full mx-4 h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Botón anterior */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          {/* Botón siguiente */}
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Imagen actual */}
          <img
            src={unit.images[currentImageIndex]}
            alt={`${unit.title} - Imagen ${currentImageIndex + 1}`}
            className="w-full h-full object-contain rounded-lg"
          />

          {/* Contador de imágenes */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {unit.images.length}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ViewUnitModal;
