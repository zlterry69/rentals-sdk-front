import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '@/app/api';
import toast from 'react-hot-toast';
import Map from '@/components/Map';

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  monthly_rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  amenities: string[];
  available_from: string;
  latitude?: number;
  longitude?: number;
}


const UNIT_TYPES = [
  { value: 'apartment', label: 'Departamento' },
  { value: 'house', label: 'Casa' },
  { value: 'studio', label: 'Estudio' },
  { value: 'room', label: 'Habitación' },
  { value: 'office', label: 'Oficina' }
];

const AMENITIES_OPTIONS = [
  'WiFi gratuito', 'Aire acondicionado', 'Calefacción', 'Cocina equipada',
  'Lavadora', 'Secadora', 'Estacionamiento', 'Piscina', 'Gimnasio',
  'Terraza', 'Balcón', 'Jardín', 'Ascensor', 'Seguridad 24h',
  'Mascotas permitidas', 'Amoblado', 'TV Cable', 'Internet fibra óptica'
];

export const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    address: '',
    monthly_rent: 0,
    deposit: 0,
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 50,
    property_type: 'apartment',
    amenities: [],
    available_from: new Date().toISOString().split('T')[0]
  });

  // Estados para el mapa
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -12.0464, lng: -77.0428 });
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Estados para métodos de pago
  const [paymentMethods, setPaymentMethods] = useState({
    accepts_yape: false,
    accepts_plin: false,
    accepts_bitcoin: false,
    accepts_ethereum: false,
    accepts_usdt: false,
    accepts_bank_transfer: false,
    accepts_mercadopago: false,
    accepts_izipay: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('rent') || name.includes('deposit') || name.includes('bedrooms') || 
              name.includes('bathrooms') || name.includes('area_sqm') 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      address: location.address,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: !prev[method as keyof typeof prev]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones básicas
      if (!formData.title.trim()) {
        toast.error('El título es requerido');
        return;
      }
      if (!formData.address.trim()) {
        toast.error('La dirección es requerida');
        return;
      }
      if (formData.monthly_rent <= 0) {
        toast.error('El precio de alquiler debe ser mayor a 0');
        return;
      }

      // Preparar datos para enviar
      const propertyData = {
        ...formData,
        deposit: formData.deposit || formData.monthly_rent * 2, // Default: 2 meses de depósito
        status: 'available'
      };

      const response = await api.post('/units', propertyData);

      if (response.data) {
        // Crear métodos de pago si hay alguno seleccionado
        const hasPaymentMethods = Object.values(paymentMethods).some(value => value);
        if (hasPaymentMethods) {
          try {
            await api.put('/payment-accounts/', paymentMethods);
          } catch (paymentError) {
            console.error('Error creating payment methods:', paymentError);
            // No mostramos error al usuario porque la propiedad ya se creó
          }
        }

        toast.success('Propiedad creada exitosamente');
        onSuccess();
        onClose();
        
        // Redirigir a la vista de edición de la propiedad recién creada
        navigate(`/properties/${response.data.public_id}?edit=true`);
        
        // Resetear formulario
        setFormData({
          title: '',
          description: '',
          address: '',
          monthly_rent: 0,
          deposit: 0,
          bedrooms: 1,
          bathrooms: 1,
          area_sqm: 50,
          property_type: 'apartment',
          amenities: [],
          available_from: new Date().toISOString().split('T')[0]
        });
        
        // Resetear métodos de pago
        setPaymentMethods({
          accepts_yape: false,
          accepts_plin: false,
          accepts_bitcoin: false,
          accepts_ethereum: false,
          accepts_usdt: false,
          accepts_bank_transfer: false,
          accepts_mercadopago: false,
          accepts_izipay: false
        });
      }
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast.error(error.response?.data?.detail || 'Error al crear la propiedad');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Nueva Propiedad</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la propiedad *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Departamento moderno en Miraflores"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe tu propiedad..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Selecciona una ubicación en el mapa"
                  readOnly
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación en el Mapa *
                </label>
                <div className="h-64 w-full rounded-lg border-2 border-gray-300">
                  <Map
                    center={mapCenter}
                    onLocationSelect={handleLocationSelect}
                    isEditable={true}
                    className="h-full w-full"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Arrastra el marcador rojo para seleccionar la ubicación exacta
                </p>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de propiedad
                </label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {UNIT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponible desde
                </label>
                <input
                  type="date"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Detalles de la propiedad */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habitaciones
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Baños
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área (m²)
                </label>
                <input
                  type="number"
                  name="area_sqm"
                  value={formData.area_sqm}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por noche (S/)
                </label>
                <input
                  type="number"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Métodos de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Métodos de pago
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.accepts_yape}
                    onChange={() => handlePaymentMethodToggle('accepts_yape')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Yape</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.accepts_plin}
                    onChange={() => handlePaymentMethodToggle('accepts_plin')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Plin</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.accepts_mercadopago}
                    onChange={() => handlePaymentMethodToggle('accepts_mercadopago')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">MercadoPago</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.accepts_izipay}
                    onChange={() => handlePaymentMethodToggle('accepts_izipay')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Izipay</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.accepts_bank_transfer}
                    onChange={() => handlePaymentMethodToggle('accepts_bank_transfer')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Transferencia</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.accepts_bitcoin}
                    onChange={() => handlePaymentMethodToggle('accepts_bitcoin')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Bitcoin</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.accepts_ethereum}
                    onChange={() => handlePaymentMethodToggle('accepts_ethereum')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Ethereum</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.accepts_usdt}
                    onChange={() => handlePaymentMethodToggle('accepts_usdt')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">USDT</span>
                </label>
              </div>
            </div>

            {/* Comodidades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Comodidades
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AMENITIES_OPTIONS.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>


            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creando...' : 'Crear Propiedad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
