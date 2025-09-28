import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const error = searchParams.get('error');
  const invoiceId = searchParams.get('invoice_id');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'expired':
        return 'El tiempo para completar el pago ha expirado.';
      case 'cancelled':
        return 'El pago fue cancelado por el usuario.';
      case 'insufficient_funds':
        return 'Fondos insuficientes para completar la transacción.';
      case 'invalid_card':
        return 'Los datos de la tarjeta son inválidos.';
      case 'network_error':
        return 'Error de conexión. Por favor intenta nuevamente.';
      default:
        return 'Ocurrió un error inesperado durante el procesamiento del pago.';
    }
  };

  const retryPayment = () => {
    // Go back to the property page to retry payment
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Error Header */}
          <div className="bg-red-50 px-6 py-8 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pago No Completado
            </h1>
            <p className="text-gray-600">
              No pudimos procesar tu pago
            </p>
          </div>

          {/* Error Details */}
          <div className="px-6 py-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error en el pago
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{getErrorMessage(error)}</p>
                  </div>
                </div>
              </div>
            </div>

            {invoiceId && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Referencia
                </label>
                <p className="text-gray-900 font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                  {invoiceId}
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-yellow-800 text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ¿Qué puedes hacer?
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Verifica que tus datos de pago sean correctos</li>
                      <li>Asegúrate de tener fondos suficientes</li>
                      <li>Intenta con otro método de pago</li>
                      <li>Contacta a tu banco si el problema persiste</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={retryPayment}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Intentar Nuevamente
              </button>
              
              <Link
                to="/properties"
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver a Propiedades
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className="px-6 py-4 bg-blue-50 border-t">
            <div className="text-center">
              <p className="text-sm text-blue-800 mb-2">
                ¿Necesitas ayuda? Nuestro equipo de soporte está aquí para ayudarte
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <Link 
                  to="/contact" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Contactar Soporte
                </Link>
                <span className="text-blue-400">|</span>
                <a 
                  href="mailto:soporte@hogarPeru.com" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  soporte@hogarPeru.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
