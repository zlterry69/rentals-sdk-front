import React, { useState, useEffect } from 'react';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/app/api';
import { toast } from 'react-hot-toast';

interface Booking {
  id: string;
  public_id: string;
  unit_id: string;
  unit_title: string;
  guest_user_id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  nightly_rate: number;
  total_nights: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total_amount: number;
  status: string;
  payment_status: string;
  special_requests?: string;
  booking_date: string;
  created_at: string;
}

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const bookingsPerPage = 20;

  useEffect(() => {
    fetchBookings();
  }, [currentPage, filter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', bookingsPerPage.toString());
      if (filter !== 'all') params.append('status', filter);

      const response = await api.get(`/bookings/my-bookings?${params.toString()}`);
      
      // Si la API devuelve datos paginados
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        setBookings(response.data.data || []);
        setTotalBookings(response.data.total || 0);
        setTotalPages(response.data.total_pages || 1);
      } else {
        // Si la API devuelve un array simple, lo paginamos en el frontend
        const allBookings = response.data || [];
        setTotalBookings(allBookings.length);
        setTotalPages(Math.ceil(allBookings.length / bookingsPerPage));
        
        // Aplicar paginación en el frontend
        const startIndex = (currentPage - 1) * bookingsPerPage;
        const endIndex = startIndex + bookingsPerPage;
        setBookings(allBookings.slice(startIndex, endIndex));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error al cargar las reservas');
      setBookings([]);
      setTotalBookings(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  // Los filtros se aplican en el servidor
  const filteredBookings = bookings;

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
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Reservas</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gestiona todas tus reservas de alojamiento
            </p>
          </div>
          
          {/* Filter */}
          <div className="mt-4 sm:mt-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="block w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">Todas las reservas</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Información de paginación */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Mostrando {bookings.length} de {totalBookings} reservas
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Página {currentPage} de {totalPages}
            </p>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Property Info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {/* Property Image */}
                      <div className="flex-shrink-0">
                        {/* TODO: Agregar imagen de la propiedad desde el backend */}
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <MapPinIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {booking.unit_title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          Reserva #{booking.public_id}
                        </p>
                        
                        {/* Booking Details */}
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {booking.total_nights} noches
                          </div>
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            S/ {booking.total_amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end space-y-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                        Ver detalles
                      </button>
                      {booking.status === 'pending' && (
                        <button className="text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12">
          <div className="text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {filter === 'all' ? 'No tienes reservas' : `No tienes reservas ${getStatusText(filter).toLowerCase()}`}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {filter === 'all' 
                ? 'Cuando hagas una reserva, aparecerá aquí. ¡Explora nuestras propiedades disponibles!'
                : `No hay reservas con estado ${getStatusText(filter).toLowerCase()} en este momento.`
              }
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <a
                  href="/explore"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Explorar Propiedades
                </a>
              </div>
            )}
          </div>
        </div>
      )}

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
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
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
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
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
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
            }`}
          >
            Siguiente
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookings;
