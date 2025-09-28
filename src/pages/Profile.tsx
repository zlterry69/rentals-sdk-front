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
  emergency_contact: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState<boolean | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

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
      emergency_contact: user?.emergency_contact || '',
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
    try {
      await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, data);
      toast.success('Perfil actualizado correctamente');
      // Refresh user data if needed
      // await updateProfile(data);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
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

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: '👤' },
    { id: 'password', name: 'Contraseña', icon: '🔒' },
    { id: 'notifications', name: 'Notificaciones', icon: '🔔' },
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

              <div className="sm:col-span-2">
                <label htmlFor="emergency_contact" className="block text-sm font-semibold text-gray-900 mb-2">
                  Contacto de Emergencia
                </label>
                <input
                  {...registerProfile('emergency_contact')}
                  type="text"
                  className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Nombre y teléfono de contacto"
                />
                {profileErrors.emergency_contact && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {profileErrors.emergency_contact.message}
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
    </div>
  );
};

export default Profile;
