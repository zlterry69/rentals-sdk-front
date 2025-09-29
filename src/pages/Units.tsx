import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  HomeModernIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/app/api';
import toast from 'react-hot-toast';
import EditUnitModal from '@/components/modals/EditUnitModal';
import ViewUnitModal from '@/components/modals/ViewUnitModal';
import { CreatePropertyModal } from '@/components/modals/CreatePropertyModal';

interface Unit {
  id: string;
  public_id: string;
  title: string;
  address: string;
  district: string;
  property_type: 'apartment' | 'house' | 'studio' | 'room';
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  monthly_rent: number;
  status: 'available' | 'occupied' | 'maintenance';
  tenant_name?: string;
  images: string[];
  rating: number;
  total_reviews: number;
  real_rating?: number;
  real_total_reviews?: number;
}

const Units: React.FC = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<Unit | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState<Set<string>>(new Set());
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUnits, setTotalUnits] = useState(0);
  const unitsPerPage = 20;

  // CRUD functions
  const handleEdit = (unit: Unit) => {
    // Redirigir a la vista de edición de la propiedad
    navigate(`/properties/${unit.public_id}?edit=true`);
  };

  const handleUpdateUnit = (updatedUnit: any) => {
    setUnits(prev => 
      prev.map(unit => 
        unit.public_id === updatedUnit.public_id ? { ...unit, ...updatedUnit } : unit
      )
    );
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUnit(null);
  };

  const handleDelete = async (unitId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta unidad? Se eliminarán también todos los inquilinos y pagos asociados.')) {
      return;
    }

    try {
      await apiClient.delete(`/units/${unitId}`);
      setUnits(prev => prev.filter(u => u.public_id !== unitId));
      toast.success('Unidad eliminada correctamente');
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast.error('Error al eliminar unidad');
    }
  };

  const handleView = (unit: Unit) => {
    setViewingUnit(unit);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingUnit(null);
  };

  // Fetch units from backend
  // Función para calcular rating en tiempo real
  const calculatePropertyRating = async (propertyPublicId: string) => {
    try {
      const response = await apiClient.get(`/reviews/unit/${propertyPublicId}`);
      const reviews = response.data || [];
      
      if (reviews.length === 0) {
        return { rating: 0, total_reviews: 0 };
      }
      
      const ratings = reviews.map((review: any) => review.rating).filter((rating: number) => rating > 0);
      const averageRating = ratings.length > 0 ? Math.round((ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length) * 10) / 10 : 0;
      
      return { rating: averageRating, total_reviews: reviews.length };
    } catch (error) {
      console.error('Error fetching reviews for property:', propertyPublicId, error);
      return { rating: 0, total_reviews: 0 };
    }
  };

  // Función para cargar ratings de forma individual
  const loadRatingsIndividually = async (unitsData: Unit[]) => {
    for (const unit of unitsData) {
      // Marcar como cargando
      setLoadingUnits(prev => new Set(prev).add(unit.public_id));
      
      try {
        const { rating, total_reviews } = await calculatePropertyRating(unit.public_id);
        
        // Actualizar solo esta unidad
        setUnits(prevUnits => 
          prevUnits.map(u => 
            u.public_id === unit.public_id 
              ? { ...u, real_rating: rating, real_total_reviews: total_reviews }
              : u
          )
        );
      } catch (error) {
        console.error(`Error loading rating for unit ${unit.public_id}:`, error);
      } finally {
        // Quitar de cargando
        setLoadingUnits(prev => {
          const newSet = new Set(prev);
          newSet.delete(unit.public_id);
          return newSet;
        });
      }
    }
  };

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', unitsPerPage.toString());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('property_type', typeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiClient.get(`/units?${params.toString()}`);
      
      let unitsData = [];
      // Si la API devuelve datos paginados
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        unitsData = response.data.data || [];
        setTotalUnits(response.data.total || 0);
        setTotalPages(response.data.total_pages || 1);
      } else {
        // Si la API devuelve un array simple, lo paginamos en el frontend
        const allUnits = response.data || [];
        setTotalUnits(allUnits.length);
        setTotalPages(Math.ceil(allUnits.length / unitsPerPage));
        
        // Aplicar paginación en el frontend
        const startIndex = (currentPage - 1) * unitsPerPage;
        const endIndex = startIndex + unitsPerPage;
        unitsData = allUnits.slice(startIndex, endIndex);
      }

      // Mostrar las unidades inmediatamente con datos básicos
      const unitsWithBasicData = unitsData.map((unit: Unit) => ({
        ...unit,
        real_rating: unit.rating || 0,
        real_total_reviews: unit.total_reviews || 0
      }));

      setUnits(unitsWithBasicData);
      setIsLoading(false);

      // Cargar ratings en tiempo real de forma individual
      loadRatingsIndividually(unitsData);
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error('Error al cargar unidades');
      setUnits([]);
      setTotalUnits(0);
      setTotalPages(1);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [currentPage, statusFilter, typeFilter, searchTerm]);

  // Los filtros se aplican en el servidor, solo aplicamos búsqueda local si es necesario
  const filteredUnits = units;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupado';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return status;
    }
  };

  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'Departamento';
      case 'house':
        return 'Casa';
      case 'studio':
        return 'Estudio';
      case 'room':
        return 'Habitación';
      default:
        return type;
    }
  };

  // Calcular estadísticas de las unidades actuales (página actual)
  const availableUnits = units.filter(u => u.status === 'available').length;
  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const totalRevenue = units.filter(u => u.status === 'occupied').reduce((sum, u) => sum + u.monthly_rent, 0);

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

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchTerm]);

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
          <h1 className="text-2xl font-bold text-gray-900">Mis Propiedades</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra todas tus propiedades y gestiona su disponibilidad
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Nueva Propiedad
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HomeModernIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Propiedades
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalUnits}
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
                <HomeModernIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Disponibles
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {availableUnits}
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
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ocupadas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {occupiedUnits}
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
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos Mensuales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    S/ {totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar propiedades..."
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
              <option value="available">Disponibles</option>
              <option value="occupied">Ocupadas</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="apartment">Departamentos</option>
              <option value="house">Casas</option>
              <option value="studio">Estudios</option>
              <option value="room">Habitaciones</option>
            </select>
          </div>
        </div>
      </div>

      {/* Información de paginación */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white shadow rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-600">
              Mostrando {units.length} de {totalUnits} propiedades
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Página {currentPage} de {totalPages}
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.map((unit) => (
          <div key={unit.id} className="bg-white overflow-hidden shadow rounded-lg">
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
              <button 
                onClick={() => navigate(`/properties/${unit.public_id}`)}
                className="w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-lg"
              >
                {unit.images.length > 0 ? (
                  <img 
                    src={unit.images[0]} 
                    alt={unit.title}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </button>
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                  {getStatusText(unit.status)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {unit.title}
                </h3>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {loadingUnits.has(unit.public_id) ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></div>
                        Cargando...
                      </span>
                    ) : (
                      `${unit.real_rating || 0} (${unit.real_total_reviews || 0})`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                {unit.address}, {unit.district}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{getPropertyTypeText(unit.property_type)}</span>
                <span>{unit.bedrooms} hab • {unit.bathrooms} baños • {unit.area_sqm}m²</span>
              </div>

              {unit.tenant_name && (
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <UserGroupIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  Inquilino: {unit.tenant_name}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    S/ {unit.monthly_rent.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">por noche</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleView(unit)}
                    className="text-gray-400 hover:text-blue-500"
                    title="Ver detalles"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleEdit(unit)}
                    className="text-gray-400 hover:text-yellow-500"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(unit.public_id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          {/* Botón Anterior */}
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Anterior
          </button>

          {/* Números de página */}
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Siguiente
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}

      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <HomeModernIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay propiedades</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No se encontraron propiedades con los filtros aplicados.'
              : 'Comienza agregando tu primera propiedad.'
            }
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingUnit && (
        <EditUnitModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          unit={editingUnit}
          onUpdate={handleUpdateUnit}
        />
      )}

      {/* View Modal */}
      <ViewUnitModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        unit={viewingUnit}
      />

      {/* Modal para crear nueva propiedad */}
      <CreatePropertyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchUnits(); // Recargar la lista de propiedades
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default Units;
