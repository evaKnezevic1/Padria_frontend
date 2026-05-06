'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import ListingCard from '@/components/ListingCard';
import { Listing, SearchFilters } from '@/types';
import apiClient from '@/utils/apiClient';
import { useLanguage } from '@/context/LanguageContext';

interface ListingsPageClientProps {
  initialListings: Listing[];
  totalPages: number;
  initialFilters: SearchFilters;
}

export default function ListingsPageClient({ initialListings, totalPages, initialFilters }: ListingsPageClientProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    apiClient.get('/admin/me')
      .then((res) => setIsAdmin(res.data && res.data.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  // Sync local filter state if the URL changed externally (browser nav / link click).
  useEffect(() => {
    setFilters(initialFilters);
  }, [
    initialFilters.location,
    initialFilters.property_type,
    initialFilters.listing_type,
    initialFilters.min_price,
    initialFilters.max_price,
    initialFilters.page,
  ]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters, page: newFilters.page ?? 1 };

    // Land can only be for sale
    if (updated.property_type === 'land') {
      updated.listing_type = 'sale';
    }

    setFilters(updated);

    const params = new URLSearchParams();
    if (updated.location) params.set('location', updated.location);
    if (updated.property_type) params.set('property_type', updated.property_type);
    if (updated.listing_type) params.set('listing_type', updated.listing_type);
    if (updated.min_price !== undefined) params.set('min_price', String(updated.min_price));
    if (updated.max_price !== undefined) params.set('max_price', String(updated.max_price));
    if (updated.page && updated.page > 1) params.set('page', String(updated.page));

    startTransition(() => {
      router.replace(`/listings?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <main>
      <Navigation forceWhite />
      <div className={`fixed top-0 left-0 right-0 h-28 pointer-events-none z-40 transition-all duration-300 ${
        isScrolled ? 'border-b-0' : 'border-b border-gray-200'
      }`}></div>

      <div className="pt-44 pb-16 bg-[#c4b8a3] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Page Header with Filters */}
          <div className="mb-12 flex flex-col gap-6 xl:flex-row xl:justify-between xl:items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {language === 'hr'
                  ? (filters.property_type
                      ? ({ house: 'Kuće', apartment: 'Stanovi', land: 'Zemljišta' }[filters.property_type] ?? 'Sve nekretnine')
                      : filters.listing_type
                      ? (filters.listing_type === 'sale' ? 'Nekretnine na prodaju' : 'Nekretnine na najam')
                      : 'Sve nekretnine')
                  : (filters.property_type
                      ? `${filters.property_type.charAt(0).toUpperCase() + filters.property_type.slice(1)} Listings`
                      : filters.listing_type
                      ? `${filters.listing_type.charAt(0).toUpperCase() + filters.listing_type.slice(1)} Listings`
                      : 'All Listings')}
              </h1>
              <p className="text-gray-600">
                {language === 'hr'
                  ? (filters.property_type && filters.listing_type
                      ? `Prikaz ${({ house: 'kuće', apartment: 'stanove', land: 'zemljišta' }[filters.property_type] ?? filters.property_type)} za ${filters.listing_type === 'sale' ? 'prodaju' : 'najam'}`
                      : filters.property_type
                      ? `Prikaz ${({ house: 'kuće', apartment: 'stanove', land: 'zemljišta' }[filters.property_type] ?? filters.property_type)}`
                      : filters.listing_type
                      ? `Prikaz svih nekretnina za ${filters.listing_type === 'sale' ? 'prodaju' : 'najam'}`
                      : 'Pregledajte sve dostupne nekretnine')
                  : (filters.property_type && filters.listing_type
                      ? `Showing ${filters.property_type.toLowerCase()}s for ${filters.listing_type}`
                      : filters.property_type
                      ? `Showing ${filters.property_type.toLowerCase()}s`
                      : filters.listing_type
                      ? `Showing all properties for ${filters.listing_type}`
                      : 'Explore all available properties')}
              </p>
            </div>

            {/* Filters in Top Right */}
            <div className="w-full xl:w-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-3">
              {/* Property Type Filter */}
              <div className="min-w-0 xl:w-44">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hr' ? 'Vrsta nekretnine' : 'Property Type'}
                </label>
                <select
                  value={filters.property_type || ''}
                  onChange={(e) => handleFilterChange({ property_type: e.target.value || undefined })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">{language === 'hr' ? 'Sve vrste' : 'All Types'}</option>
                  <option value="house">{language === 'hr' ? 'Kuća' : 'House'}</option>
                  <option value="apartment">{language === 'hr' ? 'Stan' : 'Apartment'}</option>
                  <option value="land">{language === 'hr' ? 'Zemljište' : 'Land'}</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="min-w-0 xl:w-52">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hr' ? 'Raspon cijene' : 'Price Range'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_price ?? ''}
                    onChange={(e) => handleFilterChange({ min_price: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full min-w-0 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price ?? ''}
                    onChange={(e) => handleFilterChange({ max_price: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full min-w-0 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Type Filter (Rent/Sale) */}
              <div className="min-w-0 sm:col-span-2 xl:col-span-1 xl:w-40">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hr' ? 'Vrsta oglasa' : 'Type'}
                </label>
                <select
                  value={filters.listing_type || ''}
                  onChange={(e) => handleFilterChange({ listing_type: e.target.value || undefined })}
                  disabled={filters.property_type === 'land'}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {filters.property_type !== 'land' && (
                    <option value="">{language === 'hr' ? 'Sve' : 'All'}</option>
                  )}
                  <option value="sale">{language === 'hr' ? 'Na prodaju' : 'For Sale'}</option>
                  {filters.property_type !== 'land' && (
                    <option value="rent">{language === 'hr' ? 'Najam' : 'For Rent'}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {isPending ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : initialListings.length > 0 ? (
            <>
              <div className="mb-6 text-gray-600">
                {language === 'hr'
                  ? <>{<span className="font-bold text-gray-800">{initialListings.length}</span>} {initialListings.length === 1 ? 'nekretnina pronađena' : 'nekretnina pronađeno'}</>
                  : <>Found <span className="font-bold text-gray-800">{initialListings.length}</span> listings</>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {initialListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    imageUrl={`/api/listings/${listing.id}/image`}
                    isAdmin={isAdmin}
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

      <Footer />

    </main>
  );
}
