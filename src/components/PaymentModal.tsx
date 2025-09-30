import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '../app/api';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  type: 'traditional' | 'crypto';
  isActive: boolean;
  icon_url?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  paymentId?: string;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  onPayLater?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency,
  paymentId,
  onPaymentMethodSelect,
  onPayLater
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'traditional' | 'crypto'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices/payment-methods');
      const methods = response.data;
      
      // Convertir la respuesta a métodos de pago
      const formattedMethods: PaymentMethod[] = [];
      
      if (methods && Array.isArray(methods)) {
        methods.forEach((method: any) => {
          formattedMethods.push({
            id: method.id || method.code,
            name: method.name,
            code: method.code,
            type: method.type || 'traditional',
            isActive: method.is_active !== false
          });
        });
      }
      
      setPaymentMethods(formattedMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback methods if no data
      setPaymentMethods([
        { id: 'yape', name: 'Yape', code: 'yape', type: 'traditional', isActive: true },
        { id: 'plin', name: 'Plin', code: 'plin', type: 'traditional', isActive: true },
        { id: 'cash', name: 'Efectivo', code: 'cash', type: 'traditional', isActive: true },
        { id: 'bitcoin', name: 'Bitcoin', code: 'bitcoin', type: 'crypto', isActive: true },
        { id: 'ethereum', name: 'Ethereum', code: 'ethereum', type: 'crypto', isActive: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMethods = paymentMethods.filter(method => 
    selectedType === 'all' || method.type === selectedType
  );

  const traditionalMethods = paymentMethods.filter(m => m.type === 'traditional');
  const cryptoMethods = paymentMethods.filter(m => m.type === 'crypto');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Selecciona método de pago
            </h3>
            <p className="text-gray-600 mt-1">
              Total a pagar: <span className="font-semibold">{currency} {amount}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todos ({paymentMethods.length})
            </button>
            <button
              onClick={() => setSelectedType('traditional')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedType === 'traditional'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tradicionales ({traditionalMethods.length})
            </button>
            <button
              onClick={() => setSelectedType('crypto')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedType === 'crypto'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cripto ({cryptoMethods.length})
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => onPaymentMethodSelect(method)}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      method.type === 'crypto' 
                        ? 'bg-orange-100 text-orange-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {method.icon_url ? (
                        <img 
                          src={method.icon_url} 
                          alt={method.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="font-bold text-lg">
                          {method.type === 'crypto' ? '₿' : method.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          method.type === 'crypto'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {method.type === 'crypto' ? 'Cripto' : 'Tradicional'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {method.name} - {method.type === 'crypto' ? 'Criptomoneda' : 'Método tradicional'}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}

              {filteredMethods.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No hay métodos de pago disponibles
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Todos los pagos son seguros y encriptados
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Aquí se manejará "Pagar después"
                  if (onPayLater) {
                    onPayLater();
                  }
                  onClose();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Pagar después
              </button>
              <button
                onClick={() => {
                  // Aquí se manejará "Pagar ahora" - se seleccionará el método de pago
                  if (filteredMethods.length > 0) {
                    onPaymentMethodSelect(filteredMethods[0]);
                  }
                }}
                disabled={filteredMethods.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Pagar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
