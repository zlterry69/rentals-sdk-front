import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, HomeIcon } from '@heroicons/react/24/outline';

// Mock data
const mockUnits = [
  {
    id: '1',
    publicId: 'unit_abc123',
    name: 'Departamento 101',
    address: 'Av. Principal 123, Lima',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    rent: 1200.00,
    currency: 'USD',
    status: 'occupied',
    tenant: {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
    },
    lease: {
      id: '1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
    },
  },
  {
    id: '2',
    publicId: 'unit_def456',
    name: 'Casa 202',
    address: 'Calle Secundaria 456, Lima',
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    rent: 1800.00,
    currency: 'USD',
    status: 'occupied',
    tenant: {
      id: '2',
      name: 'María González',
      email: 'maria.gonzalez@email.com',
    },
    lease: {
      id: '2',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      status: 'active',
    },
  },
  {
    id: '3',
    publicId: 'unit_ghi789',
    name: 'Oficina 301',
    address: 'Jr. Tercera 789, Lima',
    type: 'office',
    bedrooms: 0,
    bathrooms: 1,
    area: 60,
    rent: 800.00,
    currency: 'USD',
    status: 'available',
    tenant: null,
    lease: null,
  },
];

const typeLabels = {
  apartment: 'Departamento',
  house: 'Casa',
  office: 'Oficina',
  commercial: 'Local Comercial',
};

const statusLabels = {
  available: 'Disponible',
  occupied: 'Ocupado',
  maintenance: 'Mantenimiento',
  unavailable: 'No Disponible',
};

const UnitsList: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Unidades
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus propiedades y unidades de alquiler
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/units/new"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nueva Unidad
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
                placeholder="Nombre o dirección"
              />
            </div>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Tipo
            </label>
            <select
              id="type"
              name="type"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Todos los tipos</option>
              <option value="apartment">Departamento</option>
              <option value="house">Casa</option>
              <option value="office">Oficina</option>
              <option value="commercial">Local Comercial</option>
            </select>
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
              <option value="available">Disponible</option>
              <option value="occupied">Ocupado</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="unavailable">No Disponible</option>
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
                <HomeIcon className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Unidades
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockUnits.length}
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
                  <span className="text-white text-sm font-medium">O</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ocupadas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockUnits.filter(u => u.status === 'occupied').length}
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
                  <span className="text-white text-sm font-medium">D</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Disponibles
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockUnits.filter(u => u.status === 'available').length}
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
                    ${mockUnits.filter(u => u.status === 'occupied').reduce((sum, u) => sum + u.rent, 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockUnits.map((unit) => (
          <div key={unit.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{unit.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  unit.status === 'occupied' 
                    ? 'bg-green-100 text-green-800' 
                    : unit.status === 'available'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {statusLabels[unit.status as keyof typeof statusLabels]}
                </span>
              </div>
              
              <p className="mt-1 text-sm text-gray-500">{unit.address}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <span className="ml-1 text-gray-900">
                    {typeLabels[unit.type as keyof typeof typeLabels]}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Área:</span>
                  <span className="ml-1 text-gray-900">{unit.area} m²</span>
                </div>
                <div>
                  <span className="text-gray-500">Habitaciones:</span>
                  <span className="ml-1 text-gray-900">{unit.bedrooms}</span>
                </div>
                <div>
                  <span className="text-gray-500">Baños:</span>
                  <span className="ml-1 text-gray-900">{unit.bathrooms}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    ${unit.rent.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">{unit.currency}/mes</span>
                </div>
                <Link
                  to={`/units/${unit.publicId}`}
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  Ver detalles →
                </Link>
              </div>
              
              {unit.tenant && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm">
                    <span className="text-gray-500">Inquilino:</span>
                    <span className="ml-1 text-gray-900">{unit.tenant.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">{unit.tenant.email}</div>
                </div>
              )}
            </div>
          </div>
        ))}
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
              <span className="font-medium">{mockUnits.length}</span> de{' '}
              <span className="font-medium">{mockUnits.length}</span> resultados
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

export default UnitsList;
