import { Listing, PaginatedResponse } from '@/types';
import { serverFetch } from '@/utils/serverApi';
import FeaturedListingsClient from './FeaturedListingsClient';

export default async function FeaturedListings() {
  const data = await serverFetch<PaginatedResponse<Listing>>('/listings', {
    searchParams: { featured: 'true', page_size: 20, sort_by: 'featured' },
  });

  const initialListings = data?.data ?? [];

  return <FeaturedListingsClient initialListings={initialListings} />;
}
