import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/app/api';
import { toast } from 'react-hot-toast';
import CreateDebtorModal from '@/components/modals/CreateDebtorModal';
import EditDebtorModal from '@/components/modals/EditDebtorModal';

interface Debtor {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  phone?: string;
  property_id: string;
  property_name?: string;
  monthly_rent: number;
  status: 'current' | 'overdue' | 'defaulted' | 'completed';
  last_payment?: string;
  debt_amount: number;
  created_at: string;
  updated_at: string;
}

const Debtors: React.FC = () => {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Función para obtener el color del estado de pago
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-yellow-100 text-yellow-800';
      case 'defaulted':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'current':
        return 'Al día';
      case 'overdue':
        return 'Vencido';
      case 'defaulted':
        return 'Moroso';
      case 'completed':
        return 'Nada más';
      default:
        return 'Desconocido';
    }
  };

  // Fetch debtors
  const fetchDebtors = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/debtors/');
      setDebtors(response.data);
    } catch (error) {
      console.error('Error fetching debtors:', error);
      toast.error('Error al cargar inquilinos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  // Filter debtors
  const filteredDebtors = debtors.filter(debtor => {
    const matchesSearch = debtor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debtor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (debtor.property_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || debtor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle create debtor
  const handleCreateDebtor = async () => {
    await fetchDebtors();
    setIsCreateModalOpen(false);
  };

  // Handle view debtor
  const handleViewDebtor = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setShowViewModal(true);
  };

  // Handle edit debtor
  const handleEditDebtor = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setShowEditModal(true);
  };

  // Handle delete debtor
  const handleDeleteDebtor = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedDebtor) return;

    try {
      await apiClient.delete(`/debtors/${selectedDebtor.public_id}`);
      toast.success('Inquilino eliminado exitosamente');
      await fetchDebtors();
      setShowDeleteModal(false);
      setSelectedDebtor(null);
    } catch (error) {
      console.error('Error deleting debtor:', error);
      toast.error('Error al eliminar inquilino');
    }
  };

  // Calculate statistics
  const totalDebtors = debtors.length;
  const currentDebtors = debtors.filter(d => d.status === 'current').length;
  const overdueDebtors = debtors.filter(d => d.status === 'overdue').length;
  const totalDebt = debtors.reduce((sum, d) => sum + d.debt_amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inquilinos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona inquilinos activos, pagos pendientes y contratos de alquiler
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar inquilinos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="current">Al día</option>
            <option value="overdue">Vencidos</option>
            <option value="defaulted">Morosos</option>
            <option value="completed">Completados</option>
          </select>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar Inquilino
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Inquilinos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDebtors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Al día</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentDebtors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <UserIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overdueDebtors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <UserIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deuda Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">S/ {totalDebt.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredDebtors.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay inquilinos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron inquilinos con los filtros aplicados.' 
                : 'Comienza agregando tu primer inquilino.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Inquilino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Renta Mensual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deuda
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDebtors.map((debtor) => (
                  <tr key={debtor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {debtor.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {debtor.full_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {debtor.public_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{debtor.email}</div>
                      {debtor.phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{debtor.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {debtor.property_name || 'Propiedad no asignada'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        S/ {debtor.monthly_rent.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(debtor.status)}`}>
                        {getPaymentStatusText(debtor.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        S/ {debtor.debt_amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDebtor(debtor)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditDebtor(debtor)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDebtor(debtor)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
        <CreateDebtorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onDebtorCreated={handleCreateDebtor}
          isCreating={isCreating}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedDebtor && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Confirmar eliminación
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ¿Estás seguro de que deseas eliminar al inquilino <strong>{selectedDebtor.full_name}</strong>?
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedDebtor && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Detalles del Inquilino
                  </h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedDebtor.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedDebtor.email}</p>
                  </div>
                  {selectedDebtor.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedDebtor.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Propiedad</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedDebtor.property_name || 'Propiedad no asignada'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Renta Mensual</label>
                    <p className="text-sm text-gray-900 dark:text-white">S/ {selectedDebtor.monthly_rent.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedDebtor.status)}`}>
                      {getPaymentStatusText(selectedDebtor.status)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Deuda Actual</label>
                    <p className="text-sm text-gray-900 dark:text-white">S/ {selectedDebtor.debt_amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedDebtor && (
          <EditDebtorModal
            debtor={selectedDebtor}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedDebtor(null);
            }}
            onUpdate={async () => {
              await fetchDebtors();
              setShowEditModal(false);
              setSelectedDebtor(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Debtors;