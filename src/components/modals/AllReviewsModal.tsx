import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { api } from '@/app/api';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
  user_name: string;
  user_profile_image?: string;
  is_verified?: boolean;
}

interface AllReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  totalReviews: number;
  averageRating: number;
}

const AllReviewsModal: React.FC<AllReviewsModalProps> = ({
  isOpen,
  onClose,
  unitId,
  totalReviews,
  averageRating
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'highest' | 'lowest'>('recent');

  useEffect(() => {
    if (isOpen && unitId) {
      fetchAllReviews();
    }
  }, [isOpen, unitId]);

  const fetchAllReviews = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/reviews/unit/${unitId}`);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedReviews = reviews
    .filter(review => 
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      review.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {totalReviews} reseña{totalReviews !== 1 ? 's' : ''}
            </h2>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-lg font-semibold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="ml-2 text-gray-500">
                basado en {totalReviews} reseña{totalReviews !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Search and Sort */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar reseñas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Más recientes</option>
                <option value="oldest">Más antiguas</option>
                <option value="highest">Mejor calificadas</option>
                <option value="lowest">Menor calificadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAndSortedReviews.length > 0 ? (
            <div className="space-y-6">
              {filteredAndSortedReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {review.user_profile_image ? (
                        <img
                          src={review.user_profile_image}
                          alt={review.user_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                          {getInitials(review.user_name)}
                        </div>
                      )}
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {review.user_name}
                        </h4>
                        {review.is_verified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verificado
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarSolidIcon
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      {/* Title */}
                      {review.title && (
                        <h5 className="text-sm font-medium text-gray-900 mb-2">
                          {review.title}
                        </h5>
                      )}

                      {/* Comment */}
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron reseñas' : 'No hay reseñas'}
              </h3>
              <p className="text-sm text-gray-500">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Aún no hay reseñas para esta propiedad'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllReviewsModal;
