import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// Mock data
const mockPayments = [
  {
    id: '1',
    publicId: 'pay_xyz789',
    debtor: {
      id: '1',
      publicId: 'debt_abc123',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
    },
    amount: 1200.00,
    currency: 'USD',
    description: 'Pago de alquiler enero 2024',
    status: 'confirmed',
    paymentMethod: 'crypto',
    dueDate: '2024-02-15',
    createdAt: '2024-01-15T10:30:00Z',
    confirmedAt: '2024-01-15T11:45:00Z',
  },
  {
    id: '2',
    publicId: 'pay_abc456',
    debtor: {
      id: '2',
      publicId: 'debt_def456',
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
    },
    amount: 1800.00,
    currency: 'USD',
    description: 'Pago de alquiler febrero 2024',
    status: 'pending',
    paymentMethod: 'bank_transfer',
    dueDate: '2024-02-20',
    createdAt: '2024-02-01T10:30:00Z',
    confirmedAt: null,
  },
  {
    id: '3',
    publicId: 'pay_def789',
    debtor: {
      id: '3',
      publicId: 'debt_ghi789',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
    },
    amount: 800.00,
    currency: 'USD',
    description: 'Pago de alquiler marzo 2024',
    status: 'failed',
    paymentMethod: 'crypto',
    dueDate: '2024-03-01',
    createdAt: '2024-02-15T10:30:00Z',
    confirmedAt: null,
  },
];

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  failed: 'Fallido',
  expired: 'Expirado',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
};

const methodLabels = {
  crypto: 'Criptomonedas',
  bank_transfer: 'Transferencia Bancaria',
};

const PaymentsList: React.FC = () => {
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Pagos
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona todos los pagos de tus inquilinos
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/payments/new"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nuevo Pago
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Buscar
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Inquilino o descripción"
              />
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="failed">Fallido</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700">
              Método
            </label>
            <select
              id="method"
              name="method"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Todos los métodos</option>
              <option value="crypto">Criptomonedas</option>
              <option value="bank_transfer">Transferencia Bancaria</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Pagos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockPayments.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Confirmados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockPayments.filter(p => p.status === 'confirmed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">!</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pendientes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockPayments.filter(p => p.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingreso Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${mockPayments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {mockPayments.map((payment) => {
            const daysUntilDue = getDaysUntilDue(payment.dueDate);
            
            return (
              <li key={payment.id}>
                <Link
                  to={`/payments/${payment.publicId}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {payment.debtor.firstName[0]}{payment.debtor.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {payment.debtor.firstName} {payment.debtor.lastName}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.status as keyof typeof statusColors]}`}>
                            {statusLabels[payment.status as keyof typeof statusLabels]}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <p>{payment.description}</p>
                          <span className="mx-2">•</span>
                          <p>{methodLabels[payment.paymentMethod as keyof typeof methodLabels]}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${payment.amount.toLocaleString()} {payment.currency}
                        </p>
                        <div className="flex items-center space-x-4">
                          <p>
                            Vence: {new Date(payment.dueDate).toLocaleDateString()}
                            {daysUntilDue > 0 && (
                              <span className={`ml-1 text-xs ${daysUntilDue <= 7 ? 'text-red-600' : 'text-gray-500'}`}>
                                ({daysUntilDue} días)
                              </span>
                            )}
                          </p>
                          <p>
                            Creado: {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Anterior
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a{' '}
              <span className="font-medium">{mockPayments.length}</span> de{' '}
              <span className="font-medium">{mockPayments.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Anterior
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsList;
