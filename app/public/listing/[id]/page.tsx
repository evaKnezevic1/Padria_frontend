'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ImageGallery from '@/components/ImageGallery';
import { Listing } from '@/types';
import apiClient, { backendRoot } from '@/utils/apiClient';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEuroSign } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedTitle, getLocalizedDescription } from '@/utils/localize';

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/listings/${listingId}`);
      const listingData = response.data;
      setListing(listingData);

      // Images are already included in the listing response
      if (listingData.images && listingData.images.length > 0) {
        setImages(listingData.images.map((img: any) => `${backendRoot}${img.image_url}`));
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main>
        <Navigation />
        <div className="pt-32 pb-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main>
        <Navigation />
        <div className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error || 'Listing not found'}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <main>
      <Navigation forceWhite />

      <div className="pt-24 pb-16 bg-yellow-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8 text-gray-600">
            <a href="/listings" className="text-orange-500 hover:text-orange-600">Listings</a>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{listing ? getLocalizedTitle(listing, language) : ''}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="mb-8">
                <ImageGallery images={images} title={listing.title} />
              </div>

              {/* Property Details Section */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{getLocalizedTitle(listing, language)}</h1>
                <p className="text-gray-600 mb-6 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-orange-500" />
                  {listing.address}, {listing.city}, {listing.state} {listing.zip_code}
                </p>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaBed className="text-orange-500 mr-3 text-xl" />
                    <div>
                      <p className="text-gray-600 text-sm">Bedrooms</p>
                      <p className="text-xl font-bold text-gray-800">{listing.bedrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaBath className="text-orange-500 mr-3 text-xl" />
                    <div>
                      <p className="text-gray-600 text-sm">Bathrooms</p>
                      <p className="text-xl font-bold text-gray-800">{listing.bathrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaRuler className="text-orange-500 mr-3 text-xl" />
                    <div>
                      <p className="text-gray-600 text-sm">m2</p>
                      <p className="text-xl font-bold text-gray-800">{listing.size_sqft.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Description</h2>
                <p className="text-gray-700 leading-relaxed mb-8">{getLocalizedDescription(listing, language)}</p>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Property Type</h3>
                    <p className="text-gray-600 capitalize">{listing.property_type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-8 sticky top-28">
                {/* Price */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <p className="text-gray-600 text-sm mb-2">Price</p>
                  <p className="text-4xl font-bold text-orange-500">{formattedPrice}</p>
                </div>

                {/* Contact Information */}
                <h3 className="text-xl font-bold text-gray-800 mb-6">Contact Agent</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-700">
                    <FaPhone className="text-orange-500 mr-3" />
                    <a href="tel:+1234567890" className="hover:text-orange-500">
                      (123) 456-7890
                    </a>
                  </div>
                  <div className="flex items-start text-gray-700">
                    <FaEnvelope className="text-orange-500 mr-3 mt-1" />
                    <a href="mailto:info@realestateagency.com" className="hover:text-orange-500 break-all">
                      info@realestateagency.com
                    </a>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors">
                    Schedule a Tour
                  </button>
                  <button className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 py-3 rounded-lg font-semibold transition-colors">
                    Ask a Question
                  </button>
                  <button className="w-full text-gray-600 hover:text-orange-500 py-3 rounded-lg font-semibold transition-colors">
                    ♡ Save Listing
                  </button>
                </div>

                {/* Listing ID */}
                <p className="text-gray-500 text-xs mt-8">Listing ID: {listing.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
