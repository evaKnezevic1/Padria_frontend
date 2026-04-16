'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ListingCard from '@/components/ListingCard';
import { Listing, SearchFilters } from '@/types';
import apiClient from '@/utils/apiClient';
import { useLanguage } from '@/context/LanguageContext';

function ListingsContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    min_price: 0,
    max_price: 10000000,
    bedrooms: undefined,
    bathrooms: undefined,
    property_type: undefined,
    location: '',
    sort_by: 'newest',
    page: 1,
    page_size: 12,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Update filters from URL params
    const location = searchParams.get('location') || '';
    const propertyType = searchParams.get('property_type') || undefined;
    const listingType = searchParams.get('listing_type') || undefined;
    const minPrice = searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : 0;
    const maxPrice = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : 10000000;

    setFilters((prev) => ({
      ...prev,
      location,
      property_type: propertyType,
      listing_type: listingType,
      min_price: minPrice,
      max_price: maxPrice,
    }));
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/listings', { params: filters });
      setListings(response.data.data);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <main>
      <Navigation />
      <div className="pt-32 pb-16 bg-light min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header with Filters */}
          <div className="mb-12 flex flex-col gap-6 xl:flex-row xl:justify-between xl:items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {language === 'hr' ? 'Sve Nekretnine' : 'All Listings'}
              </h1>
              <p className="text-gray-600">
                {language === 'hr' ? 'Pregledajte sve dostupne nekretnine' : 'Explore all available properties'}
              </p>
            </div>

            {/* Filters in Top Right */}
            <div className="w-full xl:w-auto grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-3">
              {/* Price Filter */}
              <div className="min-w-0 xl:w-52">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hr' ? 'Raspon cijene' : 'Price Range'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={language === 'hr' ? 'Min' : 'Min'}
                    value={filters.min_price || ''}
                    onChange={(e) => handleFilterChange({ min_price: e.target.value ? parseInt(e.target.value) : 0 })}
                    className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="number"
                    placeholder={language === 'hr' ? 'Max' : 'Max'}
                    value={filters.max_price || ''}
                    onChange={(e) => handleFilterChange({ max_price: e.target.value ? parseInt(e.target.value) : 10000000 })}
                    className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Type Filter (Rent/Sale) */}
              <div className="min-w-0 xl:w-40">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hr' ? 'Vrsta' : 'Type'}
                </label>
                <select
                  value={filters.listing_type || ''}
                  onChange={(e) => handleFilterChange({ listing_type: e.target.value || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">{language === 'hr' ? 'Sve' : 'All'}</option>
                  <option value="sale">{language === 'hr' ? 'Na prodaju' : 'For Sale'}</option>
                  <option value="rent">{language === 'hr' ? 'Najam' : 'For Rent'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
          ) : listings.length > 0 ? (
            <>
              <div className="mb-6 text-gray-600">
                {language === 'hr'
                  ? <>{<span className="font-bold text-gray-800">{listings.length}</span>} {listings.length === 1 ? 'nekretnina pronađena' : 'nekretnina pronađeno'}</>
                  : <>Found <span className="font-bold text-gray-800">{listings.length}</span> listings</>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    imageUrl={`/api/listings/${listing.id}/image`}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button
                    onClick={() => handleFilterChange({ page: Math.max(1, (filters.page || 1) - 1) })}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    {language === 'hr' ? 'Prethodna' : 'Previous'}
                  </button>
                  <span className="px-4 py-2">
                    {language === 'hr' ? `Stranica ${filters.page} od ${totalPages}` : `Page ${filters.page} of ${totalPages}`}
                  </span>
                  <button
                    onClick={() => handleFilterChange({ page: Math.min(totalPages, (filters.page || 1) + 1) })}
                    disabled={filters.page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    {language === 'hr' ? 'Sljedeća' : 'Next'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {language === 'hr' ? 'Nema nekretnina koje odgovaraju vašim kriterijima.' : 'No listings found matching your criteria.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
