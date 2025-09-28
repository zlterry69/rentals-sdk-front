import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BellIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { api } from '@/app/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

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

const Activity: React.FC = () => {
  const { user } = useAuth();
  const [allActivity, setAllActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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

  // Fetch all activity data
  useEffect(() => {
    const fetchAllActivity = async () => {
      try {
        setIsLoading(true);
        
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

        // Generate activity from all data
        const activity: ActivityItem[] = [];
        
        // Add all properties
        properties.forEach((property: any) => {
          activity.push({
            id: `property-${property.public_id}`,
            type: 'property',
            title: `Propiedad creada: ${property.title}`,
            description: `Propiedad agregada en ${property.district}`,
            time: property.created_at,
            amount: null,
            icon: HomeIcon,
            color: 'text-blue-600'
          });
        });

        // Add all received bookings (estas son reservas que RECIBÍ como propietario)
        receivedBookings.forEach((booking: any) => {
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

        // Add all bookings made by me (estas son reservas que YO hice como huésped)
        myBookings.forEach((booking: any) => {
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
        
        setAllActivity(activity);
        
      } catch (error) {
        console.error('Error fetching activity data:', error);
        toast.error('Error al cargar la actividad');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllActivity();
  }, []);

  // Filter activity
  const filteredActivity = allActivity.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                to="/dashboard"
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Actividad Completa</h1>
                <p className="text-sm text-gray-600">
                  Historial completo de todas tus actividades en HogarPerú
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todas las actividades</option>
                <option value="property">Solo propiedades</option>
                <option value="received-booking">Reservas recibidas</option>
                <option value="my-booking">Mis reservas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredActivity.length > 0 ? (
              <div className="space-y-6">
                {filteredActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-b-0">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center`}>
                        <activity.icon className={`h-5 w-5 ${activity.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        {activity.amount && (
                          <span className="text-sm font-medium text-green-600">
                            {activity.amount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTimeAgo(activity.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-500 mb-2">No hay actividad</p>
                <p className="text-sm text-gray-400">
                  {filter === 'all' 
                    ? 'Aún no tienes actividad registrada'
                    : `No hay actividad del tipo "${filter === 'property' ? 'propiedades' : 'reservas'}"`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
