import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import ProfileImageUpload from '../components/ProfileImageUpload';
import { apiClient, API_ENDPOINTS } from '../app/api';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre completo debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, 'La contraseña actual es requerida'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'payment-methods'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState<boolean | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  
  // Payment methods states
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showEditPaymentMethod, setShowEditPaymentMethod] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: '',
    details: '',
    is_primary: false
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      date_of_birth: user?.date_of_birth || '',
      emergency_contact_name: user?.emergency_contact_name || '',
      emergency_contact_phone: user?.emergency_contact_phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Watch password fields for real-time validation
  const currentPassword = watchPassword('current_password');
  const newPassword = watchPassword('new_password');
  const confirmPassword = watchPassword('confirm_password');

  // Validate current password in real-time
  const validateCurrentPassword = async (password: string) => {
    if (!password || password.length < 3) {
      setCurrentPasswordValid(null);
      return;
    }

    setIsCheckingPassword(true);
    try {
      // Try to validate current password by attempting a dummy change
      await apiClient.post('/auth/validate-password', {
        current_password: password
      });
      setCurrentPasswordValid(true);
    } catch (error) {
      setCurrentPasswordValid(false);
    } finally {
      setIsCheckingPassword(false);
    }
  };

  // Debounced password validation
  React.useEffect(() => {
    if (currentPassword) {
      const timer = setTimeout(() => {
        validateCurrentPassword(currentPassword);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setCurrentPasswordValid(null);
    }
  }, [currentPassword]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsProfileLoading(true);
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      
      // Debug: Log the data being sent
      console.log('Data being sent:', data);
      
      // Add all fields to FormData (including emergency contact fields separately)
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
          console.log(`Added to FormData: ${key} = ${value}`);
        }
      });

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Perfil actualizado correctamente');
      // Refresh user data if needed
      // await updateProfile(profileData);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsPasswordLoading(true);
    try {
      await apiClient.put(API_ENDPOINTS.CHANGE_PASSWORD, {
        current_password: data.current_password,
        new_password: data.new_password
      });
      toast.success('Contraseña actualizada correctamente');
      resetPassword();
      setCurrentPasswordValid(null); // Reset validation state
    } catch (error: any) {
      // Handle specific error messages
      const errorMessage = error.response?.data?.detail || 'Error al cambiar la contraseña';
      
      if (errorMessage.includes('Current password is incorrect')) {
        // Set the validation state to show error next to current password field
        setCurrentPasswordValid(false);
        toast.error('La contraseña actual es incorrecta');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Payment methods functions
  const fetchPaymentMethods = async () => {
    setIsLoadingPaymentMethods(true);
    try {
      const response = await apiClient.get('/payment-accounts/');
      // The endpoint returns a single object, not an array
      const paymentAccount = response.data;
      
      // Convert the payment account object to an array of enabled payment methods
      const methods = [];
      
      if (paymentAccount.accepts_yape && paymentAccount.yape_number) {
        methods.push({
          id: 'yape',
          type: 'Yape',
          details: paymentAccount.yape_number,
          is_primary: true
        });
      }
      
      if (paymentAccount.accepts_plin && paymentAccount.plin_number) {
        methods.push({
          id: 'plin',
          type: 'Plin',
          details: paymentAccount.plin_number,
          is_primary: false
        });
      }
      
      if (paymentAccount.accepts_bitcoin && paymentAccount.bitcoin_wallet) {
        methods.push({
          id: 'bitcoin',
          type: 'Bitcoin',
          details: paymentAccount.bitcoin_wallet,
          is_primary: false
        });
      }
      
      if (paymentAccount.accepts_ethereum && paymentAccount.ethereum_wallet) {
        methods.push({
          id: 'ethereum',
          type: 'Ethereum',
          details: paymentAccount.ethereum_wallet,
          is_primary: false
        });
      }
      
      if (paymentAccount.accepts_usdt && paymentAccount.usdt_wallet) {
        methods.push({
          id: 'usdt',
          type: 'USDT',
          details: paymentAccount.usdt_wallet,
          is_primary: false
        });
      }
      
      if (paymentAccount.accepts_bank_transfer && paymentAccount.bank_account) {
        methods.push({
          id: 'bank',
          type: 'Transferencia Bancaria',
          details: `${paymentAccount.bank_name} - ${paymentAccount.bank_account}`,
          is_primary: false
        });
      }
      
      if (paymentAccount.accepts_mercadopago) {
        methods.push({
          id: 'mercadopago',
          type: 'MercadoPago',
          details: 'Configurado',
          is_primary: false
        });
      }
      
      if (paymentAccount.accepts_izipay) {
        methods.push({
          id: 'izipay',
          type: 'Izipay',
          details: 'Configurado',
          is_primary: false
        });
      }
      
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Error al cargar métodos de pago');
      setPaymentMethods([]); // Ensure it's always an array
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!newPaymentMethod.type || !newPaymentMethod.details) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      // First get current payment account
      const currentResponse = await apiClient.get('/payment-accounts/');
      const currentAccount = currentResponse.data;
      
      // Prepare update data based on the method type
      const updateData: any = {
        accepts_yape: currentAccount.accepts_yape,
        accepts_plin: currentAccount.accepts_plin,
        accepts_bitcoin: currentAccount.accepts_bitcoin,
        accepts_ethereum: currentAccount.accepts_ethereum,
        accepts_usdt: currentAccount.accepts_usdt,
        accepts_bank_transfer: currentAccount.accepts_bank_transfer,
        accepts_mercadopago: currentAccount.accepts_mercadopago,
        accepts_izipay: currentAccount.accepts_izipay,
        yape_number: currentAccount.yape_number,
        plin_number: currentAccount.plin_number,
        bitcoin_wallet: currentAccount.bitcoin_wallet,
        ethereum_wallet: currentAccount.ethereum_wallet,
        usdt_wallet: currentAccount.usdt_wallet,
        bank_account: currentAccount.bank_account,
        bank_name: currentAccount.bank_name,
        bank_holder_name: currentAccount.bank_holder_name,
      };
      
      // Update based on method type
      switch (newPaymentMethod.type.toLowerCase()) {
        case 'yape':
          updateData.accepts_yape = true;
          updateData.yape_number = newPaymentMethod.details;
          break;
        case 'plin':
          updateData.accepts_plin = true;
          updateData.plin_number = newPaymentMethod.details;
          break;
        case 'bitcoin':
          updateData.accepts_bitcoin = true;
          updateData.bitcoin_wallet = newPaymentMethod.details;
          break;
        case 'ethereum':
          updateData.accepts_ethereum = true;
          updateData.ethereum_wallet = newPaymentMethod.details;
          break;
        case 'usdt':
          updateData.accepts_usdt = true;
          updateData.usdt_wallet = newPaymentMethod.details;
          break;
        case 'transferencia bancaria':
          updateData.accepts_bank_transfer = true;
          updateData.bank_account = newPaymentMethod.details;
          updateData.bank_name = 'Banco'; // You might want to add a bank name field
          break;
        case 'mercadopago':
          updateData.accepts_mercadopago = true;
          break;
        case 'izipay':
          updateData.accepts_izipay = true;
          break;
      }
      
      await apiClient.put('/payment-accounts/', updateData);
      toast.success('Método de pago agregado correctamente');
      setNewPaymentMethod({ type: '', details: '', is_primary: false });
      setShowAddPaymentMethod(false);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Error al agregar método de pago');
    }
  };

  const editPaymentMethod = (method: any) => {
    setEditingPaymentMethod(method);
    setShowEditPaymentMethod(true);
  };

  const updatePaymentMethod = async () => {
    if (!editingPaymentMethod.type || !editingPaymentMethod.details) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      // First get current payment account
      const currentResponse = await apiClient.get('/payment-accounts/');
      const currentAccount = currentResponse.data;
      
      // Prepare update data based on the method type
      const updateData: any = {
        accepts_yape: currentAccount.accepts_yape,
        accepts_plin: currentAccount.accepts_plin,
        accepts_bitcoin: currentAccount.accepts_bitcoin,
        accepts_ethereum: currentAccount.accepts_ethereum,
        accepts_usdt: currentAccount.accepts_usdt,
        accepts_bank_transfer: currentAccount.accepts_bank_transfer,
        accepts_mercadopago: currentAccount.accepts_mercadopago,
        accepts_izipay: currentAccount.accepts_izipay,
        yape_number: currentAccount.yape_number,
        plin_number: currentAccount.plin_number,
        bitcoin_wallet: currentAccount.bitcoin_wallet,
        ethereum_wallet: currentAccount.ethereum_wallet,
        usdt_wallet: currentAccount.usdt_wallet,
        bank_account: currentAccount.bank_account,
        bank_name: currentAccount.bank_name,
        bank_holder_name: currentAccount.bank_holder_name,
      };
      
      // First disable the old method type
      const oldMethodType = paymentMethods.find(m => m.id === editingPaymentMethod.id)?.type;
      if (oldMethodType) {
        switch (oldMethodType) {
          case 'Yape':
            updateData.accepts_yape = false;
            updateData.yape_number = null;
            break;
          case 'Plin':
            updateData.accepts_plin = false;
            updateData.plin_number = null;
            break;
          case 'Bitcoin':
            updateData.accepts_bitcoin = false;
            updateData.bitcoin_wallet = null;
            break;
          case 'Ethereum':
            updateData.accepts_ethereum = false;
            updateData.ethereum_wallet = null;
            break;
          case 'USDT':
            updateData.accepts_usdt = false;
            updateData.usdt_wallet = null;
            break;
          case 'Transferencia Bancaria':
            updateData.accepts_bank_transfer = false;
            updateData.bank_account = null;
            updateData.bank_name = null;
            break;
          case 'MercadoPago':
            updateData.accepts_mercadopago = false;
            break;
          case 'Izipay':
            updateData.accepts_izipay = false;
            break;
        }
      }
      
      // Then enable the new method type
      switch (editingPaymentMethod.type) {
        case 'Yape':
          updateData.accepts_yape = true;
          updateData.yape_number = editingPaymentMethod.details;
          break;
        case 'Plin':
          updateData.accepts_plin = true;
          updateData.plin_number = editingPaymentMethod.details;
          break;
        case 'Bitcoin':
          updateData.accepts_bitcoin = true;
          updateData.bitcoin_wallet = editingPaymentMethod.details;
          break;
        case 'Ethereum':
          updateData.accepts_ethereum = true;
          updateData.ethereum_wallet = editingPaymentMethod.details;
          break;
        case 'USDT':
          updateData.accepts_usdt = true;
          updateData.usdt_wallet = editingPaymentMethod.details;
          break;
        case 'Transferencia Bancaria':
          updateData.accepts_bank_transfer = true;
          updateData.bank_account = editingPaymentMethod.details;
          updateData.bank_name = 'Banco';
          break;
        case 'MercadoPago':
          updateData.accepts_mercadopago = true;
          break;
        case 'Izipay':
          updateData.accepts_izipay = true;
          break;
      }
      
      await apiClient.put('/payment-accounts/', updateData);
      toast.success('Método de pago actualizado correctamente');
      setEditingPaymentMethod(null);
      setShowEditPaymentMethod(false);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Error al actualizar método de pago');
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      // First get current payment account
      const currentResponse = await apiClient.get('/payment-accounts/');
      const currentAccount = currentResponse.data;
      
      // Prepare update data to disable the specific method
      const updateData: any = {
        accepts_yape: currentAccount.accepts_yape,
        accepts_plin: currentAccount.accepts_plin,
        accepts_bitcoin: currentAccount.accepts_bitcoin,
        accepts_ethereum: currentAccount.accepts_ethereum,
        accepts_usdt: currentAccount.accepts_usdt,
        accepts_bank_transfer: currentAccount.accepts_bank_transfer,
        accepts_mercadopago: currentAccount.accepts_mercadopago,
        accepts_izipay: currentAccount.accepts_izipay,
        yape_number: currentAccount.yape_number,
        plin_number: currentAccount.plin_number,
        bitcoin_wallet: currentAccount.bitcoin_wallet,
        ethereum_wallet: currentAccount.ethereum_wallet,
        usdt_wallet: currentAccount.usdt_wallet,
        bank_account: currentAccount.bank_account,
        bank_name: currentAccount.bank_name,
        bank_holder_name: currentAccount.bank_holder_name,
      };
      
      // Disable the specific method
      switch (id) {
        case 'yape':
          updateData.accepts_yape = false;
          updateData.yape_number = null;
          break;
        case 'plin':
          updateData.accepts_plin = false;
          updateData.plin_number = null;
          break;
        case 'bitcoin':
          updateData.accepts_bitcoin = false;
          updateData.bitcoin_wallet = null;
          break;
        case 'ethereum':
          updateData.accepts_ethereum = false;
          updateData.ethereum_wallet = null;
          break;
        case 'usdt':
          updateData.accepts_usdt = false;
          updateData.usdt_wallet = null;
          break;
        case 'bank':
          updateData.accepts_bank_transfer = false;
          updateData.bank_account = null;
          updateData.bank_name = null;
          break;
        case 'mercadopago':
          updateData.accepts_mercadopago = false;
          break;
        case 'izipay':
          updateData.accepts_izipay = false;
          break;
      }
      
      await apiClient.put('/payment-accounts/', updateData);
      toast.success('Método de pago eliminado correctamente');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Error al eliminar método de pago');
    }
  };

  // Load payment methods when tab is active
  React.useEffect(() => {
    if (activeTab === 'payment-methods') {
      fetchPaymentMethods();
    }
  }, [activeTab]);

const tabs = [
  { id: 'profile', name: 'Perfil', icon: '👤' },
  { id: 'password', name: 'Contraseña', icon: '🔒' },
  { id: 'notifications', name: 'Notificaciones', icon: '🔔' },
  { id: 'payment-methods', name: 'Métodos de Pago', icon: '💳' },
];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Mi Perfil
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="p-6 space-y-6">
            {/* Profile Image Upload */}
            <div className="flex justify-center">
              <ProfileImageUpload
                currentImageUrl={user?.profile_image}
                onImageUpdate={(imageUrl) => {
                  // Update user context if needed
                  console.log('Image updated:', imageUrl);
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="full_name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre Completo *
                </label>
                <input
                  {...registerProfile('full_name')}
                  type="text"
                  className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Ingresa tu nombre completo"
                />
                {profileErrors.full_name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {profileErrors.full_name.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="block w-full px-4 py-3 text-gray-500 bg-gray-100 border border-gray-300 rounded-xl shadow-sm cursor-not-allowed"
                  placeholder="tu@email.com"
                />
                <p className="mt-1 text-xs text-gray-500">El correo electrónico no se puede modificar</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                  Teléfono
                </label>
                <input
                  {...registerProfile('phone')}
                  type="tel"
                  className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="+51 999 888 777"
                />
                {profileErrors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {profileErrors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-900 mb-2">
                  Fecha de Nacimiento
                </label>
                <input
                  {...registerProfile('date_of_birth')}
                  type="date"
                  className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
                {profileErrors.date_of_birth && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {profileErrors.date_of_birth.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                  Dirección
                </label>
                <input
                  {...registerProfile('address')}
                  type="text"
                  className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Av. Ejemplo 123, Lima, Perú"
                />
                {profileErrors.address && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {profileErrors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="emergency_contact_name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre del Contacto de Emergencia
                </label>
                <input
                  {...registerProfile('emergency_contact_name')}
                  type="text"
                  className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Nombre completo"
                />
                {profileErrors.emergency_contact_name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {profileErrors.emergency_contact_name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="emergency_contact_phone" className="block text-sm font-semibold text-gray-900 mb-2">
                  Teléfono del Contacto de Emergencia
                </label>
                <input
                  {...registerProfile('emergency_contact_phone')}
                  type="tel"
                  className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="+51 999 888 777"
                />
                {profileErrors.emergency_contact_phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {profileErrors.emergency_contact_phone.message}
                  </p>
                )}
              </div>

            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => resetProfile()}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="p-6 space-y-6">
            <div>
              <label htmlFor="current_password" className="block text-sm font-semibold text-gray-900 mb-2">
                Contraseña Actual *
              </label>
              <div className="relative">
                <input
                  {...registerPassword('current_password')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="block w-full px-4 py-3 pr-12 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {/* Real-time validation indicator */}
                {currentPassword && currentPassword.length > 3 && (
                  <div className="absolute inset-y-0 right-10 flex items-center pr-3">
                    {isCheckingPassword ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : currentPasswordValid === true ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : currentPasswordValid === false ? (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              
              {/* Real-time validation message */}
              {currentPasswordValid === false && (
                <div className="mt-2 relative">
                  <div className="absolute left-4 -top-1 w-3 h-3 bg-red-500 rotate-45 transform"></div>
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-sm">
                    <p className="text-sm text-red-700 flex items-center font-medium">
                      <XCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      Tu contraseña actual es incorrecta. Inténtalo de nuevo.
                    </p>
                  </div>
                </div>
              )}
              {currentPasswordValid === true && (
                <div className="mt-2 relative">
                  <div className="absolute left-4 -top-1 w-3 h-3 bg-green-500 rotate-45 transform"></div>
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-sm">
                    <p className="text-sm text-green-700 flex items-center font-medium">
                      <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      Contraseña actual verificada ✓
                    </p>
                  </div>
                </div>
              )}
              {passwordErrors.current_password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {passwordErrors.current_password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="new_password" className="block text-sm font-semibold text-gray-900 mb-2">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  {...registerPassword('new_password')}
                  type={showNewPassword ? 'text' : 'password'}
                  className="block w-full px-4 py-3 pr-12 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordErrors.new_password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {passwordErrors.new_password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  {...registerPassword('confirm_password')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="block w-full px-4 py-3 pr-12 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Real-time password match validation */}
              {confirmPassword && newPassword && confirmPassword !== newPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Las contraseñas no coinciden
                </p>
              )}
              {confirmPassword && newPassword && confirmPassword === newPassword && confirmPassword.length >= 6 && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Las contraseñas coinciden
                </p>
              )}
              {passwordErrors.confirm_password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {passwordErrors.confirm_password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => resetPassword()}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPasswordLoading || currentPasswordValid !== true}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isPasswordLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cambiando...
                  </div>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Preferencias de Notificaciones</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notificaciones por Email</h4>
                    <p className="text-sm text-gray-500">Recibe notificaciones importantes por correo electrónico</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Pagos Pendientes</h4>
                    <p className="text-sm text-gray-500">Notificaciones cuando hay pagos pendientes</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Contratos por Vencer</h4>
                    <p className="text-sm text-gray-500">Avisos antes de que expiren los contratos</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Nuevos Inquilinos</h4>
                    <p className="text-sm text-gray-500">Notificaciones cuando se registren nuevos inquilinos</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Reportes Mensuales</h4>
                    <p className="text-sm text-gray-500">Resumen mensual de ingresos y estadísticas</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment-methods' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Métodos de Pago</h3>
              <button
                onClick={() => setShowAddPaymentMethod(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Agregar Método de Pago
              </button>
            </div>

            {isLoadingPaymentMethods ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No hay métodos de pago</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Agrega métodos de pago para recibir pagos de tus huéspedes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {method.type === 'Yape' && (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src="/yape.png" 
                                alt="Yape" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {method.type === 'Plin' && (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src="/plin.jpg" 
                                alt="Plin" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {method.type === 'Bitcoin' && (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src="/usdt.png" 
                                alt="Bitcoin" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {method.type === 'Ethereum' && (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src="/usdt.png" 
                                alt="Ethereum" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {method.type === 'USDT' && (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src="/usdt.png" 
                                alt="USDT" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {method.type === 'Transferencia Bancaria' && (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-sm">🏦</span>
                            </div>
                          )}
                          {method.type === 'MercadoPago' && (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src="/mercado_pago.jpg" 
                                alt="MercadoPago" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {method.type === 'Izipay' && (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src="/izipay.png" 
                                alt="Izipay" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {!['Yape', 'Plin', 'Bitcoin', 'Ethereum', 'USDT', 'Transferencia Bancaria', 'MercadoPago', 'Izipay'].includes(method.type) && (
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-bold text-sm">💳</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 capitalize">
                            {method.type}
                          </h4>
                          <p className="text-sm text-gray-500">{method.details}</p>
                          {method.is_primary && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Principal
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editPaymentMethod(method)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                          title="Editar método de pago"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deletePaymentMethod(method.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Eliminar método de pago"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Payment Method Modal */}
            {showAddPaymentMethod && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Agregar Método de Pago</h3>
                    <button
                      onClick={() => setShowAddPaymentMethod(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Pago
                      </label>
                      <select
                        value={newPaymentMethod.type}
                        onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecciona un tipo</option>
                        <option value="Yape">Yape</option>
                        <option value="Plin">Plin</option>
                        <option value="Bitcoin">Bitcoin</option>
                        <option value="Ethereum">Ethereum</option>
                        <option value="USDT">USDT</option>
                        <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                        <option value="MercadoPago">MercadoPago</option>
                        <option value="Izipay">Izipay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detalles
                      </label>
                      <textarea
                        value={newPaymentMethod.details}
                        onChange={(e) => setNewPaymentMethod({...newPaymentMethod, details: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Ejemplo: Número de teléfono, número de cuenta, CCI, etc."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Especifica los detalles necesarios para recibir pagos (número de teléfono, cuenta, CCI, etc.)
                      </p>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_primary"
                        checked={newPaymentMethod.is_primary}
                        onChange={(e) => setNewPaymentMethod({...newPaymentMethod, is_primary: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
                        Marcar como método principal
                      </label>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAddPaymentMethod(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={addPaymentMethod}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Payment Method Modal */}
            {showEditPaymentMethod && editingPaymentMethod && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Editar Método de Pago</h3>
                    <button
                      onClick={() => {
                        setShowEditPaymentMethod(false);
                        setEditingPaymentMethod(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Pago
                      </label>
                      <select
                        value={editingPaymentMethod.type}
                        onChange={(e) => setEditingPaymentMethod({...editingPaymentMethod, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecciona un tipo</option>
                        <option value="Yape">Yape</option>
                        <option value="Plin">Plin</option>
                        <option value="Bitcoin">Bitcoin</option>
                        <option value="Ethereum">Ethereum</option>
                        <option value="USDT">USDT</option>
                        <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                        <option value="MercadoPago">MercadoPago</option>
                        <option value="Izipay">Izipay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detalles
                      </label>
                      <textarea
                        value={editingPaymentMethod.details}
                        onChange={(e) => setEditingPaymentMethod({...editingPaymentMethod, details: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Ejemplo: Número de teléfono, número de cuenta, CCI, etc."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Especifica los detalles necesarios para recibir pagos (número de teléfono, cuenta, CCI, etc.)
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowEditPaymentMethod(false);
                        setEditingPaymentMethod(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={updatePaymentMethod}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
