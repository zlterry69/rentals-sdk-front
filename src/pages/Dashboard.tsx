import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { CreatePropertyModal } from '@/components/modals/CreatePropertyModal';
import { api } from '@/app/api';
import toast from 'react-hot-toast';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  amount: string | null;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    totalEarnings: 0,
    pendingPayments: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // Fetch dashboard stats and recent activity from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingActivity(true);
        
        // Fetch user's properties
        const propertiesResponse = await api.get('/units');
        const properties = propertiesResponse.data || [];
        
        // Fetch user's bookings (as guest) and received bookings (as owner)
        let myBookings = []; // Reservas que YO hice como huésped
        let receivedBookings = []; // Reservas que RECIBÍ como propietario
        
        try {
          const myBookingsResponse = await api.get('/bookings/my-bookings');
          myBookings = myBookingsResponse.data || [];
        } catch (bookingError) {
          console.log('My bookings endpoint not available yet');
        }
        
        try {
          const receivedBookingsResponse = await api.get('/bookings/received');
          receivedBookings = receivedBookingsResponse.data || [];
        } catch (bookingError) {
          console.log('Received bookings endpoint not available yet');
        }
        
        // Calculate stats
        const totalProperties = properties.length;
        const totalMyBookings = myBookings.length; // Reservas que hice como huésped
        const totalReceivedBookings = receivedBookings.length; // Reservas recibidas como propietario
        const totalEarnings = receivedBookings.reduce((sum: number, booking: any) => 
          sum + (booking.total_amount || 0), 0
        ); // Ganancias de las reservas recibidas
        
        setStats({
          totalProperties,
          totalBookings: totalReceivedBookings, // Mostrar reservas recibidas como propietario
          totalEarnings,
          pendingPayments: 0 // TODO: Implement when payments endpoint is ready
        });

        // Generate recent activity from real data
        const activity: ActivityItem[] = [];
        
        // Add recent properties
        properties.slice(0, 2).forEach((property: any) => {
          activity.push({
            id: `property-${property.public_id}`,
            type: 'property',
            title: `Nueva propiedad: ${property.title}`,
            description: `Propiedad agregada en ${property.district}`,
            time: property.created_at,
            amount: null,
            icon: HomeIcon,
            color: 'text-blue-600'
          });
        });

        // Add recent received bookings (estas son reservas que RECIBÍ como propietario)
        receivedBookings.slice(0, 2).forEach((booking: any) => {
          activity.push({
            id: `received-booking-${booking.public_id}`,
            type: 'received-booking',
            title: `Reserva recibida`,
            description: `${booking.unit_title} reservado del ${booking.check_in_date} al ${booking.check_out_date}`,
            time: booking.created_at,
            amount: `+S/ ${booking.total_amount?.toLocaleString()}`, // Positivo porque es un ingreso
            icon: CalendarIcon,
            color: 'text-green-600' // Verde porque es un ingreso
          });
        });

        // Add recent bookings made by me (estas son reservas que YO hice como huésped)
        myBookings.slice(0, 1).forEach((booking: any) => {
          activity.push({
            id: `my-booking-${booking.public_id}`,
            type: 'my-booking',
            title: `Reserva realizada`,
            description: `Reservaste del ${booking.check_in_date} al ${booking.check_out_date}`,
            time: booking.created_at,
            amount: `-S/ ${booking.total_amount?.toLocaleString()}`, // Negativo porque es un gasto
            icon: CalendarIcon,
            color: 'text-red-600' // Rojo porque es un gasto
          });
        });

        // Sort by date (most recent first)
        activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        
        setRecentActivity(activity.slice(0, 4)); // Show only 4 most recent
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error al cargar datos del dashboard');
      } finally {
        setIsLoadingActivity(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      name: 'Nueva Propiedad',
      description: 'Agregar una nueva propiedad',
      icon: PlusIcon,
      onClick: () => setIsCreateModalOpen(true),
      color: 'bg-blue-500'
    },
    {
      name: 'Ver Reservas',
      description: 'Gestionar reservas activas',
      icon: CalendarIcon,
      href: '/bookings',
      color: 'bg-green-500'
    },
    {
      name: 'Pagos',
      description: 'Revisar pagos y facturas',
      icon: CurrencyDollarIcon,
      href: '/payments',
      color: 'bg-yellow-500'
    },
    {
      name: 'Propiedades',
      description: 'Ver todas mis propiedades',
      icon: HomeIcon,
      href: '/units',
      color: 'bg-purple-500'
    }
  ];

  // Helper function to format time
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ¡Hola, {user?.full_name || user?.email || 'Usuario'}! 👋
                </h1>
                <p className="text-sm text-gray-600">
                  Aquí tienes un resumen de tu actividad en HogarPeru
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notificaciones ya están en el Header principal */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HomeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Mis Propiedades
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalProperties}
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
                  <CalendarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Reservas Recibidas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalBookings}
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
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ingresos como Propietario
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      S/ {stats.totalEarnings.toFixed(2)}
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
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pagos Pendientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pendingPayments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Acciones Rápidas
                </h3>
                <div className="space-y-3">
                  {quickActions.map((action) => {
                    const Component = action.onClick ? 'button' : 'a';
                    const props = action.onClick 
                      ? { onClick: action.onClick, type: 'button' as const }
                      : { href: action.href };
                    
                    return (
                      <Component
                        key={action.name}
                        {...props}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <div className={`flex-shrink-0 w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                          <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {action.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {action.description}
                          </p>
                        </div>
                      </Component>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Actividad Reciente
                  </h3>
                  <a 
                    href="/activity" 
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Ver todo
                  </a>
                </div>
                <div className="space-y-4">
                  {isLoadingActivity ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <activity.icon className={`h-5 w-5 ${activity.color}`} />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500">{activity.description}</p>
                            <p className="text-xs text-gray-400">{formatTimeAgo(activity.time)}</p>
                          </div>
                        </div>
                        {activity.amount && (
                          <span className="text-sm font-medium text-green-600">
                            {activity.amount}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">No hay actividad reciente</p>
                      <p className="text-xs text-gray-400">La actividad aparecerá aquí cuando tengas propiedades o reservas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear nueva propiedad */}
      <CreatePropertyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // Recargar datos del dashboard
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Dashboard;
