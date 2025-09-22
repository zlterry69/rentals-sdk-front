import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// Mock data
const mockLeases = [
  {
    id: '1',
    publicId: 'lease_abc123',
    unit: {
      id: '1',
      publicId: 'unit_abc123',
      name: 'Departamento 101',
      address: 'Av. Principal 123, Lima',
    },
    tenant: {
      id: '1',
      publicId: 'debt_abc123',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
    },
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyRent: 1200.00,
    currency: 'USD',
    deposit: 2400.00,
    status: 'active',
    paymentDay: 1,
    createdAt: '2023-12-15T10:30:00Z',
    lastPayment: '2024-01-01',
    nextPayment: '2024-02-01',
  },
  {
    id: '2',
    publicId: 'lease_def456',
    unit: {
      id: '2',
      publicId: 'unit_def456',
      name: 'Casa 202',
      address: 'Calle Secundaria 456, Lima',
    },
    tenant: {
      id: '2',
      publicId: 'debt_def456',
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
    },
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    monthlyRent: 1800.00,
    currency: 'USD',
    deposit: 3600.00,
    status: 'active',
    paymentDay: 15,
    createdAt: '2023-12-20T14:15:00Z',
    lastPayment: '2024-01-15',
    nextPayment: '2024-02-15',
  },
  {
    id: '3',
    publicId: 'lease_ghi789',
    unit: {
      id: '3',
      publicId: 'unit_ghi789',
      name: 'Oficina 301',
      address: 'Jr. Tercera 789, Lima',
    },
    tenant: {
      id: '3',
      publicId: 'debt_ghi789',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
    },
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    monthlyRent: 800.00,
    currency: 'USD',
    deposit: 1600.00,
    status: 'expired',
    paymentDay: 1,
    createdAt: '2023-05-15T09:00:00Z',
    lastPayment: '2023-12-01',
    nextPayment: null,
  },
];

const statusLabels = {
  active: 'Activo',
  expired: 'Expirado',
  terminated: 'Terminado',
  pending: 'Pendiente',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  terminated: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const LeasesList: React.FC = () => {
  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilNextPayment = (nextPayment: string | null) => {
    if (!nextPayment) return null;
    const today = new Date();
    const payment = new Date(nextPayment);
    const diffTime = payment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Contratos de Alquiler
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los contratos de alquiler y sus fechas de vencimiento
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/leases/new"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nuevo Contrato
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
                placeholder="Inquilino o unidad"
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
              <option value="active">Activo</option>
              <option value="expired">Expirado</option>
              <option value="terminated">Terminado</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
              Vencimiento
            </label>
            <select
              id="expiry"
              name="expiry"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Todos</option>
              <option value="30">Próximos 30 días</option>
              <option value="60">Próximos 60 días</option>
              <option value="90">Próximos 90 días</option>
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
                <DocumentTextIcon className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Contratos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockLeases.length}
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
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockLeases.filter(l => l.status === 'active').length}
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
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">E</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Expirados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockLeases.filter(l => l.status === 'expired').length}
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
                  <span className="text-white text-sm font-medium">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingreso Mensual
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${mockLeases.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthlyRent, 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leases Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {mockLeases.map((lease) => {
            const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
            const daysUntilNextPayment = getDaysUntilNextPayment(lease.nextPayment);
            
            return (
              <li key={lease.id}>
                <Link
                  to={`/leases/${lease.publicId}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {lease.tenant.firstName[0]}{lease.tenant.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {lease.tenant.firstName} {lease.tenant.lastName}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[lease.status as keyof typeof statusColors]}`}>
                            {statusLabels[lease.status as keyof typeof statusLabels]}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <p>{lease.unit.name}</p>
                          <span className="mx-2">•</span>
                          <p>{lease.unit.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${lease.monthlyRent.toLocaleString()} {lease.currency}/mes
                        </p>
                        <div className="flex items-center space-x-4">
                          <p>
                            Vence: {new Date(lease.endDate).toLocaleDateString()}
                            {daysUntilExpiry > 0 && (
                              <span className={`ml-1 text-xs ${daysUntilExpiry <= 30 ? 'text-red-600' : 'text-gray-500'}`}>
                                ({daysUntilExpiry} días)
                              </span>
                            )}
                          </p>
                          {daysUntilNextPayment && (
                            <p>
                              Próximo pago: {new Date(lease.nextPayment!).toLocaleDateString()}
                              <span className={`ml-1 text-xs ${daysUntilNextPayment <= 7 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                ({daysUntilNextPayment} días)
                              </span>
                            </p>
                          )}
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
              <span className="font-medium">{mockLeases.length}</span> de{' '}
              <span className="font-medium">{mockLeases.length}</span> resultados
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

export default LeasesList;
