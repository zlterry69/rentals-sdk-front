export const mockProperties = [
  {
    id: '1',
    public_id: 'prop_8fZk12Qp9L',
    title: 'Casa Moderna en Miraflores',
    description: 'Hermosa casa moderna con vista al mar, perfecta para vacaciones familiares.',
    price_per_night: 120,
    currency: 'USD',
    location: {
      address: 'Av. Larco 123',
      city: 'Miraflores',
      country: 'Perú',
      coordinates: { lat: -12.1194, lng: -77.0342 }
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Piscina', 'Estacionamiento', 'Cocina', 'Aire acondicionado'],
    property_type: 'house' as const,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    size_sqm: 150,
    host: {
      id: 'host_1',
      name: 'María García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      response_time: '1 hora'
    },
    rating: 4.8,
    review_count: 24,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    public_id: 'prop_9gAl23Rq0M',
    title: 'Departamento en San Isidro',
    description: 'Elegante departamento en el corazón financiero de Lima.',
    price_per_night: 80,
    currency: 'USD',
    location: {
      address: 'Av. Javier Prado 456',
      city: 'San Isidro',
      country: 'Perú',
      coordinates: { lat: -12.0968, lng: -77.0331 }
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Gimnasio', 'Concierge', 'Cocina', 'Lavandería'],
    property_type: 'apartment' as const,
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    size_sqm: 90,
    host: {
      id: 'host_2',
      name: 'Carlos López',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.7,
      response_time: '2 horas'
    },
    rating: 4.6,
    review_count: 18,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    public_id: 'prop_0hBm34Sr1N',
    title: 'Villa con Piscina en Barranco',
    description: 'Lujosa villa con piscina privada y vista panorámica al océano.',
    price_per_night: 200,
    currency: 'USD',
    location: {
      address: 'Malecón de Barranco 789',
      city: 'Barranco',
      country: 'Perú',
      coordinates: { lat: -12.1428, lng: -77.0217 }
    },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Piscina', 'Jacuzzi', 'Estacionamiento', 'Cocina', 'Jardín'],
    property_type: 'villa' as const,
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
    size_sqm: 250,
    host: {
      id: 'host_3',
      name: 'Ana Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      response_time: '30 min'
    },
    rating: 4.9,
    review_count: 32,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    public_id: 'prop_7aXb32Yq1Z',
    title: 'Apartamento Lujoso en San Isidro',
    description: 'Amplio apartamento con acabados de lujo y excelente ubicación, ideal para ejecutivos.',
    price_per_night: 180,
    currency: 'USD',
    location: {
      address: 'Av. Conquistadores 456',
      city: 'San Isidro',
      country: 'Perú',
      coordinates: { lat: -12.095, lng: -77.045 }
    },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592595896551-f77329741768?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Piscina', 'Gimnasio', 'Seguridad 24h', 'Estacionamiento'],
    property_type: 'apartment' as const,
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 4,
    size_sqm: 100,
    host: {
      id: 'host_4',
      name: 'Ana García',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      response_time: '1 hora'
    },
    rating: 4.7,
    review_count: 45,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    public_id: 'prop_9bYc43Zd2A',
    title: 'Villa con Vista al Mar en Punta Hermosa',
    description: 'Espectacular villa frente al mar, ideal para escapadas de fin de semana o vacaciones largas.',
    price_per_night: 250,
    currency: 'USD',
    location: {
      address: 'Av. Principal 789',
      city: 'Punta Hermosa',
      country: 'Perú',
      coordinates: { lat: -12.36, lng: -76.80 }
    },
    images: [
      'https://media.istockphoto.com/id/636873838/photo/la-marina-light-house-in-miraflores-in-lima-peru.jpg?s=612x612&w=0&k=20&c=6k_gL9YwpH-m5utxvmgZowQuZk0kFgV00ZulS8AhXAc=',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580582932707-52c5df75d54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Piscina', 'Jardín', 'Acceso Directo a Playa', 'Parrilla'],
    property_type: 'villa' as const,
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
    size_sqm: 300,
    host: {
      id: 'host_5',
      name: 'Carlos Soto',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      response_time: '30 minutos'
    },
    rating: 4.8,
    review_count: 60,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    public_id: 'prop_0cXd54Ye3B',
    title: 'Loft Moderno en Barranco',
    description: 'Loft artístico y moderno en el corazón de Barranco, cerca de galerías y restaurantes.',
    price_per_night: 90,
    currency: 'USD',
    location: {
      address: 'Jr. Sáenz Peña 101',
      city: 'Barranco',
      country: 'Perú',
      coordinates: { lat: -12.145, lng: -77.025 }
    },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691935518-a38f4041ce24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['WiFi', 'Cocina Equipada', 'Aire Acondicionado', 'Smart TV'],
    property_type: 'studio' as const,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    size_sqm: 50,
    host: {
      id: 'host_6',
      name: 'Laura Pérez',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 4.6,
      response_time: '2 horas'
    },
    rating: 4.5,
    review_count: 30,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];
