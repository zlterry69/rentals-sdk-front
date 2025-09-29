import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { api } from '@/app/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onSwitchToRegister, 
  onSwitchToForgotPassword 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password, rememberMe });
      toast.success('¡Bienvenido!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRememberMe(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded-sm"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">HogarPeru</h2>
                <p className="text-xs text-gray-500">Tu hogar, tu elección</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="terry@test.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Recordarme
              </label>
            </div>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          {/* Welcome message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">¡Bienvenido a HogarPeru!</span>{' '}
              Encuentra tu hogar ideal o comparte el tuyo con otros viajeros.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <p className="text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
