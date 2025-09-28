import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  HeartIcon,
  HomeIcon,
  CheckCircleIcon,
  PencilIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { PaymentModal } from '@/components/PaymentModal';
import PublicHeader from '@/components/layout/PublicHeader';
import UserReviewsModal from '@/components/modals/UserReviewsModal';
import PhotoCarouselModal from '@/components/modals/PhotoCarouselModal';
import PhotoManagementModal from '@/components/modals/PhotoManagementModal';
import Map from '@/components/Map';
import { api } from '@/app/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Property {
  id: string;
  public_id: string;
  title: string;
  description: string;
  address: string;
  monthly_rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  max_guests?: number;
  amenities: string[];
  rules: string;
  images: string[];
  rating: number;
  total_reviews: number;
  status: string;
  available_from: string;
  owner_id: string;
  owner_name: string;
  owner_rating?: number;
  owner_profile_image?: string;
}


// Helper function to generate initials from name
const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Review form states
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingImages, setPendingImages] = useState<{file: File, index: number}[]>([]);
  
  
  // User reviews modal states
  const [showUserReviews, setShowUserReviews] = useState(false);
  
  // Photo carousel modal states
  const [showPhotoCarousel, setShowPhotoCarousel] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  
  // Photo management modal states
  const [showPhotoManagement, setShowPhotoManagement] = useState(false);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const [uploadedImages, setUploadedImages] = useState<Set<number>>(new Set());
  
  // Map states
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -12.0464, lng: -77.0428 });
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string>('Dirección por definir');

  // Fetch property from backend
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/units/${id}`);
        console.log('DEBUG fetchProperty - response.data:', response.data);
        console.log('DEBUG fetchProperty - max_guests:', response.data?.max_guests);
        console.log('DEBUG fetchProperty - address from API:', response.data?.address);
        console.log('DEBUG fetchProperty - latitude from API:', response.data?.latitude);
        console.log('DEBUG fetchProperty - longitude from API:', response.data?.longitude);
        setProperty(response.data);
        
        // Update map center with property coordinates
        if (response.data.latitude && response.data.longitude) {
          setMapCenter({ lat: response.data.latitude, lng: response.data.longitude });
          
          // Hacer geocoding inverso UNA SOLA VEZ para obtener la dirección
          if (!response.data.address || response.data.address === 'Dirección por definir') {
            try {
              const geocoder = new google.maps.Geocoder();
              const result = await geocoder.geocode({ 
                location: { lat: response.data.latitude, lng: response.data.longitude } 
              });
              
              if (result.results[0]) {
                const address = result.results[0].formatted_address;
                console.log('DEBUG: Dirección obtenida por geocoding:', address);
                
                // Actualizar la propiedad con la dirección real
                setProperty(prev => prev ? {
                  ...prev,
                  address: address
                } : null);
                
                // También actualizar displayAddress para mostrar inmediatamente
                setDisplayAddress(address);
              }
            } catch (geocodingError) {
              console.error('Error en geocoding inverso:', geocodingError);
            }
          } else {
            // Si ya tiene dirección, usarla
            setDisplayAddress(response.data.address);
          }
        } else {
          // Si no tiene coordenadas, usar la dirección de la propiedad o placeholder
          setDisplayAddress(response.data.address || 'Dirección por definir');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Error al cargar la propiedad');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Fetch reviews for this property
  const fetchReviews = async () => {
    if (!id) return;
    
    try {
      setIsLoadingReviews(true);
      const response = await api.get(`/reviews/unit/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Don't show error toast for reviews, just log it
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Fetch payment methods for this property owner
  const fetchPaymentMethods = async () => {
    if (!property?.owner_id) return;
    
    try {
      const response = await api.get(`/payment-accounts/public/${property.owner_id}`);
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  // Load reviews and payment methods after property is loaded
  React.useEffect(() => {
    if (property) {
      fetchReviews();
      fetchPaymentMethods();
    }
  }, [property]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const dailyRate = editingField === 'monthly_rent' && editFormData.monthly_rent 
      ? editFormData.monthly_rent 
      : (property?.monthly_rent || 0);
    return nights * dailyRate; // Price is per night
  };

  // Check if current user is the owner of this property
  const isOwner = user && property && user.id === property.owner_id;

  // Edit mode functions
  const startEdit = (field: string) => {
    setEditingField(field);
    setIsEditMode(true); // Asegurar que el modo edición esté activado
    
    console.log('DEBUG startEdit - field:', field);
    console.log('DEBUG startEdit - Activando isEditMode = true');
    console.log('DEBUG startEdit - property:', property);
    console.log('DEBUG startEdit - property.max_guests:', property?.max_guests);
    console.log('DEBUG startEdit - property.monthly_rent:', property?.monthly_rent);
    
    if (field === 'payment_methods') {
      // For payment methods, load from paymentMethods state
      setEditFormData({
        ...editFormData,
        accepts_yape: paymentMethods?.accepts_yape || false,
        accepts_plin: paymentMethods?.accepts_plin || false,
        accepts_bitcoin: paymentMethods?.accepts_bitcoin || false,
        accepts_ethereum: paymentMethods?.accepts_ethereum || false,
        accepts_usdt: paymentMethods?.accepts_usdt || false,
        accepts_visa: paymentMethods?.accepts_visa || false,
      });
    } else if (field === 'amenities') {
      // For amenities, load from property amenities array
      setEditFormData({
        ...editFormData,
        amenities: property?.amenities || []
      });
    } else {
      // For other fields, load from property
      const defaultValue = (field === 'bedrooms' || field === 'bathrooms' || field === 'area_sqm') ? 0 : '';
      let fieldValue = property?.[field as keyof Property] || defaultValue;
      
      // Si es el campo de dirección, usar la dirección seleccionada en el mapa o la de la propiedad
      if (field === 'address') {
        // Cuando entramos en modo de edición para dirección, el campo de arriba debe tomar el valor del campo de abajo
        if (selectedLocation) {
          // Si hay ubicación seleccionada en el mapa, usar esa
          fieldValue = selectedLocation.address;
          console.log('DEBUG startEdit - Usando dirección del mapa:', selectedLocation.address);
        } else {
          // Si no hay ubicación seleccionada, usar la dirección de la propiedad
          fieldValue = property?.address || 'Dirección por definir';
          console.log('DEBUG startEdit - Usando dirección de la propiedad:', property?.address || 'Dirección por definir');
        }
        console.log('DEBUG startEdit - selectedLocation:', selectedLocation);
        console.log('DEBUG startEdit - fieldValue final:', fieldValue);
      }
      
      console.log('DEBUG startEdit - fieldValue:', fieldValue);
      console.log('DEBUG startEdit - defaultValue:', defaultValue);
      console.log('DEBUG startEdit - property.monthly_rent:', property?.monthly_rent);
      
      setEditFormData({
        ...editFormData,
        [field]: fieldValue,
        // Si es dirección, también actualizar coordenadas
        ...(field === 'address' && selectedLocation ? {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng
        } : {})
      });
      
      console.log('DEBUG startEdit - editFormData after set:', { ...editFormData, [field]: fieldValue });
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditFormData({});
    setHasChanges(false);
    setPendingImages([]); // Clear pending images
    
    // Restore original property images
    if (property) {
      setProperty(prev => ({
        ...prev!,
        images: property.images || []
      }));
    }
    
    // Restore original address
    setDisplayAddress(property?.address || 'Dirección por definir');
    
    // Reload to ensure everything is restored
    window.location.reload();
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditFormData({
      ...editFormData,
      [field]: value
    });
    setHasChanges(true);
  };

  const saveEdit = async () => {
    if (!property?.id || !hasChanges) return;
    
    try {
      setIsSaving(true);
      
      // Separate property data from payment methods
      const { accepts_yape, accepts_plin, accepts_bitcoin, accepts_ethereum, accepts_usdt, accepts_bank_transfer, accepts_mercadopago, accepts_izipay, ...propertyData } = editFormData;
      
      // Update property data (including images if they were modified)
      const updateData = { ...propertyData };
      
      // If images were modified, include only S3 URLs (filter out object URLs)
      if (property.images) {
        const s3Images = property.images.filter(img => 
          img && !img.startsWith('blob:') && (img.startsWith('http') || img.startsWith('https'))
        );
        updateData.images = s3Images;
      }
      
      if (Object.keys(updateData).length > 0) {
        console.log('DEBUG: Enviando datos al backend:', updateData);
        try {
          const response = await api.put(`/units/${property.public_id}`, updateData);
          console.log('DEBUG: Respuesta del backend:', response.data);
        } catch (error) {
          console.error('DEBUG: Error del backend:', error);
          throw error;
        }
      }
      
      // Images are now uploaded asynchronously, no need to handle pending images here
      
      // Update payment methods if they were edited
      if (editingField === 'payment_methods' && (accepts_yape !== undefined || accepts_plin !== undefined || accepts_bitcoin !== undefined || accepts_ethereum !== undefined || accepts_usdt !== undefined || accepts_bank_transfer !== undefined || accepts_mercadopago !== undefined || accepts_izipay !== undefined)) {
        const paymentData = {
          accepts_yape: accepts_yape || false,
          accepts_plin: accepts_plin || false,
          accepts_bitcoin: accepts_bitcoin || false,
          accepts_ethereum: accepts_ethereum || false,
          accepts_usdt: accepts_usdt || false,
          accepts_bank_transfer: accepts_bank_transfer || false,
          accepts_mercadopago: accepts_mercadopago || false,
          accepts_izipay: accepts_izipay || false
        };
        await api.put('/payment-accounts/', paymentData);
      }
      
      toast.success('Propiedad actualizada correctamente');
      setEditingField(null);
      setEditFormData({});
      setHasChanges(false);
      setUploadProgress(0); // Reset upload progress
      
      // Update displayAddress with the saved address
      if (editFormData.address) {
        setDisplayAddress(editFormData.address);
      }
      
      // Refresh payment methods if they were updated
      if (editingField === 'payment_methods') {
        fetchPaymentMethods();
        setIsEditMode(false); // Close edit mode for payment methods
      } else {
        // Refresh property data for other fields
        setIsEditMode(false); // Close edit mode
        // Reload the page to get updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Error al actualizar la propiedad');
      setUploadProgress(0); // Reset upload progress on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (file: File, index: number) => {
    // Create preview URL for immediate display
    const previewUrl = URL.createObjectURL(file);
    
    // Update the property images for preview
    setProperty(prev => {
      if (!prev) return prev;
      const newImages = [...(prev.images || [])];
      while (newImages.length <= index) {
        newImages.push('');
      }
      newImages[index] = previewUrl;
      return { ...prev, images: newImages };
    });
    
    // Start async upload immediately
    uploadSingleImage(file, index);
    
    setHasChanges(true);
  };

  const handleImageDelete = (index: number) => {
    if (!property) return;
    
    // Remove from pending images if it exists there
    setPendingImages(prev => prev.filter(img => img.index !== index));
    
    // Update the property images - actually remove the image from the array
    setProperty(prev => {
      if (!prev) return prev;
      const newImages = [...(prev.images || [])];
      if (newImages.length > index) {
        // Remove the image at the specified index
        newImages.splice(index, 1);
        console.log(`DEBUG: Eliminando imagen en índice ${index}. Nuevo array:`, newImages);
      }
      return { ...prev, images: newImages };
    });
    
    // Adjust cover image index if necessary
    if (coverImageIndex >= index && coverImageIndex > 0) {
      setCoverImageIndex(coverImageIndex - 1);
    } else if (coverImageIndex >= (property.images?.length || 0)) {
      setCoverImageIndex(Math.max(0, (property.images?.length || 0) - 1));
    }
    
    setHasChanges(true);
    console.log('DEBUG: Imagen eliminada, hasChanges = true');
  };

  // Handle image reordering (drag & drop)
  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    if (!property) return;
    
    setProperty(prev => {
      if (!prev) return prev;
      const newImages = [...(prev.images || [])];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      
      // Update cover image index if necessary
      if (coverImageIndex === fromIndex) {
        setCoverImageIndex(toIndex);
      } else if (coverImageIndex > fromIndex && coverImageIndex <= toIndex) {
        setCoverImageIndex(coverImageIndex - 1);
      } else if (coverImageIndex < fromIndex && coverImageIndex >= toIndex) {
        setCoverImageIndex(coverImageIndex + 1);
      }
      
      return { ...prev, images: newImages };
    });
    
    setHasChanges(true);
  };

  // Handle image replacement (edit existing image)
  const handleImageReplace = (file: File, index: number) => {
    // Create preview URL for immediate display
    const previewUrl = URL.createObjectURL(file);
    
    // Update the property images for preview
    setProperty(prev => {
      if (!prev) return prev;
      const newImages = [...(prev.images || [])];
      while (newImages.length <= index) {
        newImages.push('');
      }
      newImages[index] = previewUrl;
      return { ...prev, images: newImages };
    });
    
    // Start async upload immediately
    uploadSingleImage(file, index);
    
    setHasChanges(true);
  };

  // Handle setting cover image
  const handleSetCoverImage = (index: number) => {
    setCoverImageIndex(index);
    setHasChanges(true);
  };

  // Handle location selection from map
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    console.log('DEBUG: Ubicación seleccionada:', location);
    console.log('DEBUG: Estado actual - isOwner:', isOwner, 'isEditMode:', isEditMode, 'editingField:', editingField);
    setSelectedLocation(location);
    
    // Solo actualizar la dirección principal si estamos en modo de edición para la dirección
    if (isOwner && isEditMode && editingField === 'address') {
      console.log('DEBUG: ✅ Condiciones cumplidas - actualizando dirección principal');
      setDisplayAddress(location.address);
      setEditFormData({
        ...editFormData,
        address: location.address,
        latitude: location.lat,
        longitude: location.lng
      });
      setHasChanges(true);
      console.log('DEBUG: editFormData actualizado con coordenadas (modo edición para dirección):', {
        address: location.address,
        latitude: location.lat,
        longitude: location.lng
      });
      console.log('DEBUG: hasChanges activado = true');
    } else {
      console.log('DEBUG: ❌ Condiciones NO cumplidas - solo se actualiza "Ubicación actual" (abajo)');
      console.log('DEBUG: isOwner:', isOwner, 'isEditMode:', isEditMode, 'editingField:', editingField);
    }
  };

  // Upload single image asynchronously
  const uploadSingleImage = async (file: File, index: number) => {
    if (!property) return;
    
    try {
      // Mark as uploading
      setUploadingImages(prev => new Set(prev).add(index));
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('index', index.toString());
      
      const response = await api.post(`/units/${property.public_id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 segundos por imagen individual
      });
      
      if (response.data && response.data.url) {
        // Update property with new image URL
        setProperty(prev => {
          if (!prev) return prev;
          const newImages = [...(prev.images || [])];
          while (newImages.length <= index) {
            newImages.push('');
          }
          newImages[index] = response.data.url;
          return { ...prev, images: newImages };
        });
        
        // Mark as uploaded
        setUploadedImages(prev => new Set(prev).add(index));
        toast.success(`Imagen ${index + 1} subida correctamente`);
      }
      
    } catch (error) {
      console.error(`Error subiendo imagen ${index + 1}:`, error);
      toast.error(`Error al subir imagen ${index + 1}`);
    } finally {
      // Remove from uploading
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleBookNow = () => {
    if (isOwner) {
      toast.error('No puedes reservar tu propia propiedad');
      return;
    }
    
    if (!checkIn || !checkOut) {
      alert('Por favor selecciona las fechas de llegada y salida');
      return;
    }
    setShowBookingModal(true);
  };


  // Handle review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    if (reviewRating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }
    
    if (!reviewComment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    try {
      setIsSubmittingReview(true);
      
      const reviewData = {
        unit_id: id,
        rating: reviewRating,
        title: reviewTitle.trim() || null,
        comment: reviewComment.trim()
      };

      await api.post('/reviews', reviewData);
      
      toast.success('Reseña enviada correctamente');
      
      // Reset form
      setReviewRating(0);
      setReviewTitle('');
      setReviewComment('');
      
      // Refresh reviews
      fetchReviews();
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.detail || 'Error al enviar reseña';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handlePaymentMethodSelect = async (method: any) => {
    try {
      // Create payment first (this would be a real API call)
      const paymentData = {
        amount: calculateTotal() + 40,
        currency: 'PEN',
        description: `Reserva ${property?.title}`,
        dates: { checkIn, checkOut, guests }
      };

      // Create invoice with selected payment method
      const invoiceResponse = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          payment_id: 'pay_mock_123', // This would come from the payment creation
          method_code: method.code,
          return_url: `${window.location.origin}/payment/success`,
          cancel_url: `${window.location.origin}/payment/cancelled`
        })
      });

      const invoice = await invoiceResponse.json();

      if (invoice.payment_url) {
        // Redirect to payment URL
        window.open(invoice.payment_url, '_blank');
      }

      setShowBookingModal(false);
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
    }
  };

  // Loading state
  if (isLoading) {
  return (
    <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
    );
  }

  // Property not found
  if (!property) {
  return (
    <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h1>
            <Link to="/properties" className="text-blue-600 hover:text-blue-800">
              Volver a propiedades
            </Link>
      </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
      {/* Header dinámico */}
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Property Title */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                {isOwner && isEditMode && editingField === 'title' ? (
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={editFormData.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
                      placeholder="Título de la propiedad"
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">
                    {property.title}
              </h1>
                )}
                {isOwner && isEditMode && (
                  <button
                    onClick={() => editingField === 'title' ? cancelEdit() : startEdit('title')}
                    className="text-blue-600 hover:text-blue-800 p-1 ml-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {isOwner && (
                  <div className="flex items-center space-x-2">
                    {isEditMode && hasChanges && (
                      <button
                        onClick={saveEdit}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-1"></div>
                            {uploadProgress > 0 ? `Subiendo... ${uploadProgress}%` : 'Guardando...'}
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 inline mr-1" />
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isEditMode 
                          ? 'bg-gray-600 text-white hover:bg-gray-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isEditMode ? (
                        <>
                          <XMarkIcon className="h-4 w-4 inline mr-1" />
                          Cancelar Edición
                        </>
                      ) : (
                        <>
                          <PencilIcon className="h-4 w-4 inline mr-1" />
                          Activar Edición
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                  <span>{property.rating || 0}</span>
                  <span>({property.total_reviews || 0} reseñas)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-5 w-5" />
                  <span className="text-gray-900 font-medium">
                    {(() => {
                      const isEditingAddress = isOwner && isEditMode && editingField === 'address';
                      const addressToShow = isEditingAddress 
                        ? (selectedLocation ? selectedLocation.address : (property?.address || 'Dirección por definir'))
                        : (property?.address || 'Dirección por definir');
                      
                      console.log('DEBUG dirección arriba:', {
                        isOwner,
                        isEditMode,
                        editingField,
                        isEditingAddress,
                        selectedLocation: selectedLocation?.address,
                        propertyAddress: property?.address,
                        addressToShow
                      });
                      
                      return addressToShow;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-2 md:row-span-2 relative group">
                  <img
                    src={property.images && property.images.length > 0 
                      ? property.images[coverImageIndex] 
                      : '/image_default_properties.jpg'
                    }
                    alt={property.title}
                    className={`w-full h-96 md:max-h-96 object-cover rounded-lg transition-opacity ${
                      !isEditMode ? 'cursor-pointer hover:opacity-90' : ''
                    } ${uploadingImages.has(coverImageIndex) ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (!isEditMode) {
                        // If no real images, still show carousel with default image
                        if (!property.images || property.images.length === 0) {
                          setCarouselStartIndex(0);
                          setShowPhotoCarousel(true);
                        } else {
                          setCarouselStartIndex(coverImageIndex);
                          setShowPhotoCarousel(true);
                        }
                      }
                    }}
                  />
                  
                  {/* Upload status indicators */}
                  {uploadingImages.has(coverImageIndex) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-white font-medium">Subiendo...</span>
                      </div>
                    </div>
                  )}
                  
                  {uploadedImages.has(coverImageIndex) && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                      <CheckIcon className="h-5 w-5" />
                    </div>
                  )}
                  
                  {isOwner && isEditMode && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => handleImageDelete(coverImageIndex)}
                        className="bg-red-600 text-white h-9 w-9 rounded-full cursor-pointer hover:bg-red-700 shadow-md flex items-center justify-center"
                        title="Eliminar imagen principal"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                      <label className="bg-blue-600 text-white h-9 w-9 rounded-full cursor-pointer hover:bg-blue-700 shadow-md flex items-center justify-center">
                        <PencilIcon className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageReplace(file, coverImageIndex);
                          }}
                        />
                      </label>
                    </div>
                  )}
                  {/* Show all photos button */}
                  {property.images && property.images.length > 1 && !isEditMode && (
                    <div className="absolute bottom-2 right-2">
                      <button
                        onClick={() => {
                          setCarouselStartIndex(0);
                          setShowPhotoCarousel(true);
                        }}
                        className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-75 transition-all"
                      >
                        Ver todas las fotos ({property.images.length})
                      </button>
                    </div>
                  )}
                </div>
                {/* Always show 4 additional images (total 5 with main image) */}
                {Array.from({ length: 4 }, (_, index) => {
                  // Calculate image index excluding cover image
                  let imageIndex = index;
                  if (imageIndex >= coverImageIndex) {
                    imageIndex = index + 1;
                  }
                  const hasImage = property.images && property.images.length > imageIndex;
                  const image = hasImage ? property.images[imageIndex] : null;
                  
                  return (
                    <div key={index} className="relative group h-48 overflow-hidden rounded-lg" data-image-index={imageIndex}>
                      {hasImage ? (
                        <img
                          src={image || ''}
                          alt={`${property.title} ${imageIndex + 1}`}
                          className={`w-full h-full object-cover transition-opacity ${
                            !isEditMode ? 'cursor-pointer hover:opacity-80' : ''
                          } ${uploadingImages.has(imageIndex) ? 'opacity-50' : ''}`}
                          onClick={() => {
                            if (!isEditMode) {
                              setSelectedImage(imageIndex);
                              setCarouselStartIndex(imageIndex);
                              setShowPhotoCarousel(true);
                            }
                          }}
                        />
                      ) : (
                        <img
                          src="/image_default_properties.jpg"
                          alt={`${property.title} placeholder ${imageIndex + 1}`}
                          className="w-full h-full object-cover opacity-50"
                        />
                      )}
                      
                      {/* Upload status indicators for small images */}
                      {uploadingImages.has(imageIndex) && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="bg-white rounded-full p-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        </div>
                      )}
                      
                      {uploadedImages.has(imageIndex) && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <CheckIcon className="h-4 w-4" />
                        </div>
                      )}
                      
                      {isOwner && isEditMode && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          {/* Edit/Upload button */}
                          <label className="bg-blue-600 text-white h-7 w-7 rounded-full cursor-pointer hover:bg-blue-700 shadow flex items-center justify-center">
                            <PencilIcon className="h-3 w-3" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, imageIndex);
                              }}
                            />
                          </label>
                          
                          {/* Delete button - only show if there's an actual image */}
                          {hasImage && (
                            <button
                              onClick={() => handleImageDelete(imageIndex)}
                              className="bg-red-600 text-white h-7 w-7 rounded-full cursor-pointer hover:bg-red-700 shadow flex items-center justify-center"
                              title="Eliminar imagen"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Show "+X más" overlay if there are more than 5 total images */}
                      {index === 3 && property.images && property.images.length > 5 && !isEditMode && (
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition-all"
                          onClick={() => {
                            setCarouselStartIndex(0);
                            setShowPhotoCarousel(true);
                          }}
                        >
                          <span className="text-white font-semibold">
                            +{property.images.length - 5} más
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Photo Management Button - Only show for owners in edit mode */}
              {isOwner && isEditMode && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowPhotoManagement(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-sm"
                    title="Gestionar todas las fotos"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                    Ver todas ({property?.images?.length || 0})
                  </button>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-6 w-6 text-gray-600" />
                    {isOwner && isEditMode && editingField === 'bedrooms' ? (
                      <input
                        type="number"
                        value={editFormData.bedrooms || ''}
                        onChange={(e) => handleFieldChange('bedrooms', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    ) : (
                      <span className="text-gray-700">{property.bedrooms} habitaciones</span>
                    )}
                    {isOwner && isEditMode && (
                      <button
                        onClick={() => editingField === 'bedrooms' ? cancelEdit() : startEdit('bedrooms')}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {isOwner && isEditMode && editingField === 'bathrooms' ? (
                      <input
                        type="number"
                        value={editFormData.bathrooms || ''}
                        onChange={(e) => handleFieldChange('bathrooms', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    ) : (
                      <span className="text-gray-700">{property.bathrooms} baños</span>
                    )}
                    {isOwner && isEditMode && (
                      <button
                        onClick={() => editingField === 'bathrooms' ? cancelEdit() : startEdit('bathrooms')}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-6 w-6 text-gray-600" />
                    {isOwner && isEditMode && editingField === 'max_guests' ? (
                      <input
                        type="number"
                        value={editFormData.max_guests || ''}
                        onChange={(e) => handleFieldChange('max_guests', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    ) : (
                      <span className="text-gray-700">Hasta {property.max_guests || 6} huéspedes</span>
                    )}
                    {isOwner && isEditMode && (
                      <button
                        onClick={() => editingField === 'max_guests' ? cancelEdit() : startEdit('max_guests')}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {isOwner && isEditMode && editingField === 'area_sqm' ? (
                      <input
                        type="number"
                        value={editFormData.area_sqm || ''}
                        onChange={(e) => handleFieldChange('area_sqm', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    ) : (
                      <span className="text-gray-700">{property.area_sqm} m²</span>
                    )}
                    {isOwner && isEditMode && (
                      <button
                        onClick={() => editingField === 'area_sqm' ? cancelEdit() : startEdit('area_sqm')}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Descripción</h3>
                  {isOwner && isEditMode && (
                    <button
                      onClick={() => editingField === 'description' ? cancelEdit() : startEdit('description')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <PencilIcon className="h-4 w-4 inline mr-1" />
                      {editingField === 'description' ? 'Cancelar' : 'Editar'}
                    </button>
                  )}
                </div>
                {isOwner && isEditMode && editingField === 'description' ? (
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                    placeholder="Describe tu propiedad..."
                  />
                ) : (
                <p className="text-gray-700 leading-relaxed">
                    {property.description || 'Hermosa propiedad disponible para alquiler.'}
                </p>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Comodidades</h3>
                {isOwner && isEditMode && (
                  <button
                    onClick={() => editingField === 'amenities' ? cancelEdit() : startEdit('amenities')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <PencilIcon className="h-4 w-4 inline mr-1" />
                    {editingField === 'amenities' ? 'Cancelar' : 'Editar'}
                  </button>
                )}
              </div>
              {isOwner && isEditMode && editingField === 'amenities' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'WiFi gratuito',
                    'Cocina equipada',
                    'Aire acondicionado',
                    'Lavadora',
                    'Estacionamiento',
                    'Terraza',
                    'Piscina',
                    'Gimnasio',
                    'Seguridad 24/7',
                    'Mascotas permitidas',
                    'Acceso para discapacitados',
                    'Balcón'
                  ].map((amenity, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={editFormData.amenities?.includes(amenity) || false}
                        onChange={(e) => {
                          const currentAmenities = editFormData.amenities || [];
                          if (e.target.checked) {
                            handleFieldChange('amenities', [...currentAmenities, amenity]);
                          } else {
                            handleFieldChange('amenities', currentAmenities.filter((a: string) => a !== amenity));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.amenities && property.amenities.length > 0 ? (
                    property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                    ))
                  ) : (
                    <div className="text-gray-500 italic">
                      No se han especificado comodidades para esta propiedad.
              </div>
                  )}
              </div>
              )}
            </div>

            {/* Host Info */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Anfitrión</h3>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <button
                  onClick={() => setShowUserReviews(true)}
                  className="flex items-center space-x-4 hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors"
                >
                  {property.owner_profile_image ? (
                    <img
                      src={property.owner_profile_image}
                      alt={property.owner_name || 'Propietario'}
                      className="w-16 h-16 rounded-full object-cover cursor-pointer"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer">
                      {getInitials(property.owner_name || 'Propietario')}
                    </div>
                  )}
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {property.owner_name || 'Propietario'}
                    </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {property.owner_rating ? (
                    <div className="flex items-center space-x-1">
                      <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                          <span>{property.owner_rating}</span>
                    </div>
                      ) : (
                        <span className="text-gray-500">Sin reseñas aún</span>
                      )}
                      <span>Responde en 1 hora</span>
                  </div>
                    <p className="text-xs text-blue-600 mt-1">Ver reseñas</p>
                </div>
                </button>
              </div>
            </div>

            {/* Payment Methods Section - Compact */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Métodos de Pago</h3>
                {isOwner && isEditMode && (
                  <button
                    onClick={() => editingField === 'payment_methods' ? cancelEdit() : startEdit('payment_methods')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <PencilIcon className="h-4 w-4 inline mr-1" />
                    {editingField === 'payment_methods' ? 'Cancelar' : 'Editar'}
                  </button>
                )}
          </div>
              {isOwner && isEditMode && editingField === 'payment_methods' ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Yape */}
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded border-2 border-transparent hover:border-blue-300">
                      <input
                        type="checkbox"
                        checked={editFormData.accepts_yape || false}
                        onChange={(e) => handleFieldChange('accepts_yape', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <img src="/yape.png" alt="Yape" className="h-6 w-auto" />
                      <span className="text-sm text-gray-700">Yape</span>
                    </label>
                    
                    {/* Plin */}
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded border-2 border-transparent hover:border-blue-300">
                      <input
                        type="checkbox"
                        checked={editFormData.accepts_plin || false}
                        onChange={(e) => handleFieldChange('accepts_plin', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <img src="/plin.jpg" alt="Plin" className="h-6 w-auto" />
                      <span className="text-sm text-gray-700">Plin</span>
                    </label>
                    
                    {/* Bitcoin */}
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded border-2 border-transparent hover:border-blue-300">
                      <input
                        type="checkbox"
                        checked={editFormData.accepts_bitcoin || false}
                        onChange={(e) => handleFieldChange('accepts_bitcoin', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/2048px-Bitcoin.svg.png" alt="Bitcoin" className="h-5 w-5" />
                      <span className="text-sm text-gray-700">Bitcoin</span>
                    </label>
                    
                    {/* Ethereum */}
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded border-2 border-transparent hover:border-blue-300">
                      <input
                        type="checkbox"
                        checked={editFormData.accepts_ethereum || false}
                        onChange={(e) => handleFieldChange('accepts_ethereum', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/2048px-Ethereum-icon-purple.svg.png" alt="Ethereum" className="h-5 w-5" />
                      <span className="text-sm text-gray-700">Ethereum</span>
                    </label>
                    
                    {/* USDT */}
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded border-2 border-transparent hover:border-blue-300">
                      <input
                        type="checkbox"
                        checked={editFormData.accepts_usdt || false}
                        onChange={(e) => handleFieldChange('accepts_usdt', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <img src="/usdt.png" alt="USDT" className="h-5 w-5" />
                      <span className="text-sm text-gray-700">USDT</span>
                    </label>
                    
                    {/* Visa */}
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded border-2 border-transparent hover:border-blue-300">
                      <input
                        type="checkbox"
                        checked={editFormData.accepts_visa || false}
                        onChange={(e) => handleFieldChange('accepts_visa', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <img src="/visa.jpg" alt="Visa" className="h-6 w-auto" />
                      <span className="text-sm text-gray-700">Visa</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    {/* Yape */}
                    {paymentMethods?.accepts_yape && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src="/yape.png" 
                          alt="Yape" 
                          className="h-5 w-auto"
                        />
                        <span className="text-sm text-gray-600">Yape</span>
                      </div>
                    )}
                    
                    {/* Plin */}
                    {paymentMethods?.accepts_plin && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src="/plin.jpg" 
                          alt="Plin" 
                          className="h-5 w-auto"
                        />
                        <span className="text-sm text-gray-600">Plin</span>
                      </div>
                    )}
                    
                    {/* Bitcoin */}
                    {paymentMethods?.accepts_bitcoin && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/2048px-Bitcoin.svg.png" 
                          alt="Bitcoin" 
                          className="h-5 w-5"
                        />
                        <span className="text-sm text-gray-600">Bitcoin</span>
                      </div>
                    )}
                    
                    {/* Ethereum */}
                    {paymentMethods?.accepts_ethereum && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/2048px-Ethereum-icon-purple.svg.png" 
                          alt="Ethereum" 
                          className="h-5 w-5"
                        />
                        <span className="text-sm text-gray-600">Ethereum</span>
                      </div>
                    )}
                    
                    {/* USDT */}
                    {paymentMethods?.accepts_usdt && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src="/usdt.png" 
                          alt="USDT" 
                          className="h-5 w-5"
                        />
                        <span className="text-sm text-gray-600">USDT</span>
                      </div>
                    )}
                    
                    {/* Visa */}
                    {paymentMethods?.accepts_visa && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src="/visa.jpg" 
                          alt="Visa" 
                          className="h-5 w-auto"
                        />
                        <span className="text-sm text-gray-600">Visa</span>
                      </div>
                    )}
                    
                    {/* Show message if no payment methods configured */}
                    {!paymentMethods?.accepts_yape && !paymentMethods?.accepts_plin && 
                     !paymentMethods?.accepts_crypto && !paymentMethods?.accepts_visa && (
                      <span className="text-sm text-gray-500">Métodos de pago no configurados</span>
                    )}
                  </div>
                </div>
              )}
                
                {/* Show contact info only when booking */}
                {!isOwner && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      La información de contacto se mostrará al confirmar la reserva
                    </p>
                  </div>
                )}
              </div>
            </div>


            {/* Booking Card - Compact */}
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {isOwner && isEditMode && editingField === 'monthly_rent' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editFormData.monthly_rent || ''}
                          onChange={(e) => {
                            console.log('DEBUG input onChange - value:', e.target.value);
                            handleFieldChange('monthly_rent', parseInt(e.target.value) || 0);
                          }}
                          onFocus={() => {
                            console.log('DEBUG input onFocus - editFormData.monthly_rent:', editFormData.monthly_rent);
                            console.log('DEBUG input onFocus - property.monthly_rent:', property?.monthly_rent);
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          step="1"
                        />
                        <span className="text-gray-600">por noche</span>
                        <button
                          onClick={() => editingField === 'monthly_rent' ? cancelEdit() : startEdit('monthly_rent')}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            S/ {Math.round((editingField === 'monthly_rent' && editFormData.monthly_rent 
                              ? editFormData.monthly_rent 
                              : property.monthly_rent)).toLocaleString()}
                          </div>
                          <div className="text-gray-600">por noche</div>
                        </div>
                        {isOwner && isEditMode && (
                          <button
                            onClick={() => editingField === 'monthly_rent' ? cancelEdit() : startEdit('monthly_rent')}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0">
                      Llegada
                    </label>
                    <div className="relative">
                      <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0">
                      Salida
                    </label>
                    <div className="relative">
                      <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0">
                      Huéspedes
                    </label>
                    <div className="relative">
                      <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from({ length: property?.max_guests || 6 }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'huésped' : 'huéspedes'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {calculateNights() > 0 && (
                  <div className="border-t pt-3 mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>
                        S/ {Math.round((editingField === 'monthly_rent' && editFormData.monthly_rent 
                          ? editFormData.monthly_rent 
                          : property?.monthly_rent || 0))} x {calculateNights()} noches
                      </span>
                      <span>${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Tarifa de limpieza</span>
                      <span>$25</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Tarifa de servicio</span>
                      <span>$15</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>Total</span>
                        <span>${calculateTotal() + 40}</span>
                      </div>
                    </div>
                  </div>
                )}

                {isOwner ? (
                  <div className="text-center py-4">
                    <div className="bg-gray-100 text-gray-600 py-3 rounded-lg font-semibold">
                      Esta es tu propiedad
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      No puedes reservar tu propia propiedad
                    </p>
                  </div>
                ) : (
                  <>
                <button
                  onClick={handleBookNow}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Reservar
                </button>

                    <p className="text-center text-xs text-gray-500 mt-2">
                  No se cobrará nada todavía
                </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Reviews and Map */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Reviews Section - Half width */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Reseñas ({property.total_reviews || 0})</h3>
                  {property.rating && property.total_reviews > 0 ? (
                    <div className="flex items-center space-x-2">
                      <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                      <span className="font-semibold">{property.rating}</span>
        </div>
                  ) : null}
      </div>

                {/* Reviews List */}
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {isLoadingReviews ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Cargando reseñas...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {review.user_name ? review.user_name[0].toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{review.user_name || 'Usuario'}</h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <StarSolidIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              {review.is_verified && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verificado</span>
                              )}
                            </div>
                            {review.title && <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>}
                            <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aún no hay reseñas para esta propiedad</p>
                      <p className="text-sm mt-2">¡Sé el primero en dejar una reseña!</p>
                    </div>
                  )}
                </div>

                {/* Add Review Form */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Escribir una reseña</h4>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Calificación *</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setReviewRating(star)} className="focus:outline-none">
                            <StarSolidIcon className={`h-8 w-8 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título de la reseña</label>
                      <input type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Resume tu experiencia..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comentario *</label>
                      <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Comparte tu experiencia detallada..." required />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={isSubmittingReview || reviewRating === 0 || !reviewComment.trim()} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmittingReview ? 'Enviando...' : 'Enviar reseña'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Map Section - Half width */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg w-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Ubicación</h3>
                    {isOwner && (
                      <button
                        onClick={() => {
                          console.log('DEBUG: Botón Editar/Cancelar dirección clickeado');
                          console.log('DEBUG: editingField actual:', editingField);
                          console.log('DEBUG: isEditMode actual:', isEditMode);
                          console.log('DEBUG: hasChanges actual:', hasChanges);
                          
                          if (editingField === 'address') {
                            cancelEdit();
                          } else {
                            console.log('DEBUG: Activando edición de dirección');
                            startEdit('address');
                            
                            // Activar hasChanges para mostrar el botón Guardar Cambios
                            if (!hasChanges) {
                              console.log('DEBUG: Activando hasChanges = true para mostrar botón Guardar');
                              setHasChanges(true);
                            } else {
                              console.log('DEBUG: hasChanges ya estaba activado, no hacer nada');
                            }
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded border"
                      >
                        <PencilIcon className="h-4 w-4 inline mr-1" />
                        {editingField === 'address' ? 'Cancelar' : 'Editar'}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <MapPinIcon className="h-5 w-5" />
                    <span className="text-gray-900 font-medium">
                      {selectedLocation ? selectedLocation.address : (property?.address || 'Dirección por definir')}
                    </span>
                  </div>
                  
                  <Map
                    center={mapCenter}
                    onLocationSelect={handleLocationSelect}
                    isEditable={true}
                    className="h-64 w-full"
                  />
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mt-2">
                    Debug: isOwner={isOwner ? 'true' : 'false'}, isEditMode={isEditMode ? 'true' : 'false'}, editingField={editingField || 'null'}
                  </div>
                  
                  {/* Mostrar ubicación actual cuando hay una seleccionada */}
                  {selectedLocation && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Ubicación actual:</strong> {selectedLocation.address}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {isOwner && isEditMode 
                          ? "Arrastra el marcador para cambiar la ubicación y guarda los cambios"
                          : "Solo el propietario puede cambiar esta ubicación"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
      <PaymentModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        amount={calculateTotal() + 40}
        currency="USD"
        onPaymentMethodSelect={handlePaymentMethodSelect}
      />

        <UserReviewsModal
          isOpen={showUserReviews}
          onClose={() => setShowUserReviews(false)}
          userId={property?.owner_id || ''}
          userName={property?.owner_name || 'Propietario'}
          userAvatar={property?.owner_profile_image}
          userRating={property?.owner_rating}
        />

        <PhotoCarouselModal
          isOpen={showPhotoCarousel}
          onClose={() => setShowPhotoCarousel(false)}
          images={property?.images && property.images.length > 0 ? property.images : ['/image_default_properties.jpg']}
          initialIndex={carouselStartIndex}
          title={property?.title || 'Fotos de la propiedad'}
          isOwner={isOwner || false}
          isEditMode={isEditMode || false}
          onImageEdit={(index) => {
            // Close carousel and start editing this specific image
            setShowPhotoCarousel(false);
            setIsEditMode(true);
            // Scroll to the image section
            setTimeout(() => {
              const imageElement = document.querySelector(`[data-image-index="${index}"]`);
              if (imageElement) {
                imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }}
          onImageDelete={handleImageDelete}
          onImageUpload={handleImageUpload}
      />

        <PhotoManagementModal
          isOpen={showPhotoManagement}
          onClose={() => setShowPhotoManagement(false)}
          images={property?.images || []}
          onImageDelete={handleImageDelete}
          onImageUpload={handleImageUpload}
          onImageReorder={handleImageReorder}
          onImageReplace={handleImageReplace}
          onSetCoverImage={handleSetCoverImage}
          coverImageIndex={coverImageIndex}
          title={`Gestionar Fotos - ${property?.title || 'Propiedad'}`}
        />
    </div>
    </>
  );
};

export default PropertyDetail;
