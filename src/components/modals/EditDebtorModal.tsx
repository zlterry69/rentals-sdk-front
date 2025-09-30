import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/app/api';
import { toast } from 'react-hot-toast';

interface Debtor {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  phone?: string;
  property_id: string;
  property_name?: string;
  monthly_rent: number;
  status: 'current' | 'overdue' | 'defaulted' | 'completed';
  debt_amount: number;
  created_at: string;
  updated_at: string;
}


interface EditDebtorModalProps {
  debtor: Debtor;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditDebtorModal: React.FC<EditDebtorModalProps> = ({
  debtor,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    status: 'current' as 'current' | 'overdue' | 'defaulted' | 'completed'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when debtor changes
  useEffect(() => {
    if (debtor) {
      setFormData({
        status: debtor.status || 'current'
      });
    }
  }, [debtor]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.status) {
      newErrors.status = 'El estado es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData = {
        status: formData.status
      };

      await apiClient.put(`/debtors/${debtor.public_id}`, updateData);

      toast.success('Inquilino actualizado exitosamente');
      onUpdate();
    } catch (error: any) {
      console.error('Error updating debtor:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar el inquilino');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Editar Estado del Inquilino
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Información del inquilino */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Información del Inquilino
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Nombre:</strong> {debtor.full_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Email:</strong> {debtor.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Propiedad:</strong> {debtor.property_name || 'Propiedad no asignada'}
                    </p>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.status ? 'border-red-300' : 'border-gray-300'
                      } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    >
                      <option value="current">Al día</option>
                      <option value="overdue">Vencido</option>
                      <option value="defaulted">Moroso</option>
                      <option value="completed">Nada más</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Actualizando...' : 'Actualizar Estado'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditDebtorModal;