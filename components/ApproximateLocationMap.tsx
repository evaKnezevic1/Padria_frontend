'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/utils/apiClient';
import { useLanguage } from '@/context/LanguageContext';

interface ApproximateLocation {
  lat: number;
  lng: number;
  radius: number;
}

interface ApproximateLocationMapProps {
  listingId: string;
  className?: string;
}

// Google Maps type declarations
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (container: HTMLElement, options: GoogleMapOptions) => GoogleMap;
        Circle: new (options: GoogleCircleOptions) => GoogleCircle;
      };
    };
  }
}

interface GoogleMapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  zoomControl?: boolean;
  styles?: Array<{ featureType?: string; elementType?: string; stylers: Array<{ visibility?: string }> }>;
}

interface GoogleMap {
  fitBounds(bounds: { getNorthEast(): { lat(): number; lng(): number }; getSouthWest(): { lat(): number; lng(): number } }): void;
}

interface GoogleCircleOptions {
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  fillColor: string;
  fillOpacity: number;
  map: GoogleMap;
  center: { lat: number; lng: number };
  radius: number;
  clickable: boolean;
}

interface GoogleCircle {
  getBounds(): { getNorthEast(): { lat(): number; lng(): number }; getSouthWest(): { lat(): number; lng(): number } } | null;
  setMap(map: GoogleMap | null): void;
}

/**
 * ApproximateLocationMap Component
 * 
 * Displays an approximate location circle on Google Maps.
 * The map shows a circle representing the general area of the property,
 * without revealing the exact location.
 * 
 * Security: The backend only returns shifted coordinates (150-350m offset)
 * with a radius (400-600m). The real property coordinates are never exposed.
 */
export default function ApproximateLocationMap({ listingId, className = '' }: ApproximateLocationMapProps) {
  const { language } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const circleRef = useRef<GoogleCircle | null>(null);
  
  const [location, setLocation] = useState<ApproximateLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API key not configured');
      setLoading(false);
      return;
    }

    // Check if already loaded
    if (window.google?.maps) {
      setMapsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener('load', () => setMapsLoaded(true));
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    script.onerror = () => {
      setError('Failed to load Google Maps');
      setLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  // Fetch approximate location from backend
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.get(`/listings/${listingId}/approximate-location`);
        setLocation(response.data);
      } catch (err: any) {
        console.error('Error fetching approximate location:', err);
        const errorMessage = err.response?.data?.detail || 'Unable to load location';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchLocation();
    }
  }, [listingId]);

  // Initialize map when both Maps API is loaded and location is available
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !location || !window.google?.maps) {
      return;
    }

    // Create the map centered on the shifted coordinates
    const mapOptions: GoogleMapOptions = {
      center: { lat: location.lat, lng: location.lng },
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Draw the approximate area circle
    // Note: The circle is centered on the SHIFTED coordinates (not the real location)
    const circle = new window.google.maps.Circle({
      strokeColor: '#0D9488',     // Teal color matching the site theme
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0D9488',
      fillOpacity: 0.2,
      map: map,
      center: { lat: location.lat, lng: location.lng },
      radius: location.radius,    // Radius in meters (400-600m)
      clickable: false
    });
    circleRef.current = circle;

    // Fit the map to show the entire circle
    const bounds = circle.getBounds();
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [location]);

  useEffect(() => {
    if (mapsLoaded && location) {
      initializeMap();
    }
  }, [mapsLoaded, location, initializeMap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{language === 'hr' ? 'Lokacija' : 'Location'}</h2>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-3"></div>
            <p className="text-gray-500">{language === 'hr' ? 'Učitavanje karte...' : 'Loading map...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{language === 'hr' ? 'Približna lokacija' : 'Approximate Location'}</h2>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{language === 'hr' ? 'Približna lokacija' : 'Approximate Location'}</h2>
      <div 
        ref={mapRef}
        className="h-96 w-full rounded-lg overflow-hidden"
      />
      <p className="text-sm text-gray-500 mt-3 text-center">
        {language === 'hr'
          ? 'Označeno područje prikazuje otprilike susjedstvo ove nekretnine. Točna lokacija bit će dostavljena na upit.'
          : 'The highlighted area shows the approximate neighborhood of this property. Exact location will be provided upon inquiry.'}
      </p>
    </div>
  );
}
