import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeIcon,
  StarIcon,
  HeartIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { apiClient } from '@/app/api';
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
  owner_profile_image?: string;
  rating?: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  real_rating?: number;
  real_total_reviews?: number;
}

const ExploreRentals: React.FC = () => {
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
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [bedrooms, setBedrooms] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const propertiesPerPage = 12;

  // Function to calculate real-time rating for a property
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

  // Fetch user favorites
  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await apiClient.get('/favorites/');
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
        // Build query parameters
        const params = new URLSearchParams();
        if (selectedDistrict !== 'all') params.append('district_filter', selectedDistrict);
        if (priceRange.min > 0) params.append('min_price', priceRange.min.toString());
        if (priceRange.max < 5000) params.append('max_price', priceRange.max.toString());
        if (bedrooms !== 'all') params.append('bedrooms', bedrooms);
        
        // Parámetros de paginación
        params.append('page', currentPage.toString());
        params.append('limit', propertiesPerPage.toString());

        const response = await apiClient.get(`/units/available?${params.toString()}`);
        
        let propertiesData = [];
        
        // Si la API devuelve datos paginados
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          propertiesData = response.data.data || [];
          setTotalProperties(response.data.total || 0);
          setTotalPages(response.data.total_pages || 1);
        } else {
          // Si la API devuelve un array simple, lo paginamos en el frontend
          const allProperties = response.data || [];
          setTotalProperties(allProperties.length);
          setTotalPages(Math.ceil(allProperties.length / propertiesPerPage));
          
          // Aplicar paginación en el frontend
          const startIndex = (currentPage - 1) * propertiesPerPage;
          const endIndex = startIndex + propertiesPerPage;
          propertiesData = allProperties.slice(startIndex, endIndex);
        }
        
        // Calculate real-time ratings for each property
        const propertiesWithRatings = await Promise.all(
          propertiesData.map(async (property: Property) => {
            const { rating, total_reviews } = await calculatePropertyRating(property.public_id);
            return {
              ...property,
              real_rating: rating,
              real_total_reviews: total_reviews
            };
          })
        );
        
        setProperties(propertiesWithRatings);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Error al cargar propiedades');
        setProperties([]);
        setTotalProperties(0);
        setTotalPages(1);
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [selectedDistrict, priceRange, bedrooms, currentPage]); // Re-fetch when filters or page change

  // Fetch favorites when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  const districts = [
    'Miraflores', 'San Isidro', 'Barranco', 'Lima', 'Santiago de Surco',
    'La Molina', 'San Borja', 'Magdalena', 'Jesús María', 'Lince'
  ];

  // Aplicar filtros de búsqueda local y favoritos
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.district && property.district.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Favorites filter - only show properties that are in favorites array
    const matchesFavorites = !showFavoritesOnly || favorites.includes(property.id);
    
    return matchesSearch && matchesFavorites && property.status === 'available';
  });

  const toggleFavorite = async (propertyId: string) => {
    if (!isAuthenticated) {
      handleSwitchToRegister(); // Abrir modal de login
      return;
    }
    
    try {
      const response = await apiClient.post('/favorites/toggle', {
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

  const toggleFavoritesFilter = () => {
    const newShowFavoritesOnly = !showFavoritesOnly;
    setShowFavoritesOnly(newShowFavoritesOnly);
    setCurrentPage(1); // Reset to first page when filtering
  };

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
  }, [selectedDistrict, priceRange, bedrooms]);

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
        <div>
          <p className="text-gray-600">
            {isLoading 
              ? 'Cargando...' 
              : filteredProperties.length === 0 
                ? 'No se encontraron propiedades' 
                : `Mostrando ${filteredProperties.length} de ${totalProperties} propiedades`
            }
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500 mt-1">
              Página {currentPage} de {totalPages}
            </p>
          )}
        </div>
        <button 
          onClick={toggleFavoritesFilter}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            showFavoritesOnly 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <HeartIcon className={`h-5 w-5 mr-2 ${showFavoritesOnly ? 'text-red-500' : 'text-gray-400'}`} />
          Favoritos
        </button>
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
                <button 
                  onClick={() => navigate(`/properties/${property.public_id}`)}
                  className="w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200"
                    />
                  ) : (
                    <img 
                      src="/image_default_properties.jpg" 
                      alt={property.title}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200"
                    />
                  )}
                </button>
                
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
                      {property.real_rating || 0} ({property.real_total_reviews || 0})
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
                    <p className="text-sm text-gray-500">por noche</p>
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

export default ExploreRentals;
