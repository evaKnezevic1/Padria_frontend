'use client';

import { useEffect, useState, useCallback } from 'react';
import { Listing } from '@/types';
import ListingCard from './ListingCard';
import apiClient from '@/utils/apiClient';
import { useLanguage } from '@/context/LanguageContext';

const featuredTranslations = {
  en: {
    title: 'Featured Listings',
    description: 'Find a home that suits your style - check out our newest and most attractive properties currently available.',
  },
  hr: {
    title: 'Izabrane Nekretnine',
    description: 'Pronađite dom po Vašem stilu - pogledajte naše najnovije i najatraktivnije nekretnine koje su trenutno dostupne.',
  },
};

export default function FeaturedListings() {
  const { language } = useLanguage();
  const featuredText = featuredTranslations[language];
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    // Only verify admin if cookies might contain a token
    verifyAdmin();
    fetchFeaturedListings();
  }, []);

  const verifyAdmin = async () => {
    try {
      const res = await apiClient.get('/admin/me');
      setIsAdmin(res.data && res.data.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchFeaturedListings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/listings', {
        params: {
          featured: true,
          page_size: 20,
          sort_by: 'featured',
        },
      });
      setListings(response.data.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // ── Reorder helpers ──────────────────────────────────────────────

  const swap = useCallback((fromIdx: number, toIdx: number) => {
    if (!isAdmin || !reordering) return;
    setListings((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }, [isAdmin, reordering]);

  const moveLeft = (idx: number) => {
    if (!isAdmin || !reordering || idx <= 0) return;
    swap(idx, idx - 1);
  };

  const moveRight = (idx: number) => {
    if (!isAdmin || !reordering || idx >= listings.length - 1) return;
    swap(idx, idx + 1);
  };

  const saveOrder = async () => {
    if (!isAdmin) return;
    try {
      setSaving(true);
      const orderedIds = listings.map((l) => l.id);
      await apiClient.put('/listings/featured/reorder', orderedIds);
      setReordering(false);
    } catch (err) {
      console.error('Error saving order:', err);
      alert('Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const cancelReorder = () => {
    setReordering(false);
    fetchFeaturedListings(); // reset to server order
  };

  // ── Drag & Drop handlers (only active for admin in reorder mode) ──

  const handleDragStart = (idx: number) => {
    if (!isAdmin || !reordering) return;
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    if (!isAdmin || !reordering) return;
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    if (!isAdmin || !reordering) return;
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== toIdx) {
      swap(dragIdx, toIdx);
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  if (loading) {
    return (
      <section className="py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{featuredText.title}</h2>
          <p className="text-gray-600 text-lg">
            {featuredText.description}
          </p>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* Admin reorder toolbar */}
        {isAdmin && listings.length > 1 && (
          <div className="mb-6 flex justify-center gap-3">
            {!reordering ? (
              <button
                onClick={() => setReordering(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                Reorder Featured
              </button>
            ) : (
              <>
                <button
                  onClick={saveOrder}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  )}
                  Save Order
                </button>
                <button
                  onClick={cancelReorder}
                  disabled={saving}
                  className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

        {isAdmin && reordering && (
          <p className="text-center text-sm text-gray-500 mb-4">
            Drag cards or use arrow buttons to reorder. Click <strong>Save Order</strong> when done.
          </p>
        )}

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing, idx) => {
              const isReorderActive = isAdmin && reordering;
              return (
                <div
                  key={listing.id}
                  draggable={isReorderActive}
                  onDragStart={isReorderActive ? () => handleDragStart(idx) : undefined}
                  onDragOver={isReorderActive ? (e) => handleDragOver(e, idx) : undefined}
                  onDrop={isReorderActive ? (e) => handleDrop(e, idx) : undefined}
                  onDragEnd={isReorderActive ? handleDragEnd : undefined}
                  className={`relative ${isReorderActive ? 'cursor-grab active:cursor-grabbing' : ''} ${
                    isReorderActive && dragOverIdx === idx && dragIdx !== idx ? 'ring-2 ring-orange-400 rounded-lg' : ''
                  } ${isReorderActive && dragIdx === idx ? 'opacity-40' : ''} transition-all`}
                >
                  {/* Position badge + arrows (admin reorder mode only) */}
                  {isReorderActive && (
                    <div className="absolute -top-3 left-0 right-0 z-20 flex items-center justify-between px-2">
                      <button
                        onClick={() => moveLeft(idx)}
                        disabled={idx === 0}
                        className="bg-white shadow-md border border-gray-300 disabled:opacity-30 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 transition-colors"
                        title="Move left"
                      >
                        ←
                      </button>
                      <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                        {idx + 1}
                      </span>
                      <button
                        onClick={() => moveRight(idx)}
                        disabled={idx === listings.length - 1}
                        className="bg-white shadow-md border border-gray-300 disabled:opacity-30 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 transition-colors"
                        title="Move right"
                      >
                        →
                      </button>
                    </div>
                  )}
                  <ListingCard
                    listing={listing}
                    imageUrl={`/api/listings/${listing.id}/image`}
                    isAdmin={isAdmin}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No featured listings available at the moment.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/listings"
            className="inline-block bg-white border-2 border-[#735220] text-[#735220] hover:bg-[#593f16] hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {language === 'hr' ? 'Prikaži sve' : 'View All Listings'}
          </a>
        </div>
      </div>
    </section>
  );
}
