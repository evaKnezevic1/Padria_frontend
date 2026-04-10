'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/types';
import { FaBed, FaBath, FaRuler, FaEuroSign } from 'react-icons/fa';
import apiClient, { backendRoot } from '@/utils/apiClient';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedTitle } from '@/utils/localize';

interface ListingCardProps {
  listing: Listing;
  imageUrl?: string;
  onDelete?: () => void;
  isAdmin?: boolean;
}

function ListingCardInner({ listing, imageUrl, onDelete, isAdmin = false }: ListingCardProps) {
  const { language } = useLanguage();

  // Derive the display image URL from embedded images (no API call needed)
  const displayImageUrl = useMemo(() => {
    if (listing.images && listing.images.length > 0) {
      const primary = listing.images.find(img => img.is_primary) || listing.images[0];
      return primary.image_url.startsWith('http') ? primary.image_url : `${backendRoot}${primary.image_url}`;
    }
    return null;
  }, [listing.images]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await apiClient.delete(`/listings/${listing.id}`);
      if (onDelete) {
        onDelete();
      }
      window.location.reload();
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing');
    }
  };

  const handleToggleFeatured = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await apiClient.patch(`/listings/${listing.id}`, { featured: !listing.featured });
      window.location.reload();
    } catch (err) {
      console.error('Error updating listing:', err);
      alert('Failed to update listing');
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <Link href={`/listing/${listing.id}`} className="h-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full">
        {/* Image Container */}
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          {displayImageUrl ? (
            <Image
              src={displayImageUrl}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-3 flex flex-col flex-1">
          {/* Title - Fixed Height */}
          <div className="h-14 mb-1 overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#7a5d30] transition-colors line-clamp-2 leading-7">
              {getLocalizedTitle(listing, language)}
            </h3>
          </div>

          {/* Location - Fixed Height */}
          <div className="h-6 mb-2">
            <p className="text-gray-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2 text-[#917551] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-1">{listing.city}, {listing.state} {listing.zip_code}</span>
            </p>
          </div>

          {/* Property Details - Fixed Height */}
          <div className="h-12 flex justify-between items-center text-gray-700 text-sm mb-2 pb-2 border-b border-gray-200">
            {listing.property_type !== 'land' && (
              <div className="flex items-center">
                <FaBed className="mr-2 text-[#a1927a]" />
                <span>{listing.bedrooms}</span>
              </div>
            )}
            {listing.property_type !== 'land' && (
              <div className="flex items-center">
                <FaBath className="mr-2 text-[#a1927a]" />
                <span>{listing.bathrooms} </span>
              </div>
            )}
            <div className="flex items-center">
              <FaRuler className="mr-2 text-[#a1927a]" />
              <span>{listing.size_sqft.toLocaleString()} m2</span>
            </div>
            <div className="flex items-center">
              <FaEuroSign className="mr-2 text-[#a1927a]" />
              <span>{listing.price.toLocaleString()} </span>
            </div>
          </div>

          {/* Description - Fixed Height */}
          {/*<div className="h-12 mb-3">
            <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>
          </div>*/}

          {/* Admin Controls */}
          {isAdmin && (
            <div className="mt-auto pt-4 border-t border-gray-200 flex gap-2">
              <Link href={`/listing/${listing.id}?edit=true`}>
                <button
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-semibold transition-colors"
                >
                  Edit
                </button>
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

const ListingCard = React.memo(ListingCardInner);
export default ListingCard;
