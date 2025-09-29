import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, EyeIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../app/api';

interface EditLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaseUpdated: () => void;
  lease: any;
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  payment_type: string;
  code?: string;
  description?: string;
  type?: string;
  icon_url?: string;
}

interface EditLeaseForm {
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_frequency: 'monthly' | 'yearly';
  rent_amount: number;
  payment_method: string;
  status: string;
  notes: string;
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    isEditing: boolean;
  }>;
}

// Estados posibles para contratos
const LEASE_STATUSES = [
  { value: 'draft', label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: 'Activo', color: 'bg-green-100 text-green-800' },
  { value: 'expired', label: 'Vencido', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-orange-100 text-orange-800' },
  { value: 'completed', label: 'Completado', color: 'bg-blue-100 text-blue-800' }
];

const EditLeaseModal: React.FC<EditLeaseModalProps> = ({
  isOpen,
  onClose,
  onLeaseUpdated,
  lease,
  paymentMethods,
  paymentMethodsLoading
}) => {
  const [formData, setFormData] = useState<EditLeaseForm>({
    unit_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_frequency: 'monthly',
    rent_amount: 0,
    payment_method: '',
    status: 'active',
    notes: '',
    expenses: []
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (isOpen && lease) {
      // Populate form with lease data
      setFormData({
        unit_id: lease.unit_id || '',
        tenant_id: lease.tenant_id || '',
        start_date: lease.start_date || '',
        end_date: lease.end_date || '',
        rent_frequency: lease.rent_frequency || 'monthly',
        rent_amount: lease.rent_amount || 0,
        payment_method: lease.payment_method || '',
        status: lease.status || 'active',
        notes: lease.notes || '',
        expenses: lease.expenses ? (typeof lease.expenses === 'string' ? JSON.parse(lease.expenses) : lease.expenses) : []
      });

      fetchUserProperties();
      fetchTenants();
    }
  }, [isOpen, lease]);

  const fetchUserProperties = async () => {
    try {
      const response = await apiClient.get('/units/my-units');
      setProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await apiClient.get('/admin/users?role=user&active_only=true');
      setTenants(response.data?.users || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleInputChange = (field: keyof EditLeaseForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addExpense = () => {
    const newExpense = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      isEditing: true
    };
    setFormData(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));
  };

  const removeExpense = (id: string) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(expense => expense.id !== id)
    }));
  };

  const updateExpense = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    }));
  };

  const saveExpense = (id: string) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense =>
        expense.id === id ? { ...expense, isEditing: false } : expense
      )
    }));
  };

  const editExpense = (id: string) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense =>
        expense.id === id ? { ...expense, isEditing: true } : expense
      )
    }));
  };

  const calculateTotals = () => {
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const totalAmount = formData.rent_amount;
    const totalExpenses = formData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalAmount - totalExpenses;

    return {
      totalDays: diffDays,
      totalAmount,
      totalExpenses,
      netProfit
    };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.unit_id) newErrors.unit_id = 'Selecciona una propiedad';
    if (!formData.tenant_id) newErrors.tenant_id = 'Selecciona un inquilino';
    if (!formData.start_date) newErrors.start_date = 'Fecha de inicio requerida';
    if (!formData.end_date) newErrors.end_date = 'Fecha de fin requerida';
    if (!formData.rent_amount || formData.rent_amount <= 0) newErrors.rent_amount = 'Monto válido requerido';
    if (!formData.payment_method) newErrors.payment_method = 'Selecciona un método de pago';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('unit_id', formData.unit_id);
      formDataToSend.append('tenant_id', formData.tenant_id);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('rent_frequency', formData.rent_frequency);
      formDataToSend.append('rent_amount', formData.rent_amount.toString());
      formDataToSend.append('payment_method', formData.payment_method);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('expenses', JSON.stringify(formData.expenses));

      await apiClient.put(`/leases/${lease.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onLeaseUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating lease:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      unit_id: '',
      tenant_id: '',
      start_date: '',
      end_date: '',
      rent_frequency: 'monthly',
      rent_amount: 0,
      payment_method: '',
      status: 'active',
      notes: '',
      expenses: []
    });
    setErrors({});
    setPreviewUrl(null);
    onClose();
  };

  const totals = calculateTotals();

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Editar Contrato
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Propiedad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Propiedad *
                  </label>
                  <select
                    value={formData.unit_id}
                    onChange={(e) => handleInputChange('unit_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.unit_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona una propiedad</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title} - {property.address}
                      </option>
                    ))}
                  </select>
                  {errors.unit_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>
                  )}
                </div>

                {/* Inquilino */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inquilino *
                  </label>
                  <select
                    value={formData.tenant_id}
                    onChange={(e) => handleInputChange('tenant_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tenant_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona un inquilino</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.full_name} ({tenant.email})
                      </option>
                    ))}
                  </select>
                  {errors.tenant_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>
                  )}
                </div>

                {/* Fecha de Inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.start_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                  )}
                </div>

                {/* Fecha de Fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.end_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                  )}
                </div>

                {/* Frecuencia de Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Pago *
                  </label>
                  <select
                    value={formData.rent_frequency}
                    onChange={(e) => handleInputChange('rent_frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto (Mensual/Anual) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rent_amount}
                    onChange={(e) => handleInputChange('rent_amount', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.rent_amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.rent_amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.rent_amount}</p>
                  )}
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Método de Pago *
                </label>
                {paymentMethodsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Cargando métodos de pago...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 p-3 border border-gray-300 rounded-md">
                    {paymentMethods.map((method) => {
                      const methodCode = method.code || method.payment_type;
                      const isSelected = formData.payment_method === methodCode;
                      
                      return (
                        <label 
                          key={`${method.id}-${isSelected}`} 
                          className={`flex flex-col items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded border-2 transition-colors ${
                            isSelected 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-transparent hover:border-blue-300'
                          }`}
                          title={method.name}
                        >
                          <div className="relative">
                            <input
                              type="radio"
                              name="payment_method"
                              value={methodCode}
                              checked={isSelected}
                              onChange={(e) => {
                                handleInputChange('payment_method', e.target.value);
                              }}
                              className="sr-only"
                            />
                            <div 
                              className={`h-4 w-4 rounded-full border-2 mb-1 flex items-center justify-center cursor-pointer ${
                                isSelected 
                                    ? 'border-green-600 bg-green-600' 
                                    : 'border-gray-300 bg-white hover:border-green-400'
                              }`}
                              onClick={() => {
                                handleInputChange('payment_method', methodCode);
                              }}
                            >
                              {isSelected && (
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            {method.icon_url ? (
                              <img src={method.icon_url} alt={method.name} className="h-6 w-auto" />
                            ) : methodCode === 'bitcoin' ? (
                              <div className="h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z"/>
                                  <path d="M17.027 9.545c.074-1.5-.74-2.3-2.002-2.83l.41-1.64-1-.25-.4 1.6c-.263-.066-.533-.128-.808-.19l.402-1.61-.999-.25-.41 1.64c-.219-.05-.434-.1-.642-.152l.001-.004-1.35-.338-.26 1.04s.72.165.705.175c.393.098.464.357.452.563l-1.135 4.54c-.034.085-.12.212-.314.164.007.01-.705-.176-.705-.176l-.48 1.12 1.26.315c.234.058.463.12.686.178l-.41 1.64 1 .25.41-1.64c.273.074.536.142.792.206l-.41 1.64 1 .25.41-1.64c1.12.212 1.96.127 2.315-.877.28-.79.14-1.24-.59-1.84.42-.097.736-.373.82-.944zm-2.1 3.1c-.2.8-1.58.368-2.025.26l.36-1.44c.445.11 1.87.064 1.665.18zm.2-3.12c-.18.72-1.29.355-1.65.265l.327-1.31c.36.09 1.52.04 1.323.045z"/>
                                </svg>
                              </div>
                            ) : methodCode === 'cash' ? (
                              <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              </div>
                            ) : (
                              <div className="h-6 w-6 bg-gray-400 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">?</span>
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                {errors.payment_method && (
                  <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
                )}
              </div>

              {/* Estado del Contrato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Contrato *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LEASE_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gastos de la Propiedad */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Gastos de la Propiedad (Opcional)
                  </label>
                  <button
                    type="button"
                    onClick={addExpense}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    + Agregar Gasto
                  </button>
                </div>
                
                {formData.expenses.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
                        {expense.isEditing ? (
                          <>
                            <input
                              type="text"
                              placeholder="Descripción del gasto"
                              value={expense.description}
                              onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={expense.amount}
                              onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => saveExpense(expense.id)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Guardar"
                            >
                              ✓
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm">{expense.description}: S/ {expense.amount.toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => editExpense(expense.id)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Editar"
                            >
                              ✏️
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExpense(expense.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resumen de Ganancias */}
                {formData.expenses.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Monto del alquiler:</span>
                        <span>S/ {totals.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total gastos:</span>
                        <span>S/ {totals.totalExpenses.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-600 border-t pt-1 mt-1">
                        <span>Ganancia neta:</span>
                        <span>S/ {totals.netProfit.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notas adicionales sobre el contrato..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default EditLeaseModal;