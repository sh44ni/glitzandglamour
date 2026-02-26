// Booking form submission data
export interface BookingData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  timestamp: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

// Customer review data
export interface ReviewData {
  id: string;
  name: string;
  rating: number; // 1-5
  reviewText: string;
  date: string;
  approved: boolean;
  timestamp: string;
}

// Gallery image data
export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: 'nails' | 'facials' | 'waxing' | 'pedicures' | 'haircolor' | 'haircuts';
  timestamp: string;
}

// Contact form message
export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

// Service definition with pricing
export interface Service {
  id: string;
  name: string;
  price: string;
  description?: string;
  category: 'nails' | 'pedicures' | 'waxing' | 'facials' | 'haircolor' | 'haircuts';
}

// Service category for grouping
export interface ServiceCategory {
  id: string;
  name: string;
  services: Service[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination for reviews
export interface PaginatedReviews {
  reviews: ReviewData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
