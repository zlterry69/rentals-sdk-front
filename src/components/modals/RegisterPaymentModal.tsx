import React, { useState, useEffect } from 'react';
import { XMarkIcon, CurrencyDollarIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/app/api';

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentRegistered: () => void;
}

interface PaymentForm {
  debtor_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'other';
  reference: string;
  description: string;
  receipt_file: File | null;
}

interface Debtor {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  property_name?: string;
  monthly_rent: number;
  debt_amount: number;
}

export const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentRegistered
}) => {
  const [formData, setFormData] = useState<PaymentForm>({
    debtor_id: '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference: '',
    description: '',
    receipt_file: null
  });
  
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDebtors, setLoadingDebtors] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentForm>>({});

  // Fetch debtors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDebtors();
    }
  }, [isOpen]);

  const fetchDebtors = async () => {
    try {
      setLoadingDebtors(true);
      const response = await apiClient.get('/debtors');
      setDebtors(response.data || []);
    } catch (error) {
      console.error('Error fetching debtors:', error);
      toast.error('Error al cargar inquilinos');
    } finally {
      setLoadingDebtors(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentForm> = {};

    if (!formData.debtor_id) {
      newErrors.debtor_id = 'Debe seleccionar un inquilino';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.payment_date) {
      newErrors.payment_date = 'La fecha de pago es requerida';
    }

    if (!formData.reference.trim()) {
      newErrors.reference = 'La referencia es requerida';
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
      const paymentData = new FormData();
      paymentData.append('debtor_id', formData.debtor_id);
      paymentData.append('amount', formData.amount.toString());
      paymentData.append('payment_date', formData.payment_date);
      paymentData.append('payment_method', formData.payment_method);
      paymentData.append('reference', formData.reference);
      paymentData.append('description', formData.description);
      
      if (formData.receipt_file) {
        paymentData.append('receipt_file', formData.receipt_file);
      }

      await apiClient.post('/payments', paymentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Pago registrado correctamente');
      onPaymentRegistered();
      handleClose();
    } catch (error: any) {
      console.error('Error registering payment:', error);
      const errorMessage = error.response?.data?.detail || 'Error al registrar pago';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      debtor_id: '',
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference: '',
      description: '',
      receipt_file: null
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof PaymentForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('El archivo no puede ser mayor a 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, receipt_file: file }));
    }
  };

  const selectedDebtor = debtors.find(d => d.id === formData.debtor_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Registrar Pago
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Registra un pago en efectivo o transferencia
              </p>
            </div>
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
          {/* Debtor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Inquilino *
            </label>
            <select
              value={formData.debtor_id}
              onChange={(e) => handleInputChange('debtor_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                errors.debtor_id 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={loadingDebtors}
            >
              <option value="">
                {loadingDebtors ? 'Cargando inquilinos...' : 'Seleccionar inquilino'}
              </option>
              {debtors.map((debtor) => (
                <option key={debtor.id} value={debtor.id}>
                  {debtor.full_name} - {debtor.property_name || 'Sin propiedad'} (Deuda: S/ {debtor.debt_amount})
                </option>
              ))}
            </select>
            {errors.debtor_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.debtor_id}</p>
            )}
          </div>

          {/* Selected Debtor Info */}
          {selectedDebtor && (
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedDebtor.full_name}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedDebtor.email} • {selectedDebtor.property_name || 'Sin propiedad'}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Alquiler mensual: S/ {selectedDebtor.monthly_rent} • Deuda actual: S/ {selectedDebtor.debt_amount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto (S/) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.amount 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Pago *
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => handleInputChange('payment_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.payment_date 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.payment_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.payment_date}</p>
              )}
            </div>
          </div>

          {/* Payment Method and Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método de Pago
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value as 'cash' | 'bank_transfer' | 'other')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="cash">Efectivo</option>
                <option value="bank_transfer">Transferencia Bancaria</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Referencia *
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.reference 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Número de operación, voucher, etc."
              />
              {errors.reference && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reference}</p>
              )}
            </div>
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
              placeholder="Detalles adicionales del pago..."
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comprobante (opcional)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              PDF, JPG, PNG. Máximo 10MB
            </p>
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
              {isLoading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPaymentModal;
