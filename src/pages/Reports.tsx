import React from 'react';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon, 
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

// Mock data
const mockReports = {
  monthlyRevenue: [
    { month: 'Ene', revenue: 12000, payments: 10 },
    { month: 'Feb', revenue: 15000, payments: 12 },
    { month: 'Mar', revenue: 18000, payments: 15 },
    { month: 'Abr', revenue: 14000, payments: 11 },
    { month: 'May', revenue: 16000, payments: 13 },
    { month: 'Jun', revenue: 20000, payments: 16 },
  ],
  paymentMethods: [
    { method: 'Criptomonedas', count: 45, percentage: 60 },
    { method: 'Transferencia Bancaria', count: 30, percentage: 40 },
  ],
  occupancyRate: 85,
  averageRent: 1400,
  totalUnits: 12,
  occupiedUnits: 10,
  pendingPayments: 3,
  overduePayments: 1,
};

const Reports: React.FC = () => {
  const handleExportReport = (type: string) => {
    // In a real app, this would generate and download the report
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Reportes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Análisis y estadísticas de tu sistema de alquileres
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button
            onClick={() => handleExportReport('monthly')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <DocumentArrowDownIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingreso Mensual
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${mockReports.monthlyRevenue[mockReports.monthlyRevenue.length - 1].revenue.toLocaleString()}
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
                <HomeIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tasa de Ocupación
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockReports.occupancyRate}%
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
                <UserGroupIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Inquilinos Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockReports.occupiedUnits}/{mockReports.totalUnits}
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
                <ChartBarIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Alquiler Promedio
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${mockReports.averageRent.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ingresos Mensuales</h3>
            <button
              onClick={() => handleExportReport('revenue')}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Exportar
            </button>
          </div>
          <div className="space-y-4">
            {mockReports.monthlyRevenue.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 text-sm text-gray-500">{month.month}</div>
                  <div className="ml-4 flex-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(month.revenue / 20000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-900">
                  ${month.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Métodos de Pago</h3>
            <button
              onClick={() => handleExportReport('payments')}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Exportar
            </button>
          </div>
          <div className="space-y-4">
            {mockReports.paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-32 text-sm text-gray-500">{method.method}</div>
                  <div className="ml-4 flex-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${method.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-900">
                  {method.count} ({method.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Reportes Detallados</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Reporte Mensual</h4>
                  <p className="text-sm text-gray-500">Ingresos y gastos del mes</p>
                </div>
              </div>
              <button
                onClick={() => handleExportReport('monthly')}
                className="mt-3 text-sm text-primary-600 hover:text-primary-500"
              >
                Generar →
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Reporte de Inquilinos</h4>
                  <p className="text-sm text-gray-500">Estado de pagos y contratos</p>
                </div>
              </div>
              <button
                onClick={() => handleExportReport('tenants')}
                className="mt-3 text-sm text-primary-600 hover:text-primary-500"
              >
                Generar →
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <HomeIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Reporte de Unidades</h4>
                  <p className="text-sm text-gray-500">Ocupación y rendimiento</p>
                </div>
              </div>
              <button
                onClick={() => handleExportReport('units')}
                className="mt-3 text-sm text-primary-600 hover:text-primary-500"
              >
                Generar →
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Reporte de Pagos</h4>
                  <p className="text-sm text-gray-500">Historial de transacciones</p>
                </div>
              </div>
              <button
                onClick={() => handleExportReport('payments')}
                className="mt-3 text-sm text-primary-600 hover:text-primary-500"
              >
                Generar →
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Análisis Financiero</h4>
                  <p className="text-sm text-gray-500">Tendencias y proyecciones</p>
                </div>
              </div>
              <button
                onClick={() => handleExportReport('financial')}
                className="mt-3 text-sm text-primary-600 hover:text-primary-500"
              >
                Generar →
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <DocumentArrowDownIcon className="h-8 w-8 text-gray-500" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Reporte Personalizado</h4>
                  <p className="text-sm text-gray-500">Configura tus propios parámetros</p>
                </div>
              </div>
              <button
                onClick={() => handleExportReport('custom')}
                className="mt-3 text-sm text-primary-600 hover:text-primary-500"
              >
                Configurar →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Pagos</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Pagos Completados</p>
                <p className="text-2xl font-bold text-green-900">
                  {mockReports.monthlyRevenue[mockReports.monthlyRevenue.length - 1].payments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">!</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {mockReports.pendingPayments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✗</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Pagos Vencidos</p>
                <p className="text-2xl font-bold text-red-900">
                  {mockReports.overduePayments}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
