import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '@/app/api';
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
  status: 'sin_pagos' | 'al_dia' | 'pago_parcial' | 'vencido' | 'error';
  last_payment?: string;
  debt_amount: number;
  created_at: string;
  updated_at: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  payment_type?: string;
  code?: string;
  description?: string;
  type?: string;
  icon_url?: string;
  isActive?: boolean;
}

interface Property {
  id: string;
  public_id: string;
  title: string;
  address: string;
}

interface User {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentRegistered: () => void;
}

const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentRegistered
}) => {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDebtors, setLoadingDebtors] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const [formData, setFormData] = useState({
    property_id: '',
    user_id: '',
    debtor_id: '',
    amount: '',
    payment_method: '',
    description: '',
    comments: '',
    receipt_file: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState('');

  // Generar ID de boleta único
  const generateInvoiceId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `inv_${timestamp}_${random}`.toLowerCase();
  };

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      fetchDebtors();
      fetchPaymentMethods();
      setGeneratedInvoiceId(generateInvoiceId());
      // Don't fetch users automatically - wait for property selection
    }
  }, [isOpen]);

  // Fetch users when property is selected
  useEffect(() => {
    if (formData.property_id) {
      fetchUsers(formData.property_id);
      // Clear user selection when property changes
      setFormData(prev => ({ ...prev, user_id: '' }));
    } else {
      setUsers([]);
    }
  }, [formData.property_id]);

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await api.get('/units/');
      const propertiesData = response.data;
      
      // Ensure we always set an array
      if (Array.isArray(propertiesData)) {
        setProperties(propertiesData);
      } else {
        console.warn('Properties data is not an array:', propertiesData);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error al cargar propiedades');
      setProperties([]); // Set empty array on error
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchUsers = async (propertyId?: string) => {
    try {
      setLoadingUsers(true);
      
      if (propertyId) {
        // Fetch users who have bookings for this specific property
        const response = await api.get(`/bookings/users-by-property/${propertyId}`);
        const usersData = response.data;
        
        // Ensure we always set an array
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        } else {
          console.warn('Users data is not an array:', usersData);
          setUsers([]);
        }
      } else {
        // Fallback: fetch all users if no property selected
        const response = await api.get('/admin/users?role=user&active_only=true');
        const usersData = response.data;
        
        // Handle both array and object responses
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        } else if (usersData && Array.isArray(usersData.users)) {
          setUsers(usersData.users);
        } else {
          console.warn('Users data is not an array:', usersData);
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
      setUsers([]); // Set empty array on error
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDebtors = async () => {
    try {
      setLoadingDebtors(true);
      // Obtener inquilinos desde el endpoint de debtors
      const response = await api.get('/debtors/');
      const debtorsData = response.data || [];
      
      // Eliminar duplicados basándose en el public_id
      const uniqueDebtors = debtorsData.filter((debtor: Debtor, index: number, self: Debtor[]) => 
        index === self.findIndex((d: Debtor) => d.public_id === debtor.public_id)
      );
      
      setDebtors(uniqueDebtors);
    } catch (error) {
      console.error('Error fetching debtors:', error);
      toast.error('Error al cargar inquilinos');
    } finally {
      setLoadingDebtors(false);
    }
  };


  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      // Obtener métodos de pago desde el endpoint correcto
      const response = await api.get('/invoices/payment-methods');
      const paymentMethods = response.data;
      
      // Convertir la respuesta a métodos de pago
      const methods: PaymentMethod[] = [];
      
      if (paymentMethods && Array.isArray(paymentMethods)) {
        paymentMethods.forEach((method: any) => {
          methods.push({
            id: method.id || method.code,
            name: method.name,
            code: method.code,
            type: method.type || 'traditional',
            isActive: method.is_active !== false
          });
        });
      }
      
      // Fallback methods if no data
      if (methods.length === 0) {
        methods.push(
          { id: 'yape', name: 'Yape', code: 'yape', type: 'traditional', isActive: true },
          { id: 'plin', name: 'Plin', code: 'plin', type: 'traditional', isActive: true },
          { id: 'bim', name: 'BIM', code: 'bim', type: 'traditional', isActive: true },
          { id: 'cash', name: 'Efectivo', code: 'cash', type: 'traditional', isActive: true },
          { id: 'transfer', name: 'Transferencia', code: 'transfer', type: 'traditional', isActive: true }
        );
      }
      
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback methods on error
      const fallbackMethods: PaymentMethod[] = [
        { id: 'yape', name: 'Yape', code: 'yape', type: 'traditional', isActive: true },
        { id: 'plin', name: 'Plin', code: 'plin', type: 'traditional', isActive: true },
        { id: 'bim', name: 'BIM', code: 'bim', type: 'traditional', isActive: true },
        { id: 'cash', name: 'Efectivo', code: 'cash', type: 'traditional', isActive: true },
        { id: 'transfer', name: 'Transferencia', code: 'transfer', type: 'traditional', isActive: true }
      ];
      setPaymentMethods(fallbackMethods);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      receipt_file: file
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.property_id) {
      newErrors.property_id = 'Selecciona una propiedad';
    }

    if (!formData.user_id) {
      newErrors.user_id = 'Selecciona un usuario';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Ingresa un monto válido';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Selecciona un método de pago';
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
      setIsLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('property_id', formData.property_id);
      formDataToSend.append('user_id', formData.user_id);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('payment_method', formData.payment_method);
      formDataToSend.append('payment_origin', formData.payment_method); // Usar el método como origen
      formDataToSend.append('description', formData.description);
      formDataToSend.append('comments', formData.comments);
      formDataToSend.append('invoice_id', generatedInvoiceId);
      
      if (formData.receipt_file) {
        formDataToSend.append('receipt_file', formData.receipt_file);
      }

      await api.post('/payments/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Pago registrado exitosamente');
      onPaymentRegistered();
      handleClose();
    } catch (error: any) {
      console.error('Error registering payment:', error);
      toast.error(error.response?.data?.detail || 'Error al registrar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      property_id: '',
      user_id: '',
      debtor_id: '',
      amount: '',
      payment_method: '',
      description: '',
      comments: '',
      receipt_file: null
    });
    setErrors({});
    onClose();
  };


  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Registrar Nuevo Pago
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Propiedad y Usuario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Propiedad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Propiedad *
                      </label>
                      <select
                        name="property_id"
                        value={formData.property_id}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.property_id ? 'border-red-300' : 'border-gray-300'
                        } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        disabled={loadingProperties}
                      >
                        <option value="">Selecciona una propiedad</option>
                        {Array.isArray(properties) && properties.map((property) => (
                          <option key={property.public_id} value={property.public_id}>
                            {property.title} - {property.address}
                          </option>
                        ))}
                      </select>
                      {errors.property_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.property_id}</p>
                      )}
                      {loadingProperties && (
                        <p className="mt-1 text-sm text-gray-500">Cargando propiedades...</p>
                      )}
                    </div>

                    {/* Usuario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Usuario *
                      </label>
                      <select
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.user_id ? 'border-red-300' : 'border-gray-300'
                        } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        disabled={loadingUsers || !formData.property_id}
                      >
                        <option value="">
                          {formData.property_id 
                            ? "Selecciona un usuario que haya reservado esta propiedad" 
                            : "Primero selecciona una propiedad"
                          }
                        </option>
                        {Array.isArray(users) && users.map((user) => (
                          <option key={user.public_id} value={user.public_id}>
                            {user.full_name} - {user.email}
                          </option>
                        ))}
                      </select>
                      {errors.user_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                      )}
                      {loadingUsers && (
                        <p className="mt-1 text-sm text-gray-500">Cargando usuarios...</p>
                      )}
                      {!loadingUsers && formData.property_id && Array.isArray(users) && users.length === 0 && (
                        <p className="mt-1 text-sm text-amber-600">
                          No hay usuarios que hayan reservado esta propiedad
                        </p>
                      )}
                    </div>
                  </div>



                  {/* Monto e ID de Factura */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monto (S/) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.amount ? 'border-red-300' : 'border-gray-300'
                        } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                      />
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ID de Boleta
                      </label>
                      <div className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-400">
                        {generatedInvoiceId}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Se generará automáticamente al registrar el pago
                      </p>
                    </div>
                  </div>

                  {/* Método de Pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Método de Pago *
                    </label>
                    {loadingPaymentMethods ? (
                      <p className="text-sm text-gray-500">Cargando métodos de pago...</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {paymentMethods.map((method) => {
                          const isSelected = formData.payment_method === (method.code || method.payment_type);
                          return (
                            <div
                              key={method.id}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      payment_method: method.code || method.payment_type || method.id
                    }))}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                              }`}
                            >
                              <div className="flex flex-col items-center text-center">
                                <div className="w-8 h-8 mb-2">
                                  {method.icon_url ? (
                                    <img 
                                      src={method.icon_url} 
                                      alt={method.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                      <span className="text-xs text-gray-500">{method.name.charAt(0)}</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                  {method.name}
                                </span>
                                {method.description && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {method.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {errors.payment_method && (
                      <p className="mt-2 text-sm text-red-600">{errors.payment_method}</p>
                    )}
                  </div>

                  {/* Descripción y Comentarios */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Descripción del pago..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Comentarios
                      </label>
                      <textarea
                        name="comments"
                        value={formData.comments}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Comentarios adicionales..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Archivo de Recibo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comprobante de Pago (Opcional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Formatos permitidos: JPG, PNG, PDF (máx. 10MB)
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Registrando...' : 'Registrar Pago'}
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

export default RegisterPaymentModal;