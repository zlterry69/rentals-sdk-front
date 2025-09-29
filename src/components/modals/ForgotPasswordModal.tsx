import React, { useState } from 'react';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/app/api';
import toast from 'react-hot-toast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToLogin 
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    try {
      setIsLoading(true);
      // Aquí harías la llamada al endpoint de recuperación de contraseña
      // await apiClient.post('/auth/forgot-password', { email });
      
      // Simulamos el envío por ahora
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsEmailSent(true);
      toast.success('Se ha enviado un enlace de recuperación a tu correo');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.detail || 'Error al enviar el enlace de recuperación';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsEmailSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {isEmailSent && (
              <button
                onClick={() => setIsEmailSent(false)}
                className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {isEmailSent ? 'Revisa tu correo' : 'Recuperar contraseña'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {!isEmailSent ? (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <p className="text-center text-sm text-gray-600">
                ¿Recordaste tu contraseña?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </>
        ) : (
          /* Success message */
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Enlace enviado!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
            <div className="space-y-3">
              <button
                onClick={onSwitchToLogin}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Volver al inicio de sesión
              </button>
              <button
                onClick={() => setIsEmailSent(false)}
                className="w-full text-blue-600 hover:text-blue-800 font-medium"
              >
                Enviar a otro correo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
