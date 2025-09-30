import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  HomeIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/app/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

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
  nightly_rate: number;
  deposit?: number;
  amenities?: string[];
  images?: string[];
  owner_name?: string;
}

interface BookingData {
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  nightly_rate: number;
  total_nights: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total_amount: number;
}

const Checkout: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (propertyId) {
      fetchProperty();
      fetchPaymentMethods();
    }
  }, [propertyId, isAuthenticated, navigate]);

  const fetchProperty = async () => {
    try {
      const response = await apiClient.get(`/units/${propertyId}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Error al cargar la propiedad');
      navigate('/explore');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.get('/payment-accounts/');
      const paymentAccount = response.data;
      
      if (paymentAccount) {
        const methods = [];
        if (paymentAccount.plin_number) {
          methods.push({
            id: 'plin',
            name: 'Plin',
            code: 'plin',
            description: `Plin: # ${paymentAccount.plin_number}`,
            icon: '💳'
          });
        }
        if (paymentAccount.yape_number) {
          methods.push({
            id: 'yape',
            name: 'Yape',
            code: 'yape',
            description: `Yape: # ${paymentAccount.yape_number}`,
            icon: '📱'
          });
        }
        methods.push({
          id: 'cash',
          name: 'Efectivo',
          code: 'cash',
          description: 'Pago en efectivo',
          icon: '💵'
        });
        
        setPaymentMethods(methods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const calculateBooking = () => {
    if (!property) return;

    const checkIn = new Date();
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 7); // Default 7 days

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const subtotal = property.nightly_rate * totalNights;
    const cleaningFee = 50; // Fixed cleaning fee
    const serviceFee = subtotal * 0.1; // 10% service fee
    const taxes = (subtotal + cleaningFee + serviceFee) * 0.18; // 18% IGV
    const totalAmount = subtotal + cleaningFee + serviceFee + taxes;

    const data: BookingData = {
      property_id: property.public_id,
      check_in_date: checkIn.toISOString().split('T')[0],
      check_out_date: checkOut.toISOString().split('T')[0],
      guests_count: 1,
      nightly_rate: property.nightly_rate,
      total_nights: totalNights,
      subtotal,
      cleaning_fee: cleaningFee,
      service_fee: serviceFee,
      taxes,
      total_amount: totalAmount
    };

    setBookingData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (property) {
      calculateBooking();
    }
  }, [property]);

  const handleCreateBooking = async () => {
    if (!bookingData || !selectedPaymentMethod) {
      toast.error('Selecciona un método de pago');
      return;
    }

    try {
      setIsCreatingBooking(true);

      // Create booking
      const bookingResponse = await apiClient.post('/bookings/', {
        ...bookingData,
        special_requests: '',
        guest_notes: ''
      });

      const booking = bookingResponse.data;
      toast.success('Reserva creada exitosamente');

      // If payment method is not cash, create payment
      if (selectedPaymentMethod !== 'cash') {
        try {
          await apiClient.post('/payments/', {
            property_id: property!.public_id,
            user_id: user!.id,
            amount: bookingData.total_amount,
            payment_method: selectedPaymentMethod,
            payment_origin: selectedPaymentMethod,
            description: `Pago por reserva ${booking.public_id}`,
            comments: `Reserva del ${bookingData.check_in_date} al ${bookingData.check_out_date}`,
            invoice_id: `inv_${booking.public_id}`
          });
          
          toast.success('Pago registrado exitosamente');
        } catch (paymentError) {
          console.error('Error creating payment:', paymentError);
          toast.error('Reserva creada pero error al registrar el pago');
        }
      }

      // Navigate to bookings
      navigate('/bookings');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.detail || 'Error al crear la reserva');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property || !bookingData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Propiedad no encontrada</h3>
        <button
          onClick={() => navigate('/explore')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Volver a explorar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Confirmar Reserva
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Detalles de la Propiedad
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{property.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <HomeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {property.bedrooms} hab • {property.bathrooms} baños • {property.area_sqm}m²
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {bookingData.total_nights} noches
                    </span>
                  </div>
                </div>

                {property.images && property.images.length > 0 && (
                  <div className="mt-4">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Detalles de la Reserva
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Check-in:</span>
                  <span className="text-gray-900 dark:text-white">{bookingData.check_in_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Check-out:</span>
                  <span className="text-gray-900 dark:text-white">{bookingData.check_out_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Huéspedes:</span>
                  <span className="text-gray-900 dark:text-white">{bookingData.guests_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Precio por noche:</span>
                  <span className="text-gray-900 dark:text-white">S/ {bookingData.nightly_rate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Método de Pago
              </h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.code)}
                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                      selectedPaymentMethod === method.code
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{method.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {method.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {method.description}
                        </div>
                      </div>
                      {selectedPaymentMethod === method.code && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-500 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Resumen de Precios
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    S/ {bookingData.nightly_rate} × {bookingData.total_nights} noches
                  </span>
                  <span className="text-gray-900 dark:text-white">S/ {bookingData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tarifa de limpieza</span>
                  <span className="text-gray-900 dark:text-white">S/ {bookingData.cleaning_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tarifa de servicio</span>
                  <span className="text-gray-900 dark:text-white">S/ {bookingData.service_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Impuestos (IGV)</span>
                  <span className="text-gray-900 dark:text-white">S/ {bookingData.taxes.toFixed(2)}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-600" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">S/ {bookingData.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleCreateBooking}
              disabled={!selectedPaymentMethod || isCreatingBooking}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreatingBooking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Confirmar Reserva
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
