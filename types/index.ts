export interface Listing {
  id: string;
  title: string;
  description: string;
  title_en?: string | null;
  description_en?: string | null;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  property_type: string;
  listing_type: string;
  featured: boolean;
  featured_order?: number | null;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  images?: ListingImage[];
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SearchFilters {
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  listing_type?: string;
  location?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
  page?: number;
  page_size?: number;
}
