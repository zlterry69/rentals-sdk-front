import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Mock data
const mockDebtor = {
  id: '1',
  publicId: 'debt_abc123',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@email.com',
  phone: '+1 234 567 8900',
  documentType: 'DNI',
  documentNumber: '12345678',
  address: 'Av. Principal 123, Lima',
  status: 'active',
  createdAt: '2024-01-15',
  totalDebt: 2500.00,
  lastPayment: '2024-01-10',
  payments: [
    {
      id: '1',
      publicId: 'pay_xyz789',
      amount: 1200.00,
      currency: 'USD',
      description: 'Pago de alquiler enero 2024',
      status: 'confirmed',
      createdAt: '2024-01-10T10:30:00Z',
    },
    {
      id: '2',
      publicId: 'pay_abc456',
      amount: 1200.00,
      currency: 'USD',
      description: 'Pago de alquiler febrero 2024',
      status: 'pending',
      createdAt: '2024-02-01T10:30:00Z',
    },
  ],
  leases: [
    {
      id: '1',
      publicId: 'lease_abc123',
      unit: {
        name: 'Departamento 101',
        address: 'Av. Principal 123, Lima',
      },
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyRent: 1200.00,
      currency: 'USD',
      status: 'active',
    },
  ],
};

const DebtorDetail: React.FC = () => {
  const { debtorId } = useParams<{ debtorId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  // In a real app, you would fetch the debtor data using the debtorId
  const debtor = mockDebtor;

  const handleEdit = () => {
    navigate(`/debtors/${debtor.publicId}/edit`);
  };

  const handleNewPayment = () => {
    navigate(`/payments/new?debtorId=${debtor.publicId}`);
  };

  const handleViewPayment = (paymentId: string) => {
    navigate(`/payments/${paymentId}`);
  };

  const handleViewLease = (leaseId: string) => {
    navigate(`/leases/${leaseId}`);
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
                {debtor.firstName} {debtor.lastName}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                ID: {debtor.publicId}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button
            onClick={handleNewPayment}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nuevo Pago
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Editar
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-md p-4 ${
        debtor.status === 'active' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <span className={`text-lg ${
              debtor.status === 'active' ? 'text-green-400' : 'text-red-400'
            }`}>
              {debtor.status === 'active' ? '✓' : '✗'}
            </span>
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              debtor.status === 'active' ? 'text-green-800' : 'text-red-800'
            }`}>
              Estado: {debtor.status === 'active' ? 'Activo' : 'Inactivo'}
            </h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                {debtor.status === 'active' 
                  ? 'El inquilino está activo y puede realizar pagos.'
                  : 'El inquilino está inactivo. No puede realizar pagos.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Debtor Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {debtor.firstName} {debtor.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{debtor.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900">{debtor.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Documento</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {debtor.documentType}: {debtor.documentNumber}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                <dd className="mt-1 text-sm text-gray-900">{debtor.address}</dd>
              </div>
            </dl>
          </div>

          {/* Recent Payments */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Pagos Recientes</h3>
              <button
                onClick={handleNewPayment}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Ver todos →
              </button>
            </div>
            <div className="space-y-4">
              {debtor.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => handleViewPayment(payment.publicId)}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{payment.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${payment.amount.toLocaleString()} {payment.currency}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'confirmed' ? 'Confirmado' : 
                         payment.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Deuda Total</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  ${debtor.totalDebt.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Último Pago</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(debtor.lastPayment).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Miembro desde</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(debtor.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Active Leases */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contratos Activos</h3>
            <div className="space-y-4">
              {debtor.leases.map((lease) => (
                <div key={lease.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                     onClick={() => handleViewLease(lease.publicId)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lease.unit.name}</p>
                      <p className="text-sm text-gray-500">{lease.unit.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${lease.monthlyRent.toLocaleString()}/{lease.currency}
                      </p>
                      <p className="text-xs text-gray-500">
                        Vence: {new Date(lease.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button
                onClick={handleNewPayment}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Nuevo Pago
              </button>
              <button
                onClick={handleEdit}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Editar Perfil
              </button>
              <button
                onClick={() => navigate(`/debtors/${debtor.publicId}/history`)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <DocumentTextIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Historial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtorDetail;
