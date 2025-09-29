import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/app/api';
import { toast } from 'react-hot-toast';
import CreateLeaseModal from '@/components/modals/CreateLeaseModal';
import EditLeaseModal from '@/components/modals/EditLeaseModal';
import { useAuth } from '@/contexts/AuthContext';

interface Lease {
  id: string;
  public_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  rent_frequency: 'monthly' | 'yearly';
  total_days: number;
  total_amount: number;
  payment_method: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'cancelled';
  notes?: string;
  contract_document_url?: string;
  contract_document_s3_key?: string;
  expenses?: any[];
  created_at: string;
  property: {
    id: string;
    title: string;
    address: string;
    bedrooms: number;
    bathrooms: number;
    area_sqm: number;
    images: string[];
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  host: {
    id: string;
    name: string;
    email: string;
  };
  currency: {
    code: string;
    name: string;
  };
}

const Leases: React.FC = () => {
  const { user } = useAuth();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);

  // Verificar si el usuario tiene permisos para ver contratos
  const canViewLeases = user?.role === 'admin' || user?.role === 'superadmin';
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeases, setTotalLeases] = useState(0);
  const leasesPerPage = 20;

  // Fetch leases from backend
  useEffect(() => {
    fetchLeases();
  }, [currentPage, statusFilter]);

  const fetchLeases = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: leasesPerPage.toString()
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await apiClient.get(`/leases?${params}`);
      const data = response.data;
      
      setLeases(data.data || []);
      setTotalPages(data.total_pages || 1);
      setTotalLeases(data.total || 0);
    } catch (error) {
      console.error('Error fetching leases:', error);
      toast.error('Error al cargar contratos');
      setLeases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeases = leases.filter(lease => {
    const matchesSearch = lease.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Funciones de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleLeaseCreated = () => {
    fetchLeases();
    setShowCreateModal(false);
  };

  const handleEditLease = (lease: Lease) => {
    setEditingLease(lease);
  };

  const handleLeaseUpdated = () => {
    fetchLeases();
    setEditingLease(null);
  };

  const handleDownloadDocument = async (lease: Lease) => {
    if (!lease.contract_document_url) {
      toast.error('No hay documento disponible para descargar');
      return;
    }

    try {
      // Crear un enlace temporal para descargar
      const link = document.createElement('a');
      link.href = lease.contract_document_url;
      link.download = `contrato_${lease.public_id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Error al descargar el documento');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'active':
        return 'Activo';
      case 'expired':
        return 'Vencido';
      case 'terminated':
        return 'Terminado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'terminated':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeLeases = leases.filter(l => l.status === 'active').length;
  const expiringLeases = leases.filter(l => l.status === 'active' && getDaysUntilExpiry(l.end_date) <= 60).length;
  const totalDeposits = leases.filter(l => l.status === 'active').reduce((sum, l) => sum + l.rent_amount, 0);
  const monthlyRevenue = leases.filter(l => l.status === 'active').reduce((sum, l) => sum + l.rent_amount, 0);

  // Verificar permisos
  if (!canViewLeases) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Solo los administradores pueden ver y gestionar contratos.
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Contratos de Alquiler</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona contratos, renovaciones y términos legales
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nuevo Contrato
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Contratos Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activeLeases}
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
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Por Vencer (60 días)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {expiringLeases}
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
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Depósitos Totales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    S/ {totalDeposits.toFixed(2)}
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
                <CalendarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos Mensuales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    S/ {monthlyRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
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
                placeholder="Buscar contratos..."
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
              <option value="draft">Borradores</option>
              <option value="active">Activos</option>
              <option value="expired">Vencidos</option>
              <option value="terminated">Terminados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredLeases.map((lease) => {
            const daysUntilExpiry = getDaysUntilExpiry(lease.end_date);
            const isExpiringSoon = lease.status === 'active' && daysUntilExpiry <= 60 && daysUntilExpiry > 0;
            
            return (
              <li key={lease.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(lease.status)}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {lease.tenant.name}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lease.status)}`}>
                            {getStatusText(lease.status)}
                          </span>
                          {isExpiringSoon && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Vence en {daysUntilExpiry} días
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <HomeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {lease.property.title} - {lease.property.address}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {new Date(lease.start_date).toLocaleDateString('es-PE')} - {new Date(lease.end_date).toLocaleDateString('es-PE')}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span className="font-medium">Duración:</span> {lease.total_days} días
                          <span className="mx-2">•</span>
                          <span className="font-medium">Total:</span> S/ {lease.total_amount.toFixed(2)}
                          <span className="mx-2">•</span>
                          <span className="font-medium">Método:</span> {lease.payment_method}
                        </div>
                        {lease.notes && (
                          <div className="mt-1 text-sm text-gray-500">
                            <span className="font-medium">Notas:</span> {lease.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => window.open(lease.contract_document_url, '_blank')}
                        className="text-gray-400 hover:text-blue-500"
                        title="Ver documento"
                        disabled={!lease.contract_document_url}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {lease.contract_document_url && (
                        <button 
                          onClick={() => handleDownloadDocument(lease)}
                          className="text-gray-400 hover:text-green-500"
                          title="Descargar documento"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditLease(lease)}
                        className="text-gray-400 hover:text-yellow-500"
                        title="Editar contrato"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{(currentPage - 1) * leasesPerPage + 1}</span>
                {' '}a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * leasesPerPage, totalLeases)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{totalLeases}</span>
                {' '}resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Números de página */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {filteredLeases.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contratos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No se encontraron contratos con los filtros aplicados.'
              : 'Los contratos aparecerán aquí cuando se registren.'
            }
          </p>
        </div>
      )}

      {/* Modal para crear contrato */}
      <CreateLeaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLeaseCreated={handleLeaseCreated}
      />

      {/* Modal para editar contrato */}
      <EditLeaseModal
        isOpen={!!editingLease}
        onClose={() => setEditingLease(null)}
        onLeaseUpdated={handleLeaseUpdated}
        lease={editingLease}
      />
    </div>
  );
};

export default Leases;
