import React from 'react';
import Modal from '@/components/ui/Modal';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  HomeIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Interface
interface Debtor {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  phone?: string;
  property_id: string;
  property_name?: string;
  monthly_rent: number;
  status: 'active' | 'inactive' | 'pending';
  last_payment?: string;
  debt_amount: number;
  created_at: string;
  updated_at: string;
}

interface ViewDebtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor: Debtor | null;
}

const ViewDebtorModal: React.FC<ViewDebtorModalProps> = ({
  isOpen,
  onClose,
  debtor
}) => {
  if (!debtor) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircleIcon,
          text: 'Activo',
          color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
        };
      case 'inactive':
        return {
          icon: XCircleIcon,
          text: 'Inactivo',
          color: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
        };
      case 'pending':
        return {
          icon: ExclamationTriangleIcon,
          text: 'Pendiente',
          color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
        };
      default:
        return {
          icon: ClockIcon,
          text: status,
          color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
        };
    }
  };

  const statusInfo = getStatusInfo(debtor.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Inquilino"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header con avatar y estado */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-300">
                {debtor.full_name.split(' ').map(name => name[0]).join('').slice(0, 2)}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {debtor.full_name}
            </h3>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
              Información de Contacto
            </h4>
            
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm text-gray-900 dark:text-white">{debtor.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {debtor.phone || 'No proporcionado'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <HomeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Propiedad</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {debtor.property_name || 'No asignada'}
                </p>
              </div>
            </div>
          </div>

          {/* Información financiera */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
              Información Financiera
            </h4>
            
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Alquiler Mensual</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(debtor.monthly_rent)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className={`h-5 w-5 ${debtor.debt_amount > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deuda Actual</p>
                <p className={`text-lg font-semibold ${debtor.debt_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {formatCurrency(debtor.debt_amount)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Último Pago</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {debtor.last_payment ? formatDate(debtor.last_payment) : 'Sin pagos registrados'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Información del Sistema
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">ID Público</p>
              <p className="text-gray-900 dark:text-white font-mono">{debtor.public_id}</p>
            </div>
            
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Fecha de Registro</p>
              <p className="text-gray-900 dark:text-white">{formatDate(debtor.created_at)}</p>
            </div>
            
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Última Actualización</p>
              <p className="text-gray-900 dark:text-white">{formatDate(debtor.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Resumen financiero */}
        {debtor.debt_amount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <h5 className="text-sm font-medium text-red-800 dark:text-red-300">
                Atención: Deuda Pendiente
              </h5>
            </div>
            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
              Este inquilino tiene una deuda pendiente de <strong>{formatCurrency(debtor.debt_amount)}</strong>.
              {debtor.debt_amount >= debtor.monthly_rent && (
                <span className="block mt-1">
                  Equivale a {Math.ceil(debtor.debt_amount / debtor.monthly_rent)} mes(es) de alquiler.
                </span>
              )}
            </p>
          </div>
        )}

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewDebtorModal;
