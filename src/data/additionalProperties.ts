export const additionalProperties = [
  {
    id: '7',
    public_id: 'prop_1dYe65Zf4C',
    title: 'Casa Colonial en Cusco',
    description: 'Hermosa casa colonial restaurada en el centro histórico de Cusco, cerca de la Plaza de Armas.',
    price_per_night: 150,
    currency: 'USD',
    location: {
      address: 'Calle Triunfo 234',
      city: 'Cusco',
      country: 'Perú',
      coordinates: { lat: -13.517, lng: -71.978 }
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Calefacción', 'Patio Interior', 'Cocina Tradicional', 'Terraza'],
    property_type: 'house' as const,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    size_sqm: 120,
    host: {
      id: 'host_7',
      name: 'Miguel Quispe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      response_time: '1 hora'
    },
    rating: 4.8,
    review_count: 28,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    public_id: 'prop_2eZf76Ag5D',
    title: 'Penthouse en La Molina',
    description: 'Lujoso penthouse con vista panorámica de la ciudad, perfecto para eventos especiales.',
    price_per_night: 300,
    currency: 'USD',
    location: {
      address: 'Av. Raúl Ferrero 567',
      city: 'La Molina',
      country: 'Perú',
      coordinates: { lat: -12.075, lng: -76.950 }
    },
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Piscina', 'Jacuzzi', 'Terraza', 'Vista Panorámica', 'Ascensor Privado'],
    property_type: 'apartment' as const,
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 10,
    size_sqm: 200,
    host: {
      id: 'host_8',
      name: 'Patricia Vega',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      response_time: '30 minutos'
    },
    rating: 4.9,
    review_count: 42,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '9',
    public_id: 'prop_3fAg87Bh6E',
    title: 'Casa de Playa en Paracas',
    description: 'Hermosa casa frente al mar en la Reserva Nacional de Paracas, ideal para relajarse.',
    price_per_night: 180,
    currency: 'USD',
    location: {
      address: 'Malecón de Paracas 123',
      city: 'Paracas',
      country: 'Perú',
      coordinates: { lat: -13.833, lng: -76.250 }
    },
    images: [
      'https://media.istockphoto.com/id/636873838/photo/la-marina-light-house-in-miraflores-in-lima-peru.jpg?s=612x612&w=0&k=20&c=6k_gL9YwpH-m5utxvmgZowQuZk0kFgV00ZulS8AhXAc=',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580582932707-52c5df75d54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Acceso Directo a Playa', 'Parrilla', 'Terraza', 'Estacionamiento'],
    property_type: 'house' as const,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    size_sqm: 140,
    host: {
      id: 'host_9',
      name: 'Roberto Silva',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.7,
      response_time: '2 horas'
    },
    rating: 4.6,
    review_count: 35,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '10',
    public_id: 'prop_4gBh98Ci7F',
    title: 'Apartamento Ejecutivo en Surco',
    description: 'Moderno apartamento en el distrito financiero de Surco, perfecto para viajes de negocios.',
    price_per_night: 95,
    currency: 'USD',
    location: {
      address: 'Av. El Derby 456',
      city: 'Surco',
      country: 'Perú',
      coordinates: { lat: -12.100, lng: -77.000 }
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
    size_sqm: 85,
    host: {
      id: 'host_10',
      name: 'Elena Morales',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      response_time: '1 hora'
    },
    rating: 4.7,
    review_count: 22,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '11',
    public_id: 'prop_5hCi09Dj8G',
    title: 'Casa Rural en Huaraz',
    description: 'Acogedora casa rural en las montañas de Huaraz, perfecta para aventureros y amantes de la naturaleza.',
    price_per_night: 70,
    currency: 'USD',
    location: {
      address: 'Calle Los Pinos 789',
      city: 'Huaraz',
      country: 'Perú',
      coordinates: { lat: -9.533, lng: -77.533 }
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Chimenea', 'Jardín', 'Estacionamiento', 'Vista a Montañas'],
    property_type: 'house' as const,
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    size_sqm: 80,
    host: {
      id: 'host_11',
      name: 'Diego Huamán',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      response_time: '3 horas'
    },
    rating: 4.8,
    review_count: 15,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '12',
    public_id: 'prop_6iDj10Ek9H',
    title: 'Loft Industrial en Callao',
    description: 'Loft convertido en el histórico Callao, con diseño industrial y arte contemporáneo.',
    price_per_night: 110,
    currency: 'USD',
    location: {
      address: 'Jr. Constitución 321',
      city: 'Callao',
      country: 'Perú',
      coordinates: { lat: -12.056, lng: -77.118 }
    },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691935518-a38f4041ce24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Cocina Industrial', 'Terraza', 'Estacionamiento', 'Arte Contemporáneo'],
    property_type: 'studio' as const,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 3,
    size_sqm: 60,
    host: {
      id: 'host_12',
      name: 'Sofia Arteaga',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.6,
      response_time: '2 horas'
    },
    rating: 4.5,
    review_count: 18,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '13',
    public_id: 'prop_7jEk11Fl0I',
    title: 'Villa Ecológica en Iquitos',
    description: 'Villa sostenible en la selva amazónica, con energía solar y materiales naturales.',
    price_per_night: 160,
    currency: 'USD',
    location: {
      address: 'Carretera Iquitos-Nauta Km 15',
      city: 'Iquitos',
      country: 'Perú',
      coordinates: { lat: -3.748, lng: -73.247 }
    },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Energía Solar', 'Piscina Natural', 'Jardín Tropical', 'Observación de Aves'],
    property_type: 'villa' as const,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    size_sqm: 180,
    host: {
      id: 'host_13',
      name: 'Marco Ríos',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      response_time: '4 horas'
    },
    rating: 4.8,
    review_count: 12,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '14',
    public_id: 'prop_8kFl12Gm1J',
    title: 'Casa de Campo en Arequipa',
    description: 'Hermosa casa de campo con vista al volcán Misti, ideal para descansar y disfrutar de la naturaleza.',
    price_per_night: 130,
    currency: 'USD',
    location: {
      address: 'Valle del Colca, Yanque',
      city: 'Arequipa',
      country: 'Perú',
      coordinates: { lat: -15.595, lng: -71.535 }
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Vista al Volcán', 'Jardín', 'Chimenea', 'Estacionamiento'],
    property_type: 'house' as const,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    size_sqm: 160,
    host: {
      id: 'host_14',
      name: 'Carmen Vargas',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      response_time: '2 horas'
    },
    rating: 4.7,
    review_count: 25,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '15',
    public_id: 'prop_9lGm13Hn2K',
    title: 'Apartamento Minimalista en Lince',
    description: 'Apartamento con diseño minimalista y moderno, perfecto para una estancia tranquila en Lima.',
    price_per_night: 75,
    currency: 'USD',
    location: {
      address: 'Av. Arequipa 1234',
      city: 'Lince',
      country: 'Perú',
      coordinates: { lat: -12.083, lng: -77.033 }
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Diseño Minimalista', 'Cocina Equipada', 'Aire Acondicionado', 'Smart TV'],
    property_type: 'apartment' as const,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    size_sqm: 45,
    host: {
      id: 'host_15',
      name: 'Alejandro Torres',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.7,
      response_time: '1 hora'
    },
    rating: 4.6,
    review_count: 20,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];
