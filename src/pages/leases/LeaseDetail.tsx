import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Mock data
const mockLease = {
  id: '1',
  publicId: 'lease_abc123',
  unit: {
    id: '1',
    publicId: 'unit_abc123',
    name: 'Departamento 101',
    address: 'Av. Principal 123, Lima',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
  },
  tenant: {
    id: '1',
    publicId: 'debt_abc123',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+1 234 567 8900',
    documentType: 'DNI',
    documentNumber: '12345678',
  },
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  monthlyRent: 1200.00,
  currency: 'USD',
  deposit: 2400.00,
  status: 'active',
  paymentDay: 1,
  createdAt: '2023-12-15T10:30:00Z',
  terms: [
    'El inquilino se compromete a pagar el alquiler el día 1 de cada mes',
    'El depósito será devuelto al finalizar el contrato, menos cualquier daño',
    'No se permiten mascotas sin autorización previa',
    'El inquilino es responsable del mantenimiento básico de la unidad',
  ],
  payments: [
    {
      id: '1',
      publicId: 'pay_xyz789',
      amount: 1200.00,
      currency: 'USD',
      description: 'Pago de alquiler enero 2024',
      status: 'confirmed',
      createdAt: '2024-01-01T10:30:00Z',
      confirmedAt: '2024-01-01T11:45:00Z',
    },
    {
      id: '2',
      publicId: 'pay_abc456',
      amount: 1200.00,
      currency: 'USD',
      description: 'Pago de alquiler febrero 2024',
      status: 'pending',
      createdAt: '2024-02-01T10:30:00Z',
      confirmedAt: null,
    },
    {
      id: '3',
      publicId: 'pay_def789',
      amount: 1200.00,
      currency: 'USD',
      description: 'Pago de alquiler marzo 2024',
      status: 'pending',
      createdAt: '2024-03-01T10:30:00Z',
      confirmedAt: null,
    },
  ],
  documents: [
    {
      id: '1',
      name: 'Contrato de Alquiler',
      type: 'contract',
      url: '/documents/contract.pdf',
      createdAt: '2023-12-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Recibo de Depósito',
      type: 'receipt',
      url: '/documents/deposit_receipt.pdf',
      createdAt: '2023-12-15T10:30:00Z',
    },
  ],
};

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

const LeaseDetail: React.FC = () => {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  // In a real app, you would fetch the lease data using the leaseId
  const lease = mockLease;

  const handleEdit = () => {
    navigate(`/leases/${lease.publicId}/edit`);
  };

  const handleNewPayment = () => {
    navigate(`/payments/new?leaseId=${lease.publicId}`);
  };

  const handleViewTenant = () => {
    navigate(`/debtors/${lease.tenant.publicId}`);
  };

  const handleViewUnit = () => {
    navigate(`/units/${lease.unit.publicId}`);
  };

  const handleViewPayment = (paymentId: string) => {
    navigate(`/payments/${paymentId}`);
  };

  const getDaysUntilExpiry = () => {
    const today = new Date();
    const expiry = new Date(lease.endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilNextPayment = () => {
    const today = new Date();
    const nextPayment = new Date(today.getFullYear(), today.getMonth(), lease.paymentDay);
    if (nextPayment <= today) {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }
    const diffTime = nextPayment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const daysUntilNextPayment = getDaysUntilNextPayment();

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
                Contrato de Alquiler
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                ID: {lease.publicId}
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
        lease.status === 'active' ? 'bg-green-50 border border-green-200' : 
        lease.status === 'expired' ? 'bg-red-50 border border-red-200' :
        'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <span className={`text-lg ${
              lease.status === 'active' ? 'text-green-400' : 
              lease.status === 'expired' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {lease.status === 'active' ? '✓' : 
               lease.status === 'expired' ? '✗' : '!'}
            </span>
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              lease.status === 'active' ? 'text-green-800' : 
              lease.status === 'expired' ? 'text-red-800' :
              'text-yellow-800'
            }`}>
              Estado: {statusLabels[lease.status as keyof typeof statusLabels]}
            </h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                {lease.status === 'active' && `El contrato está activo. Vence en ${daysUntilExpiry} días.`}
                {lease.status === 'expired' && 'El contrato ha expirado. Se requiere renovación o terminación.'}
                {lease.status === 'pending' && 'El contrato está pendiente de activación.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Contrato</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Período</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Alquiler Mensual</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${lease.monthlyRent.toLocaleString()} {lease.currency}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Depósito</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${lease.deposit.toLocaleString()} {lease.currency}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Día de Pago</dt>
                <dd className="mt-1 text-sm text-gray-900">Día {lease.paymentDay} de cada mes</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(lease.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[lease.status as keyof typeof statusColors]}`}>
                    {statusLabels[lease.status as keyof typeof statusLabels]}
                  </span>
                </dd>
              </div>
            </div>
          </div>

          {/* Tenant Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Inquilino</h3>
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
                    {lease.tenant.firstName[0]}{lease.tenant.lastName[0]}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {lease.tenant.firstName} {lease.tenant.lastName}
                </p>
                <p className="text-sm text-gray-500">{lease.tenant.email}</p>
                <p className="text-sm text-gray-500">{lease.tenant.phone}</p>
                <p className="text-sm text-gray-500">
                  {lease.tenant.documentType}: {lease.tenant.documentNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Unit Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Unidad</h3>
              <button
                onClick={handleViewUnit}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Ver detalles →
              </button>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <HomeIcon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{lease.unit.name}</p>
                <p className="text-sm text-gray-500">{lease.unit.address}</p>
                <p className="text-sm text-gray-500">
                  {lease.unit.bedrooms} habitaciones, {lease.unit.bathrooms} baños, {lease.unit.area} m²
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Historial de Pagos</h3>
              <button
                onClick={() => navigate(`/payments?leaseId=${lease.publicId}`)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Ver todos →
              </button>
            </div>
            <div className="space-y-4">
              {lease.payments.map((payment) => (
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
          {/* Contract Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen del Contrato</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Duración</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {Math.ceil((new Date(lease.endDate).getTime() - new Date(lease.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Días hasta vencimiento</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} días` : 'Expirado'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Próximo pago</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  En {daysUntilNextPayment} días
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total pagado</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${lease.payments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()} {lease.currency}
                </dd>
              </div>
            </dl>
          </div>

          {/* Contract Terms */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Términos del Contrato</h3>
            <ul className="space-y-2">
              {lease.terms.map((term, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  {term}
                </li>
              ))}
            </ul>
          </div>

          {/* Documents */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos</h3>
            <div className="space-y-3">
              {lease.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-sm text-primary-600 hover:text-primary-500">
                    Descargar
                  </button>
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
                Editar Contrato
              </button>
              <button
                onClick={() => navigate(`/leases/${lease.publicId}/renew`)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <CalendarIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Renovar Contrato
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaseDetail;
