import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/app/api';
import { toast } from 'react-hot-toast';
import EditDebtorModal from '@/components/modals/EditDebtorModal';
import ViewDebtorModal from '@/components/modals/ViewDebtorModal';

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

const Debtors: React.FC = () => {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingDebtor, setEditingDebtor] = useState<Debtor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingDebtor, setViewingDebtor] = useState<Debtor | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch debtors from backend
  useEffect(() => {
    const fetchDebtors = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/debtors');
        setDebtors(response.data || []);
      } catch (error: any) {
        console.error('Error fetching debtors:', error);
        // Si es un error 404 o la tabla no existe, mostrar lista vacía
        if (error.response?.status === 404 || error.response?.status === 500) {
          setDebtors([]);
          toast('No hay inquilinos registrados aún');
        } else {
          toast.error('Error al cargar inquilinos');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebtors();
  }, []);

  // CRUD functions
  const handleEdit = (debtor: Debtor) => {
    setEditingDebtor(debtor);
    setIsEditModalOpen(true);
  };

  const handleUpdateDebtor = (updatedDebtor: any) => {
    setDebtors(prev => 
      prev.map(debtor => 
        debtor.public_id === updatedDebtor.public_id ? { ...debtor, ...updatedDebtor } : debtor
      )
    );
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingDebtor(null);
  };

  const handleDelete = async (debtorId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este inquilino?')) {
      return;
    }

    try {
      await apiClient.delete(`/debtors/${debtorId}`);
      setDebtors(prev => prev.filter(d => d.public_id !== debtorId));
      toast.success('Inquilino eliminado correctamente');
    } catch (error) {
      console.error('Error deleting debtor:', error);
      toast.error('Error al eliminar inquilino');
    }
  };

  const handleView = (debtor: Debtor) => {
    setViewingDebtor(debtor);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingDebtor(null);
  };

  const filteredDebtors = debtors.filter(debtor => {
    const matchesSearch = debtor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debtor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (debtor.property_name && debtor.property_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || debtor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquilinos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona inquilinos activos, pagos pendientes y contratos de alquiler
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => {
              toast('Los inquilinos se agregan automáticamente al aprobar solicitudes de alquiler desde la plataforma.', {
                icon: 'ℹ️',
                duration: 4000,
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <HomeIcon className="-ml-1 mr-2 h-5 w-5" />
            Ver Solicitudes de Alquiler
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar inquilinos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="pending">Pendientes</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Inquilinos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {debtors.length}
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
                <UserIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {debtors.filter(d => d.status === 'active').length}
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
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pendientes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {debtors.filter(d => d.status === 'pending').length}
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
                <CurrencyDollarIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Deuda Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    S/ {debtors.reduce((sum, d) => sum + d.debt_amount, 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredDebtors.map((debtor) => (
            <li key={debtor.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {debtor.full_name.split(' ').map(name => name[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {debtor.full_name}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(debtor.status)}`}>
                          {getStatusText(debtor.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {debtor.email}
                        <PhoneIcon className="flex-shrink-0 ml-4 mr-1.5 h-4 w-4" />
                        {debtor.phone}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <HomeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {debtor.property_name || 'Propiedad no asignada'}
                        <CurrencyDollarIcon className="flex-shrink-0 ml-4 mr-1.5 h-4 w-4" />
                        S/ {debtor.monthly_rent.toFixed(2)}/mes
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {debtor.debt_amount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Debe: S/ {debtor.debt_amount.toFixed(2)}
                      </span>
                    )}
                    <button 
                      onClick={() => handleView(debtor)}
                      className="text-gray-400 hover:text-blue-500"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleEdit(debtor)}
                      className="text-gray-400 hover:text-yellow-500"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(debtor.public_id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredDebtors.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay inquilinos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No se encontraron inquilinos con los filtros aplicados.'
              : 'Comienza agregando tu primer inquilino.'
            }
          </p>
        </div>
      )}

      {/* Edit Modal */}
      <EditDebtorModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        debtor={editingDebtor}
        onUpdate={handleUpdateDebtor}
      />

      {/* View Modal */}
      <ViewDebtorModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        debtor={viewingDebtor}
      />
    </div>
  );
};

export default Debtors;
