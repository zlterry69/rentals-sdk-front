import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  PlusIcon,
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Mock data
const mockUnit = {
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
  description: 'Departamento moderno en el centro de Lima, cerca de transporte público y centros comerciales.',
  amenities: ['Aire acondicionado', 'Internet', 'Cocina equipada', 'Balcón'],
  images: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
  ],
  tenant: {
    id: '1',
    publicId: 'debt_abc123',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+1 234 567 8900',
  },
  lease: {
    id: '1',
    publicId: 'lease_abc123',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyRent: 1200.00,
    currency: 'USD',
    deposit: 2400.00,
    status: 'active',
    paymentDay: 1,
  },
  payments: [
    {
      id: '1',
      publicId: 'pay_xyz789',
      amount: 1200.00,
      currency: 'USD',
      description: 'Pago de alquiler enero 2024',
      status: 'confirmed',
      createdAt: '2024-01-01T10:30:00Z',
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
  maintenance: [
    {
      id: '1',
      description: 'Reparación de grifo',
      status: 'completed',
      createdAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-16T14:30:00Z',
    },
    {
      id: '2',
      description: 'Limpieza de aire acondicionado',
      status: 'pending',
      createdAt: '2024-02-01T10:30:00Z',
      completedAt: null,
    },
  ],
};

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

const statusColors = {
  available: 'bg-blue-100 text-blue-800',
  occupied: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  unavailable: 'bg-red-100 text-red-800',
};

const UnitDetail: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  // In a real app, you would fetch the unit data using the unitId
  const unit = mockUnit;

  const handleEdit = () => {
    navigate(`/units/${unit.publicId}/edit`);
  };

  const handleNewLease = () => {
    navigate(`/leases/new?unitId=${unit.publicId}`);
  };

  const handleViewTenant = () => {
    navigate(`/debtors/${unit.tenant.publicId}`);
  };

  const handleViewLease = () => {
    navigate(`/leases/${unit.lease.publicId}`);
  };

  const handleViewPayment = (paymentId: string) => {
    navigate(`/payments/${paymentId}`);
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
                {unit.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {unit.address}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Editar
          </button>
          {unit.status === 'available' && (
            <button
              onClick={handleNewLease}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Nuevo Contrato
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-md p-4 ${
        unit.status === 'occupied' ? 'bg-green-50 border border-green-200' : 
        unit.status === 'available' ? 'bg-blue-50 border border-blue-200' :
        'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <span className={`text-lg ${
              unit.status === 'occupied' ? 'text-green-400' : 
              unit.status === 'available' ? 'text-blue-400' :
              'text-yellow-400'
            }`}>
              {unit.status === 'occupied' ? '🏠' : 
               unit.status === 'available' ? '🔓' : '🔧'}
            </span>
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              unit.status === 'occupied' ? 'text-green-800' : 
              unit.status === 'available' ? 'text-blue-800' :
              'text-yellow-800'
            }`}>
              Estado: {statusLabels[unit.status as keyof typeof statusLabels]}
            </h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                {unit.status === 'occupied' && 'La unidad está ocupada por un inquilino activo.'}
                {unit.status === 'available' && 'La unidad está disponible para alquilar.'}
                {unit.status === 'maintenance' && 'La unidad está en mantenimiento.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unit Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Unidad</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {typeLabels[unit.type as keyof typeof typeLabels]}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Área</dt>
                <dd className="mt-1 text-sm text-gray-900">{unit.area} m²</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Habitaciones</dt>
                <dd className="mt-1 text-sm text-gray-900">{unit.bedrooms}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Baños</dt>
                <dd className="mt-1 text-sm text-gray-900">{unit.bathrooms}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Alquiler Mensual</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${unit.rent.toLocaleString()} {unit.currency}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[unit.status as keyof typeof statusColors]}`}>
                    {statusLabels[unit.status as keyof typeof statusLabels]}
                  </span>
                </dd>
              </div>
            </div>
            
            {unit.description && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                <dd className="mt-1 text-sm text-gray-900">{unit.description}</dd>
              </div>
            )}

            {unit.amenities && unit.amenities.length > 0 && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Amenidades</dt>
                <dd className="mt-1">
                  <div className="flex flex-wrap gap-2">
                    {unit.amenities.map((amenity, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </div>

          {/* Current Tenant */}
          {unit.tenant && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Inquilino Actual</h3>
                <button
                  onClick={handleViewTenant}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Ver perfil →
                </button>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-700">
                      {unit.tenant.firstName[0]}{unit.tenant.lastName[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {unit.tenant.firstName} {unit.tenant.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{unit.tenant.email}</p>
                  <p className="text-sm text-gray-500">{unit.tenant.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Payments */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Pagos Recientes</h3>
              <button
                onClick={() => navigate(`/payments?unitId=${unit.publicId}`)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Ver todos →
              </button>
            </div>
            <div className="space-y-4">
              {unit.payments.map((payment) => (
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
          {/* Current Lease */}
          {unit.lease && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Contrato Actual</h3>
                <button
                  onClick={handleViewLease}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Ver detalles →
                </button>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Período</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(unit.lease.startDate).toLocaleDateString()} - {new Date(unit.lease.endDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Alquiler Mensual</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ${unit.lease.monthlyRent.toLocaleString()} {unit.lease.currency}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Depósito</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ${unit.lease.deposit.toLocaleString()} {unit.lease.currency}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Día de Pago</dt>
                  <dd className="mt-1 text-sm text-gray-900">Día {unit.lease.paymentDay} de cada mes</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Maintenance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Mantenimiento</h3>
            <div className="space-y-3">
              {unit.maintenance.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
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
                onClick={handleEdit}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Editar Unidad
              </button>
              {unit.status === 'available' && (
                <button
                  onClick={handleNewLease}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                  Nuevo Contrato
                </button>
              )}
              <button
                onClick={() => navigate(`/units/${unit.publicId}/maintenance`)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <HomeIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Mantenimiento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitDetail;
