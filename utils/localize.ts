import { Listing } from '@/types';

/**
 * Returns the localized title for a listing.
 * Falls back to Croatian (default) if no English version exists.
 */
export function getLocalizedTitle(listing: Listing, language: 'en' | 'hr'): string {
  if (language === 'en' && listing.title_en) {
    return listing.title_en;
  }
  return listing.title;
}

/**
 * Returns the localized description for a listing.
 * Falls back to Croatian (default) if no English version exists.
 */
export function getLocalizedDescription(listing: Listing, language: 'en' | 'hr'): string {
  if (language === 'en' && listing.description_en) {
    return listing.description_en;
  }
  return listing.description;
}
