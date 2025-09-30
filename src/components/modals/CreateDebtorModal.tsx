import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { api } from '@/app/api';
import { toast } from 'react-hot-toast';

interface Property {
  id: string;
  title: string;
  address: string;
}

interface CreateDebtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDebtorCreated: () => void;
  isCreating: boolean;
}

const CreateDebtorModal: React.FC<CreateDebtorModalProps> = ({
  isOpen,
  onClose,
  onDebtorCreated,
  isCreating
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    property_id: '',
    monthly_rent: '',
    check_in_date: '',
    check_out_date: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await api.get('/units/my-units');
      setProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error al cargar propiedades');
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.property_id) {
      newErrors.property_id = 'Debe seleccionar una propiedad';
    }

    if (!formData.monthly_rent || parseFloat(formData.monthly_rent) <= 0) {
      newErrors.monthly_rent = 'La renta mensual debe ser mayor a 0';
    }

    if (!formData.check_in_date) {
      newErrors.check_in_date = 'La fecha de inicio es requerida';
    }

    if (!formData.check_out_date) {
      newErrors.check_out_date = 'La fecha de fin es requerida';
    }

    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      if (checkOut <= checkIn) {
        newErrors.check_out_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
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
      // Crear el usuario primero
      const userData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: 'temp_password_123', // Contraseña temporal
        role: 'user'
      };

      const userResponse = await api.post('/admin/users', userData);
      const userId = userResponse.data.id;

      // Crear el debtor asociado a la propiedad
      const debtorData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        property_id: formData.property_id,
        monthly_rent: parseFloat(formData.monthly_rent),
        debt_amount: 0,
        status: 'current',
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date
      };

      await api.post('/debtors', debtorData);

      toast.success('Inquilino creado exitosamente');
      onDebtorCreated();
      handleClose();
    } catch (error: any) {
      console.error('Error creating debtor:', error);
      toast.error(error.response?.data?.detail || 'Error al crear el inquilino');
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      property_id: '',
      monthly_rent: '',
      check_in_date: '',
      check_out_date: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={handleClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Crear Nuevo Inquilino
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Información Personal */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      <span className="mr-2">👤</span>
                      Información Personal
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.full_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa el nombre completo"
                      />
                      {errors.full_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="correo@ejemplo.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="999123456"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Información del Alquiler */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      <HomeIcon className="h-4 w-4 mr-2" />
                      Información del Alquiler
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Propiedad *
                      </label>
                      <select
                        name="property_id"
                        value={formData.property_id}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.property_id ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={loadingProperties}
                      >
                        <option value="">Selecciona una propiedad</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Renta Mensual (S/) *
                      </label>
                      <input
                        type="number"
                        name="monthly_rent"
                        value={formData.monthly_rent}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.monthly_rent ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="1500.00"
                        min="0"
                        step="0.01"
                      />
                      {errors.monthly_rent && (
                        <p className="mt-1 text-sm text-red-600">{errors.monthly_rent}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Inicio *
                        </label>
                        <input
                          type="date"
                          name="check_in_date"
                          value={formData.check_in_date}
                          onChange={handleInputChange}
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.check_in_date ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.check_in_date && (
                          <p className="mt-1 text-sm text-red-600">{errors.check_in_date}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Fin *
                        </label>
                        <input
                          type="date"
                          name="check_out_date"
                          value={formData.check_out_date}
                          onChange={handleInputChange}
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.check_out_date ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.check_out_date && (
                          <p className="mt-1 text-sm text-red-600">{errors.check_out_date}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isCreating ? 'Creando...' : 'Crear Inquilino'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateDebtorModal;
