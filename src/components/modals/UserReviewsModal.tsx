import React, { useState, useEffect } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { api } from '@/app/api';

interface UserReview {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
  unit_title: string;
  unit_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  is_verified: boolean;
}

interface UserReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRating?: number;
}

export const UserReviewsModal: React.FC<UserReviewsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userAvatar,
  userRating
}) => {
  const [guestReviews, setGuestReviews] = useState<UserReview[]>([]);
  const [hostReviews, setHostReviews] = useState<UserReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'as_guest' | 'as_host'>('as_guest');

  // Fetch both sets of reviews when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchAllReviews();
    }
  }, [isOpen, userId]);

  const fetchAllReviews = async () => {
    try {
      setIsLoading(true);
      
      // Fetch both guest and host reviews in parallel
      const [guestResponse, hostResponse] = await Promise.all([
        api.get(`/reviews/user/${userId}/as-guest`).catch(() => ({ data: [] })),
        api.get(`/reviews/user/${userId}/as-host`).catch(() => ({ data: [] }))
      ]);
      
      setGuestReviews(guestResponse.data || []);
      setHostReviews(hostResponse.data || []);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      setGuestReviews([]);
      setHostReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current reviews based on active tab
  const currentReviews = activeTab === 'as_guest' ? guestReviews : hostReviews;

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {getInitials(userName)}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{userName}</h3>
              {userRating && (
                <div className="flex items-center space-x-1">
                  <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-600">{userRating}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('as_guest')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'as_guest'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Como huésped ({guestReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('as_host')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'as_host'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Como anfitrión ({hostReviews.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando reseñas...</p>
            </div>
          ) : currentReviews.length > 0 ? (
            <div className="space-y-6">
              {currentReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    {review.reviewer_avatar ? (
                      <img
                        src={review.reviewer_avatar}
                        alt={review.reviewer_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials(review.reviewer_name)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarSolidIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {review.is_verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Verificado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{review.unit_title}</p>
                      {review.title && (
                        <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
                      )}
                      <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay reseñas disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReviewsModal;
