export const moreProperties = [
  {
    id: '16',
    public_id: 'prop_10mHn14Io3L',
    title: 'Casa de Playa en Máncora',
    description: 'Casa frente al mar en la playa de Máncora, perfecta para surfistas y amantes del sol.',
    price_per_night: 140,
    currency: 'USD',
    location: {
      address: 'Playa Máncora, Calle Principal',
      city: 'Máncora',
      country: 'Perú',
      coordinates: { lat: -4.100, lng: -81.050 }
    },
    images: [
      'https://media.istockphoto.com/id/636873838/photo/la-marina-light-house-in-miraflores-in-lima-peru.jpg?s=612x612&w=0&k=20&c=6k_gL9YwpH-m5utxvmgZowQuZk0kFgV00ZulS8AhXAc=',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580582932707-52c5df75d54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Acceso Directo a Playa', 'Parrilla', 'Terraza', 'Tabla de Surf'],
    property_type: 'house' as const,
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 4,
    size_sqm: 100,
    host: {
      id: 'host_16',
      name: 'Luis Sandoval',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      response_time: '1 hora'
    },
    rating: 4.7,
    review_count: 30,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '17',
    public_id: 'prop_11nIo15Jp4M',
    title: 'Loft Bohemio en Pueblo Libre',
    description: 'Loft con decoración bohemia y arte local, cerca de museos y galerías.',
    price_per_night: 85,
    currency: 'USD',
    location: {
      address: 'Av. La Marina 567',
      city: 'Pueblo Libre',
      country: 'Perú',
      coordinates: { lat: -12.083, lng: -77.067 }
    },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691935518-a38f4041ce24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Arte Local', 'Terraza', 'Cocina Equipada', 'Biblioteca'],
    property_type: 'studio' as const,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    size_sqm: 55,
    host: {
      id: 'host_17',
      name: 'Isabella Ruiz',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.6,
      response_time: '2 horas'
    },
    rating: 4.5,
    review_count: 16,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '18',
    public_id: 'prop_12oJp16Kq5N',
    title: 'Villa de Lujo en Asia',
    description: 'Villa de lujo en el exclusivo balneario de Asia, con piscina privada y servicio de mayordomo.',
    price_per_night: 400,
    currency: 'USD',
    location: {
      address: 'Residencial Asia, Lote 45',
      city: 'Asia',
      country: 'Perú',
      coordinates: { lat: -12.800, lng: -76.500 }
    },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Piscina Privada', 'Mayordomo', 'Jacuzzi', 'Terraza', 'Estacionamiento'],
    property_type: 'villa' as const,
    bedrooms: 5,
    bathrooms: 4,
    max_guests: 12,
    size_sqm: 400,
    host: {
      id: 'host_18',
      name: 'Ricardo Mendoza',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      response_time: '30 minutos'
    },
    rating: 4.9,
    review_count: 8,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '19',
    public_id: 'prop_13pKq17Lr6O',
    title: 'Casa Tradicional en Trujillo',
    description: 'Casa colonial tradicional en el centro histórico de Trujillo, cerca de la Plaza de Armas.',
    price_per_night: 100,
    currency: 'USD',
    location: {
      address: 'Jr. Pizarro 234',
      city: 'Trujillo',
      country: 'Perú',
      coordinates: { lat: -8.111, lng: -79.029 }
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Patio Colonial', 'Cocina Tradicional', 'Terraza', 'Estacionamiento'],
    property_type: 'house' as const,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    size_sqm: 130,
    host: {
      id: 'host_19',
      name: 'Fernanda Castillo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.7,
      response_time: '2 horas'
    },
    rating: 4.6,
    review_count: 21,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '20',
    public_id: 'prop_14qLr18Ms7P',
    title: 'Apartamento Moderno en Chorrillos',
    description: 'Apartamento moderno con vista al mar en Chorrillos, cerca de la playa.',
    price_per_night: 90,
    currency: 'USD',
    location: {
      address: 'Av. Huaylas 789',
      city: 'Chorrillos',
      country: 'Perú',
      coordinates: { lat: -12.167, lng: -77.017 }
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Vista al Mar', 'Balcón', 'Cocina Equipada', 'Estacionamiento'],
    property_type: 'apartment' as const,
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    size_sqm: 70,
    host: {
      id: 'host_20',
      name: 'Gabriel Herrera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      response_time: '1 hora'
    },
    rating: 4.7,
    review_count: 19,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '21',
    public_id: 'prop_15rMs19Nt8Q',
    title: 'Casa de Montaña en Huancayo',
    description: 'Casa de montaña con vista panorámica de los Andes, ideal para relajarse y disfrutar de la naturaleza.',
    price_per_night: 80,
    currency: 'USD',
    location: {
      address: 'Distrito de El Tambo, Huancayo',
      city: 'Huancayo',
      country: 'Perú',
      coordinates: { lat: -12.067, lng: -75.217 }
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Vista a Montañas', 'Chimenea', 'Jardín', 'Estacionamiento'],
    property_type: 'house' as const,
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    size_sqm: 90,
    host: {
      id: 'host_21',
      name: 'Pedro Mamani',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      response_time: '3 horas'
    },
    rating: 4.8,
    review_count: 14,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '22',
    public_id: 'prop_16sNt20Ou9R',
    title: 'Loft Contemporáneo en Jesús María',
    description: 'Loft con diseño contemporáneo y arte moderno, perfecto para una estancia urbana.',
    price_per_night: 95,
    currency: 'USD',
    location: {
      address: 'Av. Salaverry 1234',
      city: 'Jesús María',
      country: 'Perú',
      coordinates: { lat: -12.083, lng: -77.050 }
    },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691935518-a38f4041ce24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Arte Moderno', 'Terraza', 'Cocina Equipada', 'Smart TV'],
    property_type: 'studio' as const,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    size_sqm: 50,
    host: {
      id: 'host_22',
      name: 'Valentina Cruz',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.7,
      response_time: '1 hora'
    },
    rating: 4.6,
    review_count: 17,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '23',
    public_id: 'prop_17tOu21Pv0S',
    title: 'Villa Tropical en Tarapoto',
    description: 'Villa rodeada de vegetación tropical en Tarapoto, con piscina natural y vista a la selva.',
    price_per_night: 170,
    currency: 'USD',
    location: {
      address: 'Carretera Tarapoto-Yurimaguas Km 8',
      city: 'Tarapoto',
      country: 'Perú',
      coordinates: { lat: -6.483, lng: -76.367 }
    },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Piscina Natural', 'Vista a Selva', 'Jardín Tropical', 'Observación de Aves'],
    property_type: 'villa' as const,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    size_sqm: 200,
    host: {
      id: 'host_23',
      name: 'Jorge Rojas',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      response_time: '4 horas'
    },
    rating: 4.7,
    review_count: 11,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '24',
    public_id: 'prop_18uPv22Qw1T',
    title: 'Casa de Playa en Huanchaco',
    description: 'Casa tradicional frente al mar en Huanchaco, famosa por sus caballitos de totora.',
    price_per_night: 120,
    currency: 'USD',
    location: {
      address: 'Malecón de Huanchaco 456',
      city: 'Huanchaco',
      country: 'Perú',
      coordinates: { lat: -8.083, lng: -79.117 }
    },
    images: [
      'https://media.istockphoto.com/id/636873838/photo/la-marina-light-house-in-miraflores-in-lima-peru.jpg?s=612x612&w=0&k=20&c=6k_gL9YwpH-m5utxvmgZowQuZk0kFgV00ZulS8AhXAc=',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580582932707-52c5df75d54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Acceso Directo a Playa', 'Parrilla', 'Terraza', 'Tabla de Surf'],
    property_type: 'house' as const,
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 4,
    size_sqm: 110,
    host: {
      id: 'host_24',
      name: 'Rosa Quispe',
      avatar: 'https://media.istockphoto.com/id/636810340/photo/la-marina-light-house-in-miraflores-in-lima-peru.jpg?s=1024x1024&w=is&k=20&c=VGRN4r4mqgt3u1o5PymizZV3KG-wkXy-nP_ZNxjNRqs=',
      rating: 4.7,
      response_time: '2 horas'
    },
    rating: 4.6,
    review_count: 23,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '25',
    public_id: 'prop_19vQw23Rx2U',
    title: 'Apartamento Ejecutivo en San Borja',
    description: 'Apartamento moderno en San Borja, cerca de oficinas y centros comerciales.',
    price_per_night: 110,
    currency: 'USD',
    location: {
      address: 'Av. San Luis 2345',
      city: 'San Borja',
      country: 'Perú',
      coordinates: { lat: -12.100, lng: -77.017 }
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Gimnasio', 'Piscina', 'Concierge', 'Estacionamiento'],
    property_type: 'apartment' as const,
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 4,
    size_sqm: 80,
    host: {
      id: 'host_25',
      name: 'Daniel Flores',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      response_time: '1 hora'
    },
    rating: 4.7,
    review_count: 26,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];
