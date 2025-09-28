import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeIcon,
  StarIcon,
  HeartIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { apiClient } from '@/app/api';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  public_id: string;
  title: string;
  description?: string;
  address: string;
  district: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  monthly_rent: number;
  deposit?: number;
  amenities?: string[];
  rules?: string;
  available_from?: string;
  status: string;
  images?: string[];
  owner_id: string;
  owner_name?: string;
  rating?: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

const ExploreRentals: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [bedrooms, setBedrooms] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (selectedDistrict !== 'all') params.append('district_filter', selectedDistrict);
        if (priceRange.min > 0) params.append('min_price', priceRange.min.toString());
        if (priceRange.max < 5000) params.append('max_price', priceRange.max.toString());
        if (bedrooms !== 'all') params.append('bedrooms', bedrooms);

        const response = await apiClient.get(`/units/available?${params.toString()}`);
        setProperties(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Error al cargar propiedades');
        setProperties([]);
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [selectedDistrict, priceRange, bedrooms]); // Re-fetch when filters change

  const districts = [
    'Miraflores', 'San Isidro', 'Barranco', 'Lima', 'Santiago de Surco',
    'La Molina', 'San Borja', 'Magdalena', 'Jesús María', 'Lince'
  ];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.district.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDistrict = selectedDistrict === 'all' || property.district === selectedDistrict;
    const matchesPrice = property.monthly_rent >= priceRange.min && property.monthly_rent <= priceRange.max;
    const matchesBedrooms = bedrooms === 'all' || property.bedrooms.toString() === bedrooms;
    
    return matchesSearch && matchesDistrict && matchesPrice && matchesBedrooms && property.status === 'available';
  });

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Explorar Alquileres</h1>
        <p className="text-blue-100">Encuentra tu hogar perfecto en Lima</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por ubicación, título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los distritos</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          {/* Bedrooms Filter */}
          <div>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Cualquier habitación</option>
              <option value="1">1 habitación</option>
              <option value="2">2 habitaciones</option>
              <option value="3">3 habitaciones</option>
              <option value="4">4+ habitaciones</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min || ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max || ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 5000 }))}
                className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredProperties.length === 0 
            ? 'No se encontraron propiedades' 
            : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}`
          }
        </p>
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
          Más filtros
        </button>
      </div>

      {/* Properties Grid */}
      {!isLoading && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src="/image_default_properties.jpg" 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Favorite Button */}
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

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {property.rating || 0} ({property.total_reviews})
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  {property.address}, {property.district}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{property.bedrooms} hab • {property.bathrooms} baños • {property.area_sqm}m²</span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {property.description || 'Sin descripción disponible'}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      S/ {property.monthly_rent.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">por mes</p>
                  </div>
                  <Link
                    to={`/properties/${property.public_id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State - Solo mostrar si no está cargando y hay filtros aplicados */}
      {!isLoading && filteredProperties.length === 0 && (searchTerm || selectedDistrict !== 'all' || bedrooms !== 'all') && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron propiedades</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Intenta ajustar tus filtros de búsqueda para encontrar más opciones.
          </p>
        </div>
      )}

      {/* Completely Empty State - Solo mostrar si no hay propiedades y no hay filtros */}
      {!isLoading && properties.length === 0 && !searchTerm && selectedDistrict === 'all' && bedrooms === 'all' && (
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Próximamente</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Estamos preparando increíbles propiedades para ti. ¡Vuelve pronto para descubrir tu hogar ideal!
          </p>
        </div>
      )}
    </div>
  );
};

export default ExploreRentals;
