import React, { useState } from 'react';
import { XMarkIcon, DocumentIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/app/api';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContractCreated: () => void;
  debtorId?: string;
  debtorName?: string;
  propertyId?: string;
  propertyName?: string;
}

interface ContractForm {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  contract_file: File | null;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onContractCreated,
  debtorId,
  debtorName,
  propertyId,
  propertyName
}) => {
  const [formData, setFormData] = useState<ContractForm>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    monthly_rent: 0,
    security_deposit: 0,
    contract_file: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ContractForm>>({});
  const [dragActive, setDragActive] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<ContractForm> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título del contrato es requerido';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es requerida';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'La fecha de fin es requerida';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (formData.monthly_rent <= 0) {
      newErrors.monthly_rent = 'El alquiler mensual debe ser mayor a 0';
    }

    if (!formData.contract_file) {
      newErrors.contract_file = 'Debe subir un archivo PDF del contrato';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const contractData = new FormData();
      contractData.append('title', formData.title);
      contractData.append('description', formData.description);
      contractData.append('start_date', formData.start_date);
      contractData.append('end_date', formData.end_date);
      contractData.append('monthly_rent', formData.monthly_rent.toString());
      contractData.append('security_deposit', formData.security_deposit.toString());
      
      if (debtorId) contractData.append('debtor_id', debtorId);
      if (propertyId) contractData.append('property_id', propertyId);
      
      if (formData.contract_file) {
        contractData.append('contract_file', formData.contract_file);
      }

      await apiClient.post('/contracts', contractData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Contrato creado correctamente');
      onContractCreated();
      handleClose();
    } catch (error: any) {
      console.error('Error creating contract:', error);
      const errorMessage = error.response?.data?.detail || 'Error al crear contrato';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      monthly_rent: 0,
      security_deposit: 0,
      contract_file: null
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof ContractForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('El archivo no puede ser mayor a 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, contract_file: file }));
      setErrors(prev => ({ ...prev, contract_file: undefined }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no puede ser mayor a 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, contract_file: file }));
      setErrors(prev => ({ ...prev, contract_file: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Crear Contrato de Alquiler
            </h3>
            {debtorName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Para: {debtorName}
              </p>
            )}
            {propertyName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Propiedad: {propertyName}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título del Contrato *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                errors.title 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Contrato de Alquiler - Apartamento 101"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Detalles adicionales del contrato..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.start_date 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Fin *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.end_date 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alquiler Mensual (S/) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_rent}
                onChange={(e) => handleInputChange('monthly_rent', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.monthly_rent 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
              />
              {errors.monthly_rent && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.monthly_rent}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Depósito de Garantía (S/)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.security_deposit}
                onChange={(e) => handleInputChange('security_deposit', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Archivo del Contrato (PDF) *
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                dragActive 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                  : errors.contract_file 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    Haz clic para subir
                  </span>
                  {' '}o arrastra y suelta
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Solo archivos PDF, máximo 10MB
                </p>
              </div>
            </div>
            {formData.contract_file && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <DocumentIcon className="h-4 w-4" />
                <span>{formData.contract_file.name}</span>
                <span className="text-gray-400">
                  ({(formData.contract_file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
            {errors.contract_file && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contract_file}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear Contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractModal;
