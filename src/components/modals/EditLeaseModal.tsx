import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/app/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Property {
  id: string;
  title: string;
  address: string;
  monthly_rent: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface PaymentMethod {
  id: string;
  payment_type: string;
  account_details: any;
}

interface ExpenseItem {
  type: string;
  amount: number;
  description: string;
  isEditing?: boolean;
}

interface Lease {
  id: string;
  public_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  rent_frequency: 'monthly' | 'yearly';
  total_days: number;
  total_amount: number;
  payment_method: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'cancelled';
  notes?: string;
  contract_document_url?: string;
  contract_document_s3_key?: string;
  expenses?: ExpenseItem[];
  property: {
    id: string;
    title: string;
    address: string;
  };
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  host: {
    id: string;
    name: string;
    email: string;
  };
}

interface EditLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaseUpdated: () => void;
  lease: Lease | null;
}

const EditLeaseModal: React.FC<EditLeaseModalProps> = ({
  isOpen,
  onClose,
  onLeaseUpdated,
  lease
}) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '/foto.png'; // Icono para imágenes
    } else if (fileType === 'application/pdf') {
      return '/pdf.jpg'; // Icono para PDF
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      return '/word.jpg'; // Icono para Word
    } else {
      return '/logo_hogarperu.png'; // Icono por defecto
    }
  };

  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_frequency: 'monthly' as 'monthly' | 'yearly',
    rent_amount: 0,
    total_days: 0,
    total_amount: 0,
    payment_method: 'cash',
    notes: '',
    contract_document: null as File | null,
    expenses: [] as ExpenseItem[]
  });

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && lease) {
      // Cargar propiedades del usuario
      fetchUserProperties();
      // Cargar inquilinos
      fetchTenants();
      // Cargar métodos de pago
      fetchPaymentMethods();
      
      // Llenar formulario con datos del contrato
      setFormData({
        property_id: lease.property.id,
        tenant_id: lease.tenant.id,
        start_date: lease.start_date,
        end_date: lease.end_date,
        rent_frequency: lease.rent_frequency,
        rent_amount: lease.rent_amount,
        total_days: lease.total_days,
        total_amount: lease.total_amount,
        payment_method: lease.payment_method,
        notes: lease.notes || '',
        contract_document: null,
        expenses: lease.expenses || []
      });
    }
  }, [isOpen, lease]);

  const fetchUserProperties = async () => {
    try {
      const response = await apiClient.get('/units/my-units');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error al cargar propiedades');
    }
  };

  const fetchTenants = async () => {
    try {
      const endpoint = '/admin/users?role=user&active_only=true';
      const response = await apiClient.get(endpoint);
      const tenantsData = response.data?.users || response.data || [];
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
      toast.error('Error al cargar inquilinos');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.get('/payment-accounts');
      const paymentAccount = response.data;
      
      const methods = [];
      if (paymentAccount.accepts_yape) methods.push({ id: 'yape', payment_type: 'yape', account_details: { method: 'yape', description: 'Yape' } });
      if (paymentAccount.accepts_plin) methods.push({ id: 'plin', payment_type: 'plin', account_details: { method: 'plin', description: 'Plin' } });
      if (paymentAccount.accepts_visa) methods.push({ id: 'visa', payment_type: 'visa', account_details: { method: 'visa', description: 'Visa' } });
      if (paymentAccount.accepts_mastercard) methods.push({ id: 'mastercard', payment_type: 'mastercard', account_details: { method: 'mastercard', description: 'Mastercard' } });
      if (paymentAccount.accepts_bcp) methods.push({ id: 'bcp', payment_type: 'bcp', account_details: { method: 'bcp', description: 'BCP' } });
      if (paymentAccount.accepts_interbank) methods.push({ id: 'interbank', payment_type: 'interbank', account_details: { method: 'interbank', description: 'Interbank' } });
      if (paymentAccount.accepts_scotiabank) methods.push({ id: 'scotiabank', payment_type: 'scotiabank', account_details: { method: 'scotiabank', description: 'Scotiabank' } });
      
      // Agregar efectivo
      methods.push({ id: 'cash', payment_type: 'cash', account_details: { method: 'cash', description: 'Pago en efectivo' } });
      
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setPaymentMethods([{ id: 'cash', payment_type: 'cash', account_details: { method: 'cash', description: 'Pago en efectivo' } }]);
    }
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFormData({
      property_id: '',
      tenant_id: '',
      start_date: '',
      end_date: '',
      rent_frequency: 'monthly',
      rent_amount: 0,
      total_days: 0,
      total_amount: 0,
      payment_method: 'cash',
      notes: '',
      contract_document: null,
      expenses: []
    });
    setErrors({});
    setPreviewUrl(null);
    setShowDocumentPreview(false);
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === 'start_date' || field === 'end_date') {
      setTimeout(calculateTotals, 100);
    }

    if (field === 'contract_document') {
      if (value && value instanceof File) {
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        setShowDocumentPreview(true);
      } else {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setShowDocumentPreview(false);
      }
    }
  };

  const calculateTotals = () => {
    if (!formData.start_date || !formData.end_date || formData.rent_amount <= 0) return;

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let totalAmount = 0;
    if (formData.rent_frequency === 'monthly') {
      const months = diffDays / 30.44;
      totalAmount = months * formData.rent_amount;
    } else if (formData.rent_frequency === 'yearly') {
      const years = diffDays / 365.25;
      totalAmount = years * formData.rent_amount;
    }

    setFormData(prev => ({
      ...prev,
      total_days: diffDays,
      total_amount: totalAmount
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.property_id) {
      newErrors.property_id = 'Debe seleccionar una propiedad';
    }
    if (!formData.tenant_id) {
      newErrors.tenant_id = 'Debe seleccionar un inquilino';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es requerida';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'La fecha de fin es requerida';
    }
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end <= start) {
        newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    if (!formData.rent_amount || formData.rent_amount <= 0) {
      newErrors.rent_amount = 'El monto es requerido y debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !lease) {
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('unit_id', formData.property_id);
      formDataToSend.append('tenant_id', formData.tenant_id);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('rent_frequency', formData.rent_frequency);
      formDataToSend.append('rent_amount', formData.rent_amount.toString());
      formDataToSend.append('total_days', formData.total_days.toString());
      formDataToSend.append('total_amount', formData.total_amount.toString());
      formDataToSend.append('payment_method', formData.payment_method);
      formDataToSend.append('notes', formData.notes);
      
      if (formData.expenses.length > 0) {
        formDataToSend.append('expenses', JSON.stringify(formData.expenses));
      }
      
      if (formData.contract_document) {
        formDataToSend.append('contract_document', formData.contract_document);
      }

      await apiClient.patch(`/leases/${lease.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Contrato actualizado exitosamente');
      onLeaseUpdated();
    } catch (error: any) {
      console.error('Error updating lease:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar el contrato');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProperty = properties.find(p => p.id === formData.property_id);
  const selectedTenant = tenants.find(t => t.id === formData.tenant_id);

  if (!isOpen || !lease) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Editar Contrato
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Propiedad e Inquilino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Propiedad *
              </label>
              <select
                value={formData.property_id}
                onChange={(e) => handleInputChange('property_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar propiedad</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title} - {property.address}
                  </option>
                ))}
              </select>
              {errors.property_id && (
                <p className="mt-1 text-sm text-red-600">{errors.property_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inquilino *
              </label>
              <select
                value={formData.tenant_id}
                onChange={(e) => handleInputChange('tenant_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar inquilino</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.full_name} - {tenant.email}
                  </option>
                ))}
              </select>
              {errors.tenant_id && (
                <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Fin *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Monto y Frecuencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monto (S/)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.rent_amount}
                onChange={(e) => handleInputChange('rent_amount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
              {errors.rent_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.rent_amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frecuencia de Pago
              </label>
              <select
                value={formData.rent_frequency}
                onChange={(e) => handleInputChange('rent_frequency', e.target.value as 'monthly' | 'yearly')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Método de Pago
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => handleInputChange('payment_method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.payment_type}>
                  {method.account_details.description}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Notas adicionales del contrato"
            />
          </div>

          {/* Documento del Contrato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Documento del Contrato (PDF, Imagen)
            </label>
            
            {lease.contract_document_url && !formData.contract_document && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Documento actual: <a href={lease.contract_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Ver documento</a>
                </p>
              </div>
            )}

            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="space-y-1 text-center">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="contract-document-edit"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Subir nuevo archivo</span>
                    <input
                      id="contract-document-edit"
                      name="contract-document-edit"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      onChange={(e) => handleInputChange('contract_document', e.target.files?.[0] || null)}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">o arrastra y suelta aquí</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, PNG, JPG, DOCX hasta 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaseModal;
