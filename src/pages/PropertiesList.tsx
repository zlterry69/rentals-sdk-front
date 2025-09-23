import React, { useState } from 'react';
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
import { allProperties } from '@/data/allProperties';

const PropertiesList: React.FC = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    check_in: '',
    check_out: '',
    guests: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSearch = () => {
    // Implement search logic
    console.log('Searching with filters:', searchFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">HogarPerú</div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/contact" className="text-gray-700 hover:text-blue-600">
                Contacto
              </Link>
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

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
              {allProperties.length} propiedades encontradas
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="relative">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(property.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  {favorites.includes(property.id) ? (
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
                    <span className="text-sm text-gray-600">{property.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {property.location.city}, {property.location.country}
                </p>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {property.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {property.bedrooms} habitaciones • {property.bathrooms} baños
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ${property.price_per_night}
                    </div>
                    <div className="text-sm text-gray-500">por noche</div>
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
      </div>
    </div>
  );
};

export default PropertiesList;