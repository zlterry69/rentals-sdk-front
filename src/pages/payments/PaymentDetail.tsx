import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  QrCodeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Mock data
const mockPayment = {
  id: '1',
  publicId: 'pay_xyz789',
  debtor: {
    id: '1',
    publicId: 'debt_abc123',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+1 234 567 8900',
  },
  amount: 1200.00,
  currency: 'USD',
  description: 'Pago de alquiler enero 2024',
  status: 'pending',
  paymentMethod: 'crypto',
  dueDate: '2024-02-15',
  createdAt: '2024-01-15T10:30:00Z',
  cryptoDetails: {
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    amount: 0.00012345,
    currency: 'BTC',
  },
  bankDetails: {
    bankName: 'Banco de Crédito del Perú',
    accountNumber: '1234567890123456',
    accountType: 'Ahorros',
    holderName: 'Sistema de Alquileres S.A.C.',
    cci: '0021231234567890123456',
  },
};

const statusConfig = {
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Pendiente',
  },
  confirmed: {
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Confirmado',
  },
  failed: {
    icon: XCircleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Fallido',
  },
  expired: {
    icon: ExclamationTriangleIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Expirado',
  },
};

const PaymentDetail: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  // In a real app, you would fetch the payment data using the paymentId
  const payment = mockPayment;
  const statusInfo = statusConfig[payment.status as keyof typeof statusConfig];

  const handleGenerateReceipt = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    // In a real app, this would download the receipt
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(payment.cryptoDetails.address);
    // In a real app, you would show a toast notification
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
                Detalle del Pago
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                ID: {payment.publicId}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button
            onClick={handleGenerateReceipt}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <DocumentTextIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            {isLoading ? 'Generando...' : 'Recibo'}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-md p-4 ${statusInfo.bgColor}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <statusInfo.icon className={`h-5 w-5 ${statusInfo.color}`} />
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${statusInfo.color}`}>
              Estado: {statusInfo.label}
            </h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                {payment.status === 'pending' && 'El pago está pendiente de confirmación.'}
                {payment.status === 'confirmed' && 'El pago ha sido confirmado exitosamente.'}
                {payment.status === 'failed' && 'El pago ha fallado. Por favor, inténtalo de nuevo.'}
                {payment.status === 'expired' && 'El pago ha expirado. Crea un nuevo pago.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payment Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Pago</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Inquilino</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {payment.debtor.firstName} {payment.debtor.lastName}
              </dd>
              <dd className="text-sm text-gray-500">{payment.debtor.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Monto</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                ${payment.amount.toLocaleString()} {payment.currency}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Descripción</dt>
              <dd className="mt-1 text-sm text-gray-900">{payment.description}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Método de Pago</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {payment.paymentMethod === 'crypto' ? 'Criptomonedas' : 'Transferencia Bancaria'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fecha de Vencimiento</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(payment.dueDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(payment.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Payment Details */}
        <div className="bg-white shadow rounded-lg p-6">
          {payment.paymentMethod === 'crypto' ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles de Criptomoneda</h3>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Moneda</dt>
                  <dd className="mt-1 text-sm text-gray-900">{payment.cryptoDetails.currency}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Monto en Crypto</dt>
                  <dd className="mt-1 text-sm text-gray-900">{payment.cryptoDetails.amount} {payment.cryptoDetails.currency}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dirección de Pago</dt>
                  <div className="mt-1 flex items-center space-x-2">
                    <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {payment.cryptoDetails.address}
                    </code>
                    <button
                      onClick={handleCopyAddress}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Código QR</dt>
                  <div className="mt-2 flex justify-center">
                    <div className="bg-white p-4 rounded-lg border">
                      <img
                        src={payment.cryptoDetails.qrCode}
                        alt="QR Code"
                        className="h-32 w-32"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles Bancarios</h3>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Banco</dt>
                  <dd className="mt-1 text-sm text-gray-900">{payment.bankDetails.bankName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Titular</dt>
                  <dd className="mt-1 text-sm text-gray-900">{payment.bankDetails.holderName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Número de Cuenta</dt>
                  <dd className="mt-1 text-sm text-gray-900">{payment.bankDetails.accountNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo de Cuenta</dt>
                  <dd className="mt-1 text-sm text-gray-900">{payment.bankDetails.accountType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">CCI</dt>
                  <dd className="mt-1 text-sm text-gray-900">{payment.bankDetails.cci}</dd>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-lg">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Instrucciones de Pago
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              {payment.paymentMethod === 'crypto' ? (
                <ul className="list-disc list-inside space-y-1">
                  <li>Envía exactamente {payment.cryptoDetails.amount} {payment.cryptoDetails.currency} a la dirección mostrada</li>
                  <li>Usa el código QR para escanear la dirección desde tu wallet</li>
                  <li>El pago será confirmado automáticamente en unos minutos</li>
                  <li>No envíes otras criptomonedas a esta dirección</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  <li>Realiza una transferencia bancaria con los datos mostrados</li>
                  <li>Usa el CCI para transferencias interbancarias</li>
                  <li>Incluye el ID del pago ({payment.publicId}) en el concepto</li>
                  <li>El pago será confirmado en 1-2 días hábiles</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
