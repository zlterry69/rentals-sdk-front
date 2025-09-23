import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  HeartIcon,
  HomeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

// Mock data - in real app this would come from API
const mockProperty = {
  id: '1',
  public_id: 'prop_8fZk12Qp9L',
  title: 'Casa Moderna en Miraflores',
  description: 'Hermosa casa moderna con vista al mar, perfecta para vacaciones familiares. Ubicada en una de las mejores zonas de Miraflores, esta propiedad ofrece comodidad y lujo en cada detalle.',
  price_per_night: 120,
  currency: 'USD',
  location: {
    address: 'Av. Larco 123',
    city: 'Miraflores',
    country: 'Perú',
    coordinates: { lat: -12.1194, lng: -77.0342 }
  },
  images: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    'https://media.istockphoto.com/id/636810340/photo/la-marina-light-house-in-miraflores-in-lima-peru.jpg?s=1024x1024&w=is&k=20&c=VGRN4r4mqgt3u1o5PymizZV3KG-wkXy-nP_ZNxjNRqs='
  ],
  amenities: [
    'WiFi gratuito',
    'Piscina',
    'Estacionamiento gratuito',
    'Cocina completamente equipada',
    'Aire acondicionado',
    'Lavadora',
    'Secadora',
    'Terraza',
    'Jardín',
    'Seguridad 24/7'
  ],
  property_type: 'house' as const,
  bedrooms: 3,
  bathrooms: 2,
  max_guests: 6,
  size_sqm: 150,
  host: {
    id: 'host_1',
    name: 'María García',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.9,
    response_time: '1 hora'
  },
  rating: 4.8,
  review_count: 24,
  is_available: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * mockProperty.price_per_night;
  };

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      alert('Por favor selecciona las fechas de llegada y salida');
      return;
    }
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link to="/properties" className="flex items-center">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mockProperty.title}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                  <span>{mockProperty.rating}</span>
                  <span>({mockProperty.review_count} reseñas)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{mockProperty.location.city}, {mockProperty.location.country}</span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-2 md:row-span-2">
                  <img
                    src={mockProperty.images[selectedImage]}
                    alt={mockProperty.title}
                    className="w-full h-96 md:h-full object-cover rounded-lg"
                  />
                </div>
                {mockProperty.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`${mockProperty.title} ${index + 2}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedImage(index + 1)}
                    />
                    {index === 3 && mockProperty.images.length > 5 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">
                          +{mockProperty.images.length - 5} más
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="mb-8">
              <div className="flex items-center space-x-8 mb-6">
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-6 w-6 text-gray-600" />
                  <span className="text-gray-700">{mockProperty.bedrooms} habitaciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">{mockProperty.bathrooms} baños</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-6 w-6 text-gray-600" />
                  <span className="text-gray-700">Hasta {mockProperty.max_guests} huéspedes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">{mockProperty.size_sqm} m²</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">
                  {mockProperty.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Comodidades</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockProperty.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Info */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Anfitrión</h3>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={mockProperty.host.avatar}
                  alt={mockProperty.host.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{mockProperty.host.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                      <span>{mockProperty.host.rating}</span>
                    </div>
                    <span>Responde en {mockProperty.host.response_time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${mockProperty.price_per_night}
                    </div>
                    <div className="text-gray-600">por noche</div>
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

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Llegada
                    </label>
                    <div className="relative">
                      <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salida
                    </label>
                    <div className="relative">
                      <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Huéspedes
                    </label>
                    <div className="relative">
                      <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from({ length: mockProperty.max_guests }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'huésped' : 'huéspedes'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {calculateNights() > 0 && (
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>${mockProperty.price_per_night} x {calculateNights()} noches</span>
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

                <button
                  onClick={handleBookNow}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Reservar
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  No se cobrará nada todavía
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Selecciona método de pago
            </h3>
            <p className="text-gray-600 mb-6">
              Total a pagar: <span className="font-semibold">${calculateTotal() + 40}</span>
            </p>
            
            <div className="space-y-4">
              <button className="w-full p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Pagos Tradicionales</div>
                    <div className="text-sm text-gray-600">Yape, Plin, Tarjeta, Transferencia</div>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">₿</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Pagos con Criptomonedas</div>
                    <div className="text-sm text-gray-600">Bitcoin, Ethereum, USDT</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
