import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { apiClient } from '@/app/api';
import toast from 'react-hot-toast';
import Map from '@/components/Map';

// Interfaces
interface Unit {
  id: string;
  public_id: string;
  title: string;
  address: string;
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
  latitude?: number;
  longitude?: number;
}

interface EditUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
  onUpdate: (updatedUnit: Unit) => void;
}

// Validation schema
const unitSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  property_type: z.enum(['apartment', 'house', 'studio', 'room']),
  bedrooms: z.number().min(0, 'Las habitaciones no pueden ser negativas'),
  bathrooms: z.number().min(0, 'Los baños no pueden ser negativos'),
  area_sqm: z.number().min(1, 'El área debe ser mayor a 0'),
  monthly_rent: z.number().min(0, 'El alquiler debe ser mayor a 0'),
  status: z.enum(['available', 'occupied', 'maintenance']),
});

type UnitFormData = z.infer<typeof unitSchema>;

const EditUnitModal: React.FC<EditUnitModalProps> = ({
  isOpen,
  onClose,
  unit,
  onUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -12.0464, lng: -77.0428 });
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
  });

  // Reset form when unit changes
  useEffect(() => {
    if (unit) {
      setValue('title', unit.title);
      setValue('address', unit.address);
      setValue('property_type', unit.property_type as any);
      setValue('bedrooms', unit.bedrooms);
      setValue('bathrooms', unit.bathrooms);
      setValue('area_sqm', unit.area_sqm);
      setValue('monthly_rent', unit.monthly_rent);
      setValue('status', unit.status as any);
      
      // Configurar el mapa con las coordenadas de la unidad
      if (unit.latitude && unit.longitude) {
        setMapCenter({ lat: unit.latitude, lng: unit.longitude });
        setSelectedLocation({ 
          lat: unit.latitude, 
          lng: unit.longitude, 
          address: unit.address 
        });
      }
    }
  }, [unit, setValue]);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setValue('address', location.address);
  };

  const onSubmit = async (data: UnitFormData) => {
    if (!unit) return;

    setIsLoading(true);
    try {
      // Incluir coordenadas si hay una ubicación seleccionada
      const updateData = {
        ...data,
        ...(selectedLocation && {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng
        })
      };

      const response = await apiClient.put(`/units/${unit.public_id}`, updateData);
      
      onUpdate(response.data);
      toast.success('Unidad actualizada correctamente');
      onClose();
    } catch (error: any) {
      console.error('Error updating unit:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar unidad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!unit) return null;


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Unidad"
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Título de la Propiedad *
          </label>
          <input
            {...register('title')}
            type="text"
            placeholder="Ej: Departamento moderno en Miraflores"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Dirección *
          </label>
          <input
            {...register('address')}
            type="text"
            placeholder="Selecciona una ubicación en el mapa"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            readOnly
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* Mapa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de propiedad */}
          <div>
            <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de Propiedad *
            </label>
            <select
              {...register('property_type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="apartment">Departamento</option>
              <option value="house">Casa</option>
              <option value="studio">Estudio</option>
              <option value="room">Habitación</option>
            </select>
            {errors.property_type && (
              <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado *
            </label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="available">Disponible</option>
              <option value="occupied">Ocupado</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Habitaciones */}
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Habitaciones *
            </label>
            <input
              {...register('bedrooms', { valueAsNumber: true })}
              type="number"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.bedrooms && (
              <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
            )}
          </div>

          {/* Baños */}
          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Baños *
            </label>
            <input
              {...register('bathrooms', { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.bathrooms && (
              <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
            )}
          </div>

          {/* Área */}
          <div>
            <label htmlFor="area_sqm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Área (m²) *
            </label>
            <input
              {...register('area_sqm', { valueAsNumber: true })}
              type="number"
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.area_sqm && (
              <p className="mt-1 text-sm text-red-600">{errors.area_sqm.message}</p>  
            )}
          </div>
        </div>

        {/* Alquiler mensual */}
        <div>
          <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Alquiler Mensual (S/) *
          </label>
          <input
            {...register('monthly_rent', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.monthly_rent && (
            <p className="mt-1 text-sm text-red-600">{errors.monthly_rent.message}</p>
          )}
        </div>

        {/* Información adicional */}
        {unit.tenant_name && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              Información del Inquilino
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Inquilino actual:</strong> {unit.tenant_name}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUnitModal;
