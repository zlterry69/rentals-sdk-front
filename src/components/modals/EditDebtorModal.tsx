import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { apiClient } from '@/app/api';
import toast from 'react-hot-toast';

// Interfaces
interface Debtor {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  phone?: string;
  property_id: string;
  property_name?: string;
  monthly_rent: number;
  status: 'active' | 'inactive' | 'pending';
  last_payment?: string;
  debt_amount: number;
  created_at: string;
  updated_at: string;
}

interface EditDebtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor: Debtor | null;
  onUpdate: (updatedDebtor: Debtor) => void;
}

// Validation schema
const debtorSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  monthly_rent: z.number().min(0, 'El alquiler debe ser mayor a 0'),
  debt_amount: z.number().min(0, 'La deuda no puede ser negativa'),
  status: z.enum(['active', 'inactive', 'pending']),
});

type DebtorFormData = z.infer<typeof debtorSchema>;

const EditDebtorModal: React.FC<EditDebtorModalProps> = ({
  isOpen,
  onClose,
  debtor,
  onUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<DebtorFormData>({
    resolver: zodResolver(debtorSchema),
  });

  // Reset form when debtor changes
  useEffect(() => {
    if (debtor) {
      setValue('full_name', debtor.full_name);
      setValue('email', debtor.email);
      setValue('phone', debtor.phone || '');
      setValue('monthly_rent', debtor.monthly_rent);
      setValue('debt_amount', debtor.debt_amount);
      setValue('status', debtor.status);
    }
  }, [debtor, setValue]);

  const onSubmit = async (data: DebtorFormData) => {
    if (!debtor) return;

    setIsLoading(true);
    try {
      const response = await apiClient.put(`/debtors/${debtor.public_id}`, data);
      
      onUpdate(response.data);
      toast.success('Inquilino actualizado correctamente');
      onClose();
    } catch (error: any) {
      console.error('Error updating debtor:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar inquilino');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!debtor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Inquilino"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre completo */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre Completo *
          </label>
          <input
            {...register('full_name')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Teléfono
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Deuda */}
          <div>
            <label htmlFor="debt_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Deuda Actual (S/) *
            </label>
            <input
              {...register('debt_amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.debt_amount && (
              <p className="mt-1 text-sm text-red-600">{errors.debt_amount.message}</p>
            )}
          </div>
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
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="pending">Pendiente</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Información de la propiedad (solo lectura) */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Información de la Propiedad
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Propiedad:</strong> {debtor.property_name || 'No asignada'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Para cambiar la propiedad, contacte al administrador
          </p>
        </div>

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

export default EditDebtorModal;
