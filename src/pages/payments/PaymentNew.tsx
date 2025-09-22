import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const paymentSchema = z.object({
  debtorId: z.string().min(1, 'Debes seleccionar un inquilino'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  currency: z.string().min(1, 'Debes seleccionar una moneda'),
  description: z.string().min(1, 'La descripción es requerida'),
  dueDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  paymentMethod: z.enum(['crypto', 'bank_transfer'], {
    required_error: 'Debes seleccionar un método de pago',
  }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

// Mock data
const mockDebtors = [
  { id: '1', publicId: 'debt_abc123', name: 'Juan Pérez', email: 'juan.perez@email.com' },
  { id: '2', publicId: 'debt_def456', name: 'María González', email: 'maria.gonzalez@email.com' },
  { id: '3', publicId: 'debt_ghi789', name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com' },
];

const mockCurrencies = [
  { id: '1', code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { id: '2', code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
  { id: '3', code: 'EUR', name: 'Euro', symbol: '€' },
];

const PaymentNew: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      currency: 'USD',
      paymentMethod: 'crypto',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to payment detail or dashboard
    navigate('/payments');
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Nuevo Pago
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Crea un nuevo pago para un inquilino
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Debtor Selection */}
          <div>
            <label htmlFor="debtorId" className="block text-sm font-medium text-gray-700">
              Inquilino *
            </label>
            <select
              {...register('debtorId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Selecciona un inquilino</option>
              {mockDebtors.map((debtor) => (
                <option key={debtor.id} value={debtor.publicId}>
                  {debtor.name} - {debtor.email}
                </option>
              ))}
            </select>
            {errors.debtorId && (
              <p className="mt-1 text-sm text-red-600">{errors.debtorId.message}</p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Monto *
              </label>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Moneda *
              </label>
              <select
                {...register('currency')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {mockCurrencies.map((currency) => (
                  <option key={currency.id} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Ej: Pago de alquiler enero 2024"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Fecha de Vencimiento *
            </label>
            <input
              {...register('dueDate')}
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Pago *
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value="crypto"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">₿</span>
                    <div>
                      <div className="font-medium">Criptomonedas</div>
                      <div className="text-gray-500 text-xs">Bitcoin, Ethereum, Dogecoin</div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value="bank_transfer"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🏦</span>
                    <div>
                      <div className="font-medium">Transferencia Bancaria</div>
                      <div className="text-gray-500 text-xs">Transferencia tradicional</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Crypto Payment Info */}
          {selectedPaymentMethod === 'crypto' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400 text-lg">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Pago con Criptomonedas
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      El inquilino recibirá un enlace para pagar con criptomonedas.
                      Se generará automáticamente un código QR y dirección de pago.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Info */}
          {selectedPaymentMethod === 'bank_transfer' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400 text-lg">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Transferencia Bancaria
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Se generará un comprobante con los datos bancarios para la transferencia.
                      El inquilino podrá descargar el comprobante con la información necesaria.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Pago'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentNew;
