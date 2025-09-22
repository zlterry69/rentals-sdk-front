import React from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { TestTailwind } from '@/components/TestTailwind';

// Mock data for demo purposes
const mockStats = {
  total_debtors: 24,
  active_leases: 18,
  total_payments: 156,
  pending_payments: 8,
  overdue_payments: 3,
  monthly_revenue: 45000,
  currency_code: 'PEN',
};

const mockRecentPayments = [
  {
    id: '1',
    public_id: 'pay_8fZk12Qp9L',
    debtor_name: 'Juan Pérez',
    amount: 2500,
    currency_code: 'PEN',
    status_code: 'PAID',
    status_description: 'Pago confirmado',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    public_id: 'pay_9gAl23Rq0M',
    debtor_name: 'María García',
    amount: 2800,
    currency_code: 'PEN',
    status_code: 'PENDING',
    status_description: 'Pago pendiente',
    created_at: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    public_id: 'pay_0hBm34Sr1N',
    debtor_name: 'Carlos López',
    amount: 3200,
    currency_code: 'PEN',
    status_code: 'PAID',
    status_description: 'Pago confirmado',
    created_at: '2024-01-14T16:45:00Z',
  },
];

const mockUpcomingDueDates = [
  {
    id: '4',
    public_id: 'pay_1iCn45Ts2O',
    debtor_name: 'Ana Rodríguez',
    amount: 2600,
    due_date: '2024-01-20',
    currency_code: 'PEN',
  },
  {
    id: '5',
    public_id: 'pay_2jDo56Ut3P',
    debtor_name: 'Luis Torres',
    amount: 2900,
    due_date: '2024-01-22',
    currency_code: 'PEN',
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'PENDING':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'OVERDUE':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Tailwind */}
      <TestTailwind />
      
      {/* Welcome header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ¡Bienvenido de vuelta, {user?.email || 'Usuario'}!
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Aquí tienes un resumen de tu sistema de alquileres
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Hoy es</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date().toLocaleDateString('es-PE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Debtors */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Inquilinos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {mockStats.total_debtors}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/debtors"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Ver todos
              </Link>
            </div>
          </div>
        </div>

        {/* Active Leases */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Contratos Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {mockStats.active_leases}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/leases"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Ver todos
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Pagos Pendientes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {mockStats.pending_payments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/payments"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Ver todos
              </Link>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Ingresos del Mes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatCurrency(mockStats.monthly_revenue, mockStats.currency_code)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/reports"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Ver reporte
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity and upcoming due dates */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Pagos Recientes
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {mockRecentPayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getStatusIcon(payment.status_code)}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.debtor_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount, payment.currency_code)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        payment.status_code
                      )}`}
                    >
                      {payment.status_description}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <Link
              to="/payments"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Ver todos los pagos →
            </Link>
          </div>
        </div>

        {/* Upcoming Due Dates */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Próximos Vencimientos
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {mockUpcomingDueDates.map((payment) => (
              <div key={payment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {payment.debtor_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Vence: {formatDate(payment.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount, payment.currency_code)}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Próximo
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <Link
              to="/payments"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Ver todos los vencimientos →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/debtors/new"
            className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
          >
            <div className="flex-shrink-0">
              <UsersIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Nuevo Inquilino
              </p>
            </div>
          </Link>

          <Link
            to="/payments/new"
            className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
          >
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Nuevo Pago
              </p>
            </div>
          </Link>

          <Link
            to="/units/new"
            className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
          >
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Nueva Unidad
              </p>
            </div>
          </Link>

          <Link
            to="/reports"
            className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
          >
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Ver Reportes
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
