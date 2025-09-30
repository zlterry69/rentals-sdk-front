import React, { useState, useEffect } from 'react';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon, UserIcon, HomeIcon, PencilIcon, TrashIcon, CheckIcon, XCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/app/api';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import EditBookingStatusModal from '@/components/modals/EditBookingStatusModal';
import { PaymentModal } from '@/components/PaymentModal';

interface Booking {
  id: string;
  public_id: string;
  unit_id: string;
  unit_title: string;
  unit_images?: string[];
  guest_user_id: string;
  guest_name?: string;
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
  const [activeTab, setActiveTab] = useState<'my-bookings' | 'manage-requests'>('my-bookings');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingToPay, setBookingToPay] = useState<Booking | null>(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const bookingsPerPage = 20;

  useEffect(() => {
    fetchBookings();
  }, [currentPage, filter, activeTab]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', bookingsPerPage.toString());
      if (filter !== 'all') params.append('status', filter);

      // Choose endpoint based on active tab
      const endpoint = activeTab === 'my-bookings' ? '/bookings/my-bookings' : '/bookings/received';
      const response = await api.get(`${endpoint}?${params.toString()}`);
      
      // Debug: Log the response structure
      console.log('Bookings API Response:', {
        endpoint,
        status: response.status,
        dataType: typeof response.data,
        hasBookings: 'bookings' in (response.data || {}),
        hasData: 'data' in (response.data || {}),
        isArray: Array.isArray(response.data),
        data: response.data
      });
      
      // Si la API devuelve datos paginados (estructura con 'bookings' y 'pagination')
      if (response.data && typeof response.data === 'object' && 'bookings' in response.data) {
        // Mapear los datos del backend al formato esperado por el frontend
        const mappedBookings = (response.data.bookings || []).map((booking: any) => ({
          ...booking,
          unit_title: booking.units?.title || 'Sin título',
          unit_images: booking.units?.images || [],
          guest_name: booking.users?.full_name || 'Sin nombre',
          status: booking.process_status?.code || 'PENDING',
          status_description: booking.process_status?.description || 'Sin descripción'
        }));
        
        setBookings(mappedBookings);
        setTotalBookings(response.data.pagination?.total || 0);
        setTotalPages(Math.ceil((response.data.pagination?.total || 0) / bookingsPerPage));
      } 
      // Si la API devuelve datos paginados (estructura con 'data' y 'total')
      else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Mapear los datos del backend al formato esperado por el frontend
        const mappedBookings = (response.data.data || []).map((booking: any) => ({
          ...booking,
          unit_title: booking.units?.title || 'Sin título',
          unit_images: booking.units?.images || [],
          guest_name: booking.users?.full_name || 'Sin nombre',
          status: booking.process_status?.code || 'PENDING',
          status_description: booking.process_status?.description || 'Sin descripción'
        }));
        
        setBookings(mappedBookings);
        setTotalBookings(response.data.total || 0);
        setTotalPages(response.data.total_pages || 1);
      } 
      // Si la API devuelve un array simple, lo paginamos en el frontend
      else {
        const allBookings = response.data || [];
        
        // Validar que allBookings sea un array
        if (!Array.isArray(allBookings)) {
          console.error('Expected array but got:', typeof allBookings, allBookings);
          setBookings([]);
          setTotalBookings(0);
          setTotalPages(1);
          return;
        }
        
        setTotalBookings(allBookings.length);
        setTotalPages(Math.ceil(allBookings.length / bookingsPerPage));
        
        // Mapear los datos del backend al formato esperado por el frontend
        const mappedBookings = allBookings.map((booking: any) => ({
          ...booking,
          unit_title: booking.units?.title || 'Sin título',
          unit_images: booking.units?.images || [],
          guest_name: booking.users?.full_name || 'Sin nombre',
          status: booking.process_status?.code || 'PENDING',
          status_description: booking.process_status?.description || 'Sin descripción'
        }));
        
        // Aplicar paginación en el frontend
        const startIndex = (currentPage - 1) * bookingsPerPage;
        const endIndex = startIndex + bookingsPerPage;
        setBookings(mappedBookings.slice(startIndex, endIndex));
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

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/approve`);
      toast.success('Reserva aprobada exitosamente');
      fetchBookings(); // Refresh the list
    } catch (error: any) {
      console.error('Error approving booking:', error);
      toast.error(error.response?.data?.detail || 'Error al aprobar la reserva');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de que quieres rechazar esta reserva?')) {
      return;
    }
    
    try {
      await api.patch(`/bookings/${bookingId}/reject`);
      toast.success('Reserva rechazada exitosamente');
      fetchBookings(); // Refresh the list
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      toast.error(error.response?.data?.detail || 'Error al rechazar la reserva');
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }

    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Reserva cancelada exitosamente');
      fetchBookings();
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error('Error al cancelar la reserva');
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setShowEditModal(true);
  };

  const handleDeleteBooking = (booking: Booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      await api.delete(`/bookings/${bookingToDelete.public_id}`);
      toast.success('Reserva eliminada exitosamente');
      fetchBookings();
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Error al eliminar la reserva');
    }
  };

  const handlePayBooking = (booking: Booking) => {
    setBookingToPay(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method: any) => {
    if (!bookingToPay) return;
    
    try {
      // Aquí se integrará con NOWPayments
      toast.success('Redirigiendo al pago...');
      setShowPaymentModal(false);
      setBookingToPay(null);
      // Recargar las reservas para actualizar el estado
      fetchBookings();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago');
    }
  };

  const handlePayLater = async () => {
    if (!bookingToPay) return;
    
    try {
      // Marcar como pendiente de pago
      toast.success('Reserva marcada para pago posterior');
      setShowPaymentModal(false);
      setBookingToPay(null);
      fetchBookings();
    } catch (error) {
      console.error('Error marking for later payment:', error);
      toast.error('Error al marcar para pago posterior');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(`Estado actualizado a ${getStatusText(newStatus)}`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const getStatusColor = (status: string) => {
    console.log('Estado recibido para color:', status, 'tipo:', typeof status);
    switch (status) {
      // Estados en inglés (códigos)
      case 'CONFIRMED':
      case 'APPROVED':
      case 'BOOKING_CONFIRMED':  // Nuevo código
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
      case 'BOOKING_PENDING':  // Nuevo código
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CANCELLED':
      case 'REJECTED':
      case 'BOOKING_CANCELLED':  // Nuevo código
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
          case 'COMPLETED':
          case 'BOOKING_COMPLETED':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      // Estados en español (nombres de la BD)
      case 'Confirmada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Cancelada':
      case 'Rechazada':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Completada':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'En curso':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        console.log('Estado no reconocido, usando gris:', status);
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      // Estados en inglés (códigos)
      case 'CONFIRMED':
      case 'BOOKING_CONFIRMED':  // Nuevo código
        return 'Confirmada';
      case 'APPROVED':
        return 'Aprobada';
      case 'PENDING':
      case 'BOOKING_PENDING':  // Nuevo código
        return 'Pendiente';
      case 'CANCELLED':
      case 'BOOKING_CANCELLED':  // Nuevo código
        return 'Cancelada';
      case 'REJECTED':
        return 'Rechazada';
          case 'COMPLETED':
          case 'BOOKING_COMPLETED':
            return 'Completada';
      // Estados en español (nombres de la BD) - devolver tal como están
      case 'Confirmada':
      case 'Pendiente':
      case 'Cancelada':
      case 'Rechazada':
      case 'Completada':
      case 'En curso':
        return status;
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservas</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'my-bookings' 
                ? 'Gestiona todas tus reservas de alojamiento'
                : 'Gestiona las solicitudes de reserva de tus propiedades'
              }
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
        
        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-bookings'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Mis Reservas
            </button>
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <button
                onClick={() => setActiveTab('manage-requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manage-requests'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Gestionar Solicitudes
              </button>
            )}
          </nav>
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
                        {booking.unit_images && booking.unit_images.length > 0 ? (
                          <img
                            src={booking.unit_images[0]}
                            alt={booking.unit_title}
                            className="w-20 h-20 rounded-lg object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"><svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <MapPinIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
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
                        {activeTab === 'manage-requests' && booking.guest_name && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Huésped: {booking.guest_name}
                          </p>
                        )}
                        
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
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="p-1 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                        title="Ver detalles"
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </button>
                      
                      {activeTab === 'my-bookings' && (
                        <>
                          {/* Mostrar botón de pago solo si está pendiente */}
                          {booking.payment_status === 'PENDING' && (
                            <button 
                              onClick={() => handlePayBooking(booking)}
                              className="p-1 text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                              title="Pagar reserva"
                            >
                              <CreditCardIcon className="h-4 w-4" />
                            </button>
                          )}
                          {/* Mostrar botón de cancelar solo si está pendiente y no pagado */}
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && booking.payment_status === 'PENDING' && (
                            <button 
                              onClick={() => handleCancelBooking(booking.public_id)}
                              className="p-1 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                              title="Cancelar reserva"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                      
                      {activeTab === 'manage-requests' && (
                        <>
                          <button 
                            onClick={() => handleEditBooking(booking)}
                            className="p-1 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar estado de reserva"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          {booking.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => handleApproveBooking(booking.public_id)}
                                className="p-1 text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                                title="Aprobar reserva"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleRejectBooking(booking.public_id)}
                                className="p-1 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                                title="Rechazar reserva"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleDeleteBooking(booking)}
                            className="p-1 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar reserva"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
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
              {activeTab === 'my-bookings' 
                ? (filter === 'all' ? 'No tienes reservas' : `No tienes reservas ${getStatusText(filter).toLowerCase()}`)
                : (filter === 'all' ? 'No hay solicitudes de reserva' : `No hay solicitudes ${getStatusText(filter).toLowerCase()}`)
              }
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {activeTab === 'my-bookings' 
                ? (filter === 'all' 
                    ? 'Cuando hagas una reserva, aparecerá aquí. ¡Explora nuestras propiedades disponibles!'
                    : `No hay reservas con estado ${getStatusText(filter).toLowerCase()} en este momento.`
                  )
                : (filter === 'all' 
                    ? 'Cuando alguien solicite reservar una de tus propiedades, aparecerá aquí.'
                    : `No hay solicitudes con estado ${getStatusText(filter).toLowerCase()} en este momento.`
                  )
              }
            </p>
            {activeTab === 'my-bookings' && filter === 'all' && (
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

      {/* Booking Details Modal */}
      <Transition appear show={showDetailsModal} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowDetailsModal(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Detalles de la Reserva
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => setShowDetailsModal(false)}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {selectedBooking && (
                    <div className="space-y-6">
                      {/* Property Info */}
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {selectedBooking.unit_images && selectedBooking.unit_images.length > 0 ? (
                              <img
                                src={selectedBooking.unit_images[0]}
                                alt={selectedBooking.unit_title}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center"><svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"></path></svg></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                <HomeIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {selectedBooking.unit_title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Reserva #{selectedBooking.public_id}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Guest Info */}
                      {selectedBooking.guest_name && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2" />
                            Información del Huésped
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Nombre:</strong> {selectedBooking.guest_name}
                          </p>
                        </div>
                      )}

                      {/* Booking Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <CalendarIcon className="h-5 w-5 mr-2" />
                            Fechas
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>Check-in:</strong> {new Date(selectedBooking.check_in_date).toLocaleDateString('es-PE')}</p>
                            <p><strong>Check-out:</strong> {new Date(selectedBooking.check_out_date).toLocaleDateString('es-PE')}</p>
                            <p><strong>Noches:</strong> {selectedBooking.total_nights}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                            Costos
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>Huéspedes:</strong> {selectedBooking.guests_count}</p>
                            <p><strong>Precio por noche:</strong> S/ {selectedBooking.nightly_rate.toFixed(2)}</p>
                            <p><strong>Subtotal:</strong> S/ {selectedBooking.subtotal.toFixed(2)}</p>
                            <p><strong>Limpieza:</strong> S/ {selectedBooking.cleaning_fee.toFixed(2)}</p>
                            <p><strong>Servicio:</strong> S/ {selectedBooking.service_fee.toFixed(2)}</p>
                            <p><strong>Impuestos:</strong> S/ {selectedBooking.taxes.toFixed(2)}</p>
                            <p className="font-semibold text-lg"><strong>Total:</strong> S/ {selectedBooking.total_amount.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status and Payment */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            Estado
                          </h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                            {getStatusText(selectedBooking.status)}
                          </span>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            Pago
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Estado:</strong> {selectedBooking.payment_status}
                          </p>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {selectedBooking.special_requests && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            Solicitudes Especiales
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedBooking.special_requests}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowDetailsModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        >
                          Cerrar
                        </button>
                        {activeTab === 'manage-requests' && selectedBooking.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                handleApproveBooking(selectedBooking.public_id);
                                setShowDetailsModal(false);
                              }}
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => {
                                handleRejectBooking(selectedBooking.public_id);
                                setShowDetailsModal(false);
                              }}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de confirmación de eliminación */}
      <Transition appear show={showDeleteModal} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteModal(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Confirmar eliminación
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ¿Estás seguro de que quieres eliminar esta reserva? Esta acción no se puede deshacer.
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={confirmDeleteBooking}
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de edición de reserva */}
      <EditBookingStatusModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdateStatus={(status) => {
          if (editingBooking) {
            handleUpdateBookingStatus(editingBooking.public_id, status);
          }
        }}
        bookingTitle={editingBooking?.unit_title}
      />
      
      {/* Modal antiguo - comentado */}
      {/*
      <Transition appear show={showEditModal} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowEditModal(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Editar Estado de Reserva
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Cambiar el estado de la reserva de <strong>{editingBooking?.unit_title}</strong>
                    </p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          if (editingBooking) {
                            handleUpdateBookingStatus(editingBooking.public_id, 'PENDING');
                            setShowEditModal(false);
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 rounded-md transition-colors"
                      >
                        📋 Marcar como Pendiente
                      </button>
                      
                      <button
                        onClick={() => {
                          if (editingBooking) {
                            handleUpdateBookingStatus(editingBooking.public_id, 'APPROVED');
                            setShowEditModal(false);
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 rounded-md transition-colors"
                      >
                        ✅ Aprobar Reserva
                      </button>
                      
                      <button
                        onClick={() => {
                          if (editingBooking) {
                            handleUpdateBookingStatus(editingBooking.public_id, 'REJECTED');
                            setShowEditModal(false);
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 rounded-md transition-colors"
                      >
                        ❌ Rechazar Reserva
                      </button>
                      
                      <button
                        onClick={() => {
                          if (editingBooking) {
                            handleUpdateBookingStatus(editingBooking.public_id, 'CONFIRMED');
                            setShowEditModal(false);
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 rounded-md transition-colors"
                      >
                        🔒 Confirmar Reserva
                      </button>
                      
                      <button
                        onClick={() => {
                          if (editingBooking) {
                            handleUpdateBookingStatus(editingBooking.public_id, 'CANCELLED');
                            setShowEditModal(false);
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-orange-700 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800 rounded-md transition-colors"
                      >
                        🚫 Cancelar Reserva
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      */}

      {/* Payment Modal */}
      {bookingToPay && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setBookingToPay(null);
          }}
          amount={bookingToPay.total_amount}
          currency="PEN"
          onPaymentMethodSelect={handlePaymentMethodSelect}
          onPayLater={handlePayLater}
        />
      )}
    </div>
  );
};

export default Bookings;
