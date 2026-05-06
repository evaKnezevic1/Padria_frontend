'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import AddListingModal from '@/components/AddListingModal';
import ImageGallery from '@/components/ImageGallery';
import ApproximateLocationMap from '@/components/ApproximateLocationMap';
import { Listing, ListingImage } from '@/types';
import apiClient, { backendRoot } from '@/utils/apiClient';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedTitle, getLocalizedDescription } from '@/utils/localize';

interface ListingDetailClientProps {
  listingId: string;
  initialListing: Listing;
  initialImages: ListingImage[];
}

export default function ListingDetailClient({ listingId, initialListing, initialImages }: ListingDetailClientProps) {
  const searchParams = useSearchParams();

  const [listing, setListing] = useState<Listing>(initialListing);
  const [images, setImages] = useState<ListingImage[]>(initialImages);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    apiClient.get('/admin/me')
      .then((res) => setIsAdmin(res.data && res.data.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditModalOpen(true);
    }
  }, [searchParams]);

  const getFullImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${backendRoot}${imageUrl}`;
  };

  const handleEditSuccess = async () => {
    try {
      const listingResponse = await apiClient.get(`/listings/${listingId}`);
      setListing(listingResponse.data);
      setImages(listingResponse.data.images || []);
    } catch (err) {
      console.error('Error refreshing listing:', err);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <div className="min-h-screen bg-[#c4b8a3]">
      <Navigation forceWhite={true} />

      <div className="container mx-auto px-4 pt-32 pb-24">
        {/* Back Button and Admin Controls */}
        <div className="mb-6 mt-4 flex justify-between items-center">
          <a
            href="/listings"
            className="text-teal-600 hover:text-teal-800 flex items-center gap-2 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'hr' ? 'Povratak na oglase' : 'Back to Listings'}
          </a>

          {/* Edit Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Edit Listing
            </button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">

          {/* Left Side - Images */}
          <div className="p-6">
            <ImageGallery
              images={images.map(img => getFullImageUrl(img.image_url))}
              title={listing.title}
            />
          </div>

          {/* Right Side - Details */}
          <div className="p-6 lg:p-8">
            {/* Title and Price */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{getLocalizedTitle(listing, language)}</h1>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-teal-600">{formattedPrice}</div>
                <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-semibold capitalize">
                  {language === 'hr'
                    ? (listing.listing_type === 'sale' ? 'Prodaja' : 'Najam')
                    : (listing.listing_type === 'sale' ? 'For Sale' : 'For Rent')}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6 flex items-start gap-2 text-gray-700">
              <FaMapMarkerAlt className="text-teal-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-lg font-semibold">{listing.address}</p>
                <p className="text-gray-600">{listing.city}, {listing.state} {listing.zip_code}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">

              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{getLocalizedDescription(listing, language)}</p>
            </div>

            {/* Key Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-gray-200">
              {listing.property_type !== 'land' && (
                <div className="flex items-center gap-3 bg-[#e8dfbc] p-4 rounded-lg border-2 border-[#9e784a]">
                  <FaBed className="text-blue-500" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'hr' ? 'Spavaće sobe' : 'Bedrooms'}</p>
                    <p className="text-xl font-bold text-gray-800">{listing.bedrooms}</p>
                  </div>
                </div>
              )}

              {listing.property_type !== 'land' && (
                <div className="flex items-center gap-3 bg-[#e8dfbc] p-4 rounded-lg border-2 border-[#9e784a]">
                  <FaBath className="text-blue-500" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'hr' ? 'Wc' : 'Bathrooms'}</p>
                    <p className="text-xl font-bold text-gray-800">{listing.bathrooms}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 bg-[#e8dfbc] p-4 rounded-lg border-2 border-[#9e784a]">
                <FaRuler className="text-blue-500" size={24} />
                <div>
                  <p className="text-sm text-gray-600">{language === 'hr' ? 'Površina' : 'Size'}</p>
                  <p className="text-xl font-bold text-gray-800">{listing.size_sqft.toLocaleString()} m2</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#e8dfbc] p-4 rounded-lg border-2 border-[#9e784a]">
                <FaHome className="text-blue-500" size={24} />
                <div>
                  <p className="text-sm text-gray-600">{language === 'hr' ? 'Tip nekretnine' : 'Property Type'}</p>
                  <p className="text-xl font-bold text-gray-800 capitalize">{listing.property_type}</p>
                </div>
              </div>
              </div>

            {/* Contact Button */}
            <div className="pt-6 border-t border-gray-200">
              <a
                href="/contact"
                className="block w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-lg text-center"
              >
                {language === 'hr' ? 'Kontaktirajte nas' : 'Contact Agent'}
              </a>
              <p className="text-center text-sm text-gray-500 mt-3">
                Listing ID: {listing.id}
              </p>
            </div>
          </div>
        </div>

        {/* Map Section (Placeholder) */}
        {listing.latitude && listing.longitude && (
          <div className="mt-8 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Location</h2>
            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Map view - Coordinates: {listing.latitude}, {listing.longitude}
              </p>
            </div>
          </div>
        )}

        {/* Approximate Location Map */}
        <ApproximateLocationMap listingId={listingId} className="mt-8" />
      </div>

      {/* Edit Listing Modal */}
      <AddListingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        listingId={listingId}
        initialData={listing}
        existingImages={images}
      />
    </div>
  );
}
