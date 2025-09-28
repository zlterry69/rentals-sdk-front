import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  FunnelIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { api } from '@/app/api';
import PublicHeader from '@/components/layout/PublicHeader';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  public_id: string;
  title: string;
  description: string;
  address: string;
  district: string;
  monthly_rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  amenities: string[];
  images: string[];
  rating: number;
  total_reviews: number;
  status: string;
}

const PropertiesList: React.FC = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    check_in: '',
    check_out: '',
    guests: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Fetch properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/units/available');
        setProperties(response.data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Error al cargar propiedades');
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSearch = () => {
    // Implement search logic
    console.log('Searching with filters:', searchFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header dinámico */}
      <PublicHeader />

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Location */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Dónde?
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar destino"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Check-in */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Llegada
              </label>
              <div className="relative">
                <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={searchFilters.check_in}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, check_in: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Check-out */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salida
              </label>
              <div className="relative">
                <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={searchFilters.check_out}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, check_out: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Huéspedes
              </label>
              <div className="relative">
                <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={searchFilters.guests}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'huésped' : 'huéspedes'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>Buscar</span>
              </button>
            </div>
          </div>

          {/* Filters Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filtros</span>
            </button>
            <div className="text-sm text-gray-600">
              {properties.length} propiedades encontradas
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="relative">
                <img
                  src={property.images && property.images.length > 0 ? property.images[0] : '/image_default_properties.jpg'}
                  alt={property.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(property.public_id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  {favorites.includes(property.public_id) ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Property Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{property.rating || 0}</span>
                    <span className="text-sm text-gray-500">({property.total_reviews || 0})</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {property.address}
                </p>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {property.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {property.bedrooms} hab • {property.bathrooms} baños • {property.area_sqm} m²
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      S/ {property.monthly_rent.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">por mes</div>
                  </div>
                </div>

                <Link
                  to={`/properties/${property.public_id}`}
                  className="mt-4 block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay propiedades disponibles</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Actualmente no hay propiedades disponibles para alquilar. ¡Vuelve pronto para ver nuevas opciones!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesList;