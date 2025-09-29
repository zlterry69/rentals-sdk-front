import React, { useState, useEffect } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, DocumentArrowUpIcon, HomeIcon, UserIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/app/api';
import { useAuth } from '@/contexts/AuthContext';

interface CreateLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaseCreated: () => void;
}

interface Property {
  id: string;
  public_id: string;
  title: string;
  address: string;
  monthly_rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images?: string[];
}

interface User {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface CreateLeaseForm {
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_frequency: 'monthly' | 'yearly';
  rent_amount: number;
  total_days: number;
  total_amount: number;
  payment_method: string;
  notes: string;
  contract_document: File | null;
  expenses: ExpenseItem[];
}

interface ExpenseItem {
  type: string;
  amount: number;
  description: string;
  isEditing?: boolean;
}

interface PaymentMethod {
  id: string;
  payment_type: string;
  account_details: any;
}

export const CreateLeaseModal: React.FC<CreateLeaseModalProps> = ({
  isOpen,
  onClose,
  onLeaseCreated
}) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<CreateLeaseForm>({
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
  
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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

  // Cargar propiedades del usuario actual
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUserProperties();
      fetchTenants();
      fetchPaymentMethods();
    }
  }, [isOpen, currentUser]);

  const fetchUserProperties = async () => {
    try {
      const response = await apiClient.get('/units/my-units');
      setProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error al cargar propiedades');
    }
  };

  const fetchTenants = async () => {
    try {
      // Para inquilinos: solo usuarios activos con rol 'user'
      const endpoint = '/admin/users?role=user&active_only=true';
      
      console.log('Fetching tenants from:', endpoint);
      const response = await apiClient.get(endpoint);
      console.log('Tenants response:', response.data);
      
      // El endpoint /admin/users devuelve {users: [...]}, necesitamos extraer el array
      const tenantsData = response.data?.users || response.data || [];
      console.log('Extracted tenants:', tenantsData);
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]); // Asegurar que siempre sea un array
      toast.error('Error al cargar inquilinos');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.get('/payment-accounts');
      const paymentAccount = response.data;
      
      // Crear array de métodos de pago basado en los que acepta el usuario
      const methods = [];
      
      // Siempre agregar efectivo
      methods.push({
        id: 'cash',
        payment_type: 'cash',
        account_details: { method: 'cash', description: 'Pago en efectivo' }
      });
      
      // Agregar otros métodos si están habilitados
      if (paymentAccount) {
        if (paymentAccount.accepts_yape && paymentAccount.yape_number) {
          methods.push({
            id: 'yape',
            payment_type: 'yape',
            account_details: { method: 'yape', description: `Yape: ${paymentAccount.yape_number}` }
          });
        }
        if (paymentAccount.accepts_plin && paymentAccount.plin_number) {
          methods.push({
            id: 'plin',
            payment_type: 'plin',
            account_details: { method: 'plin', description: `Plin: ${paymentAccount.plin_number}` }
          });
        }
        if (paymentAccount.accepts_visa) {
          methods.push({
            id: 'visa',
            payment_type: 'visa',
            account_details: { method: 'visa', description: 'Visa' }
          });
        }
        if (paymentAccount.accepts_mastercard) {
          methods.push({
            id: 'mastercard',
            payment_type: 'mastercard',
            account_details: { method: 'mastercard', description: 'Mastercard' }
          });
        }
        if (paymentAccount.accepts_bcp && paymentAccount.bank_account) {
          methods.push({
            id: 'bcp',
            payment_type: 'bcp',
            account_details: { method: 'bcp', description: `BCP: ${paymentAccount.bank_account}` }
          });
        }
        if (paymentAccount.accepts_interbank && paymentAccount.bank_account) {
          methods.push({
            id: 'interbank',
            payment_type: 'interbank',
            account_details: { method: 'interbank', description: `Interbank: ${paymentAccount.bank_account}` }
          });
        }
        if (paymentAccount.accepts_scotiabank && paymentAccount.bank_account) {
          methods.push({
            id: 'scotiabank',
            payment_type: 'scotiabank',
            account_details: { method: 'scotiabank', description: `Scotiabank: ${paymentAccount.bank_account}` }
          });
        }
      }
      
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Si hay error, al menos mostrar efectivo
      setPaymentMethods([{
        id: 'cash',
        payment_type: 'cash',
        account_details: { method: 'cash', description: 'Pago en efectivo' }
      }]);
    }
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

  const calculateTotals = () => {
    if (!formData.start_date || !formData.end_date || formData.rent_amount <= 0) return;

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de inicio

    let totalAmount = 0;
    if (formData.rent_frequency === 'monthly') {
      // Para frecuencia mensual, calcular basado en días exactos
      const dailyRate = formData.rent_amount / 30; // Asumiendo 30 días por mes
      totalAmount = diffDays * dailyRate;
    } else if (formData.rent_frequency === 'yearly') {
      // Para frecuencia anual, calcular basado en días exactos
      const dailyRate = formData.rent_amount / 365; // Asumiendo 365 días por año
      totalAmount = diffDays * dailyRate;
    }

    setFormData(prev => ({
      ...prev,
      total_days: diffDays,
      total_amount: totalAmount
    }));
  };

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setFormData(prev => ({
        ...prev,
        property_id: propertyId,
        rent_amount: property.monthly_rent
      }));
    }
  };

  const addExpense = () => {
    setFormData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { type: 'electricity', amount: 0, description: '', isEditing: true }]
    }));
  };

  const removeExpense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index)
    }));
  };

  const updateExpense = (index: number, field: keyof ExpenseItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map((expense, i) => 
        i === index ? { ...expense, [field]: value } : expense
      )
    }));
  };

  const saveExpense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map((expense, i) => 
        i === index ? { ...expense, isEditing: false } : expense
      )
    }));
  };

  const editExpense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map((expense, i) => 
        i === index ? { ...expense, isEditing: true } : expense
      )
    }));
  };

  const removeDocument = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFormData(prev => ({ ...prev, contract_document: null }));
    setPreviewUrl(null);
    setShowDocumentPreview(false);
    setShowPreviewModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Agregar datos del formulario
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
      
      // Agregar gastos como JSON
      if (formData.expenses.length > 0) {
        formDataToSend.append('expenses', JSON.stringify(formData.expenses));
      }
      
      // Agregar archivo si existe
      if (formData.contract_document) {
        formDataToSend.append('contract_document', formData.contract_document);
      }

      await apiClient.post('/leases', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Contrato creado correctamente');
      onLeaseCreated();
      handleClose();
    } catch (error: any) {
      console.error('Error creating lease:', error);
      const errorMessage = error.response?.data?.detail || 'Error al crear contrato';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Limpiar vista previa si existe
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
    setShowPreviewModal(false);
    onClose();
  };

  const handleInputChange = (field: keyof CreateLeaseForm, value: string | number | File | null) => {
    console.log('Input change:', field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Recalcular totales cuando cambian las fechas
    if (field === 'start_date' || field === 'end_date') {
      setTimeout(calculateTotals, 100);
    }

    // Manejar vista previa de documentos
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

  const selectedProperty = properties.find(p => p.id === formData.property_id);
  const selectedTenant = Array.isArray(tenants) ? tenants.find(t => t.id === formData.tenant_id) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Crear Nuevo Contrato
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Propiedad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Propiedad *
              </label>
              <select
                value={formData.property_id}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.property_id 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Seleccionar propiedad</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title} - {property.address}
                  </option>
                ))}
              </select>
              {errors.property_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.property_id}</p>
              )}
              
              {/* Vista previa de la propiedad seleccionada */}
              {selectedProperty && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {selectedProperty.images && selectedProperty.images.length > 0 ? (
                      <img
                        src={selectedProperty.images[0]}
                        alt={selectedProperty.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <HomeIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedProperty.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedProperty.address}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{selectedProperty.bedrooms} hab</span>
                        <span>{selectedProperty.bathrooms} baños</span>
                        <span>{selectedProperty.area_sqm} m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inquilino */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inquilino *
              </label>
              <select
                value={formData.tenant_id}
                onChange={(e) => handleInputChange('tenant_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.tenant_id 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Seleccionar inquilino</option>
                {Array.isArray(tenants) ? tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.full_name} - {tenant.email}
                  </option>
                )) : []}
              </select>
              {errors.tenant_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tenant_id}</p>
              )}
              
              {/* Vista previa del inquilino seleccionado */}
              {selectedTenant && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedTenant.full_name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedTenant.email}
                      </p>
                      {selectedTenant.phone && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedTenant.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fechas y Duración */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frecuencia de Pago
              </label>
              <select
                value={formData.rent_frequency}
                onChange={(e) => handleInputChange('rent_frequency', e.target.value as 'monthly' | 'yearly')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto ({formData.rent_frequency === 'monthly' ? 'Mensual' : 'Anual'}) (S/)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.rent_amount}
                onChange={(e) => handleInputChange('rent_amount', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.rent_amount 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
              />
              {errors.rent_amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rent_amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método de Pago
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.payment_type}>
                    {method.account_details?.description || method.payment_type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumen de Cálculos */}
          {(formData.total_days > 0 || formData.total_amount > 0) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Resumen del Contrato
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Duración:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {formData.total_days} días
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Monto {formData.rent_frequency === 'monthly' ? 'mensual' : 'anual'}:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    S/ {formData.rent_amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Total estimado:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    S/ {formData.total_amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Método de Pago:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {paymentMethods.find(m => m.payment_type === formData.payment_method)?.account_details?.description || formData.payment_method}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gastos de la Propiedad */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Gastos de la Propiedad
              </h4>
              <button
                type="button"
                onClick={addExpense}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                + Agregar Gasto
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Los gastos son opcionales y se pueden agregar antes o después de crear el contrato
            </p>
            
            {formData.expenses.length > 0 && (
              <div className="space-y-3">
                {formData.expenses.map((expense, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo
                      </label>
                      <select
                        value={expense.type}
                        onChange={(e) => updateExpense(index, 'type', e.target.value)}
                        disabled={!expense.isEditing}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      >
                        <option value="electricity">Luz</option>
                        <option value="water">Agua</option>
                        <option value="maintenance">Mantenimiento</option>
                        <option value="cleaning">Limpieza</option>
                        <option value="internet">Internet</option>
                        <option value="gas">Gas</option>
                        <option value="insurance">Seguro</option>
                        <option value="taxes">Impuestos</option>
                        <option value="management">Administración</option>
                        <option value="other">Otros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Monto (S/)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={expense.amount}
                        onChange={(e) => updateExpense(index, 'amount', parseFloat(e.target.value) || 0)}
                        disabled={!expense.isEditing}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={expense.description}
                        onChange={(e) => updateExpense(index, 'description', e.target.value)}
                        disabled={!expense.isEditing}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        placeholder="Descripción del gasto"
                      />
                    </div>
                    <div className="flex items-end space-x-1">
                      {expense.isEditing ? (
                        <button
                          type="button"
                          onClick={() => saveExpense(index)}
                          className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          title="Guardar gasto"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => editExpense(index)}
                          className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="Editar gasto"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExpense(index)}
                        className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        title="Eliminar gasto"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Resumen de gastos */}
                {formData.expenses.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-900 dark:text-red-100">
                        Total de Gastos:
                      </span>
                      <span className="text-sm font-bold text-red-900 dark:text-red-100">
                        S/ {formData.expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Ganancia Neta Estimada:
                      </span>
                      <span className="text-sm font-bold text-green-900 dark:text-green-100">
                        S/ {(formData.rent_amount - formData.expenses.reduce((sum, expense) => sum + expense.amount, 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Documento del Contrato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Documento del Contrato (PDF, Imagen)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="space-y-1 text-center">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="contract-document"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Subir archivo</span>
                    <input
                      id="contract-document"
                      name="contract-document"
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
            {formData.contract_document && (
              <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Archivo seleccionado
                  </h4>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Icono del archivo */}
                  <div className="flex-shrink-0">
                    {formData.contract_document.type.startsWith('image/') ? (
                      <img
                        src={previewUrl || ''}
                        alt="Vista previa"
                        className="h-16 w-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                        <img
                          src={getFileIcon(formData.contract_document.type)}
                          alt="Tipo de archivo"
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {formData.contract_document.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {((formData.contract_document.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.contract_document.type}
                    </p>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Vista previa"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={removeDocument}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar archivo"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Términos especiales, condiciones, observaciones..."
            />
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

      {/* Modal de vista previa */}
      {showPreviewModal && previewUrl && formData.contract_document && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vista previa del documento
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 h-[calc(85vh-80px)] overflow-auto">
              {formData.contract_document.type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt="Vista previa del documento"
                  className="w-full h-auto max-h-[calc(85vh-120px)] object-contain mx-auto"
                />
              ) : formData.contract_document.type === 'application/pdf' ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[calc(85vh-120px)] border border-gray-300 dark:border-gray-600 rounded"
                  title="Vista previa del documento"
                />
              ) : formData.contract_document.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                      formData.contract_document.type === 'application/msword' ? (
                <div className="flex flex-col items-center justify-center h-[calc(85vh-120px)] bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  <img
                    src={getFileIcon(formData.contract_document.type)}
                    alt="Tipo de archivo"
                    className="h-20 w-20 mb-4"
                  />
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    Vista previa de Word no disponible
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 text-center">
                    Los archivos Word se pueden ver después de subirlos al servidor
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewUrl;
                      link.download = formData.contract_document?.name || 'archivo.docx';
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-6 py-3 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Descargar para ver
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(85vh-120px)] bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  <img
                    src={getFileIcon(formData.contract_document.type)}
                    alt="Tipo de archivo"
                    className="h-20 w-20 mb-4"
                  />
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    Este tipo de archivo no se puede previsualizar
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewUrl;
                      link.download = formData.contract_document?.name || 'archivo.docx';
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-6 py-3 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Descargar archivo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLeaseModal;
