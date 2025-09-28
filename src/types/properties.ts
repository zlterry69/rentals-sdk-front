export interface Property {
  id: string;
  public_id: string;
  title: string;
  description: string;
  price_per_night: number;
  currency: string;
  address: string;
  images: string[];
  amenities: string[];
  property_type: 'apartment' | 'house' | 'villa' | 'condo' | 'studio';
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  size_sqm: number;
  host: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    response_time: string;
  };
  rating: number;
  review_count: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  latitude?: number;
  longitude?: number;
}

export interface Booking {
  id: string;
  public_id: string;
  property_id: string;
  property: Property;
  guest_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_method: 'traditional' | 'crypto';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentOption {
  id: string;
  type: 'traditional' | 'crypto';
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface SearchFilters {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  price_min?: number;
  price_max?: number;
  property_type?: string;
  amenities?: string[];
}
