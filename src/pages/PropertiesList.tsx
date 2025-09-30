import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';
import { useLoginModal } from '@/hooks/useLoginModal';
import LoginModal from '@/components/modals/LoginModal';
import RegisterModal from '@/components/modals/RegisterModal';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';
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
  owner_id: string;
  owner_name?: string;
  owner_profile_image?: string;
  real_rating?: number;
  real_total_reviews?: number;
}

const PropertiesList: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    showLoginModal,
    showRegisterModal,
    showForgotPasswordModal,
    handleCloseLoginModal,
    handleSwitchToRegister,
    handleSwitchToForgotPassword,
    handleCloseRegisterModal,
    handleSwitchToLogin,
    handleCloseForgotPasswordModal,
    handleSwitchToLoginFromForgot,
  } = useLoginModal();
  
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    check_in: '',
    check_out: '',
    guests: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState<Set<string>>(new Set());

  const toggleFavorite = async (propertyId: string) => {
    if (!isAuthenticated) {
      handleSwitchToRegister(); // Abrir modal de login
      return;
    }
    
    try {
      const response = await api.post('/favorites/toggle', {
        unit_public_id: propertyId
      });
      
      const { is_favorite } = response.data;
      
      setFavorites(prev => 
        is_favorite 
          ? [...prev, propertyId]
          : prev.filter(id => id !== propertyId)
      );
      
      toast.success(is_favorite ? 'Agregado a favoritos' : 'Eliminado de favoritos');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favoritos');
    }
  };

  // Function to calculate real-time rating for a property
  const calculatePropertyRating = async (propertyPublicId: string) => {
    try {
      const response = await api.get(`/reviews/unit/${propertyPublicId}`);
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
  const loadRatingsIndividually = async (propertiesData: Property[]) => {
    for (const property of propertiesData) {
      // Marcar como cargando
      setLoadingProperties(prev => new Set(prev).add(property.public_id));
      
      try {
        const { rating, total_reviews } = await calculatePropertyRating(property.public_id);
        
        // Actualizar solo esta propiedad
        setProperties(prevProperties => 
          prevProperties.map(p => 
            p.public_id === property.public_id 
              ? { ...p, real_rating: rating, real_total_reviews: total_reviews }
              : p
          )
        );
        setFilteredProperties(prevProperties => 
          prevProperties.map(p => 
            p.public_id === property.public_id 
              ? { ...p, real_rating: rating, real_total_reviews: total_reviews }
              : p
          )
        );
      } catch (error) {
        console.error(`Error loading rating for property ${property.public_id}:`, error);
      } finally {
        // Quitar de cargando
        setLoadingProperties(prev => {
          const newSet = new Set(prev);
          newSet.delete(property.public_id);
          return newSet;
        });
      }
    }
  };

  // Fetch user favorites
  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/favorites/');
      const favoritesData = response.data || [];
      const favoriteIds = favoritesData.map((fav: any) => fav.unit_public_id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Fetch properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/units/available');
        const propertiesData = response.data || [];
        
        // Mostrar las propiedades inmediatamente con datos básicos
        const propertiesWithBasicData = propertiesData.map((property: Property) => ({
          ...property,
          real_rating: property.rating || 0,
          real_total_reviews: property.total_reviews || 0
        }));
        
        setProperties(propertiesWithBasicData);
        setFilteredProperties(propertiesWithBasicData);

        // Cargar ratings en tiempo real de forma individual
        loadRatingsIndividually(propertiesData);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Error al cargar propiedades');
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Fetch favorites when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  // Filter properties based on search criteria
  const filterProperties = (propertiesToFilter: Property[]) => {
    return propertiesToFilter.filter(property => {
      // Location filter
      if (searchFilters.location && !property.address.toLowerCase().includes(searchFilters.location.toLowerCase())) {
        return false;
      }
      
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(property.public_id)) {
        return false;
      }
      
      return true;
    });
  };

  const handleSearch = () => {
    const filtered = filterProperties(properties);
    setFilteredProperties(filtered);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const location = e.target.value;
    setSearchFilters(prev => ({ ...prev, location }));
    
    // Real-time search as user types - respect both location and favorites filter
    const filtered = properties.filter(property => {
      // Location filter
      if (location && !property.address.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }
      
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(property.public_id)) {
        return false;
      }
      
      return true;
    });
    setFilteredProperties(filtered);
  };

  const toggleFavoritesFilter = () => {
    const newShowFavoritesOnly = !showFavoritesOnly;
    setShowFavoritesOnly(newShowFavoritesOnly);
    
    // Filter immediately based on current favorites state
    const filtered = properties.filter(property => {
      // Location filter
      if (searchFilters.location && !property.address.toLowerCase().includes(searchFilters.location.toLowerCase())) {
        return false;
      }
      
      // Favorites filter - only show properties that are in favorites array
      if (newShowFavoritesOnly && !favorites.includes(property.public_id)) {
        return false;
      }
      
      return true;
    });
    setFilteredProperties(filtered);
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
                  onChange={handleLocationChange}
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
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filtros</span>
              </button>
              
              {/* Favorites Filter */}
              {isAuthenticated && (
                <button
                  onClick={toggleFavoritesFilter}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                    showFavoritesOnly 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <HeartSolidIcon className="h-4 w-4" />
                  <span>Favoritos</span>
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {filteredProperties.length} propiedades encontradas
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
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="relative">
                <button 
                  onClick={() => navigate(`/properties/${property.public_id}`)}
                  className="w-full h-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <img
                    src={property.images && property.images.length > 0 ? property.images[0] : '/image_default_properties.jpg'}
                    alt={property.title}
                    className="w-full h-64 object-cover hover:opacity-90 transition-opacity duration-200"
                  />
                </button>
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
                    {loadingProperties.has(property.public_id) ? (
                      <span className="flex items-center text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></div>
                        Cargando...
                      </span>
                    ) : (
                      <>
                        <span className="text-sm text-gray-600">{property.real_rating || 0}</span>
                        <span className="text-sm text-gray-500">({property.real_total_reviews || 0})</span>
                      </>
                    )}
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
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {showFavoritesOnly ? 'No tienes propiedades favoritas' : 'No hay propiedades disponibles'}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              {showFavoritesOnly 
                ? 'Agrega propiedades a tus favoritos haciendo clic en el corazón para verlas aquí.'
                : 'No se encontraron propiedades que coincidan con tu búsqueda. ¡Intenta con otros filtros!'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modales de autenticación */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={handleCloseForgotPasswordModal}
        onSwitchToLogin={handleSwitchToLoginFromForgot}
      />
    </div>
  );
};

export default PropertiesList;