import { Listing, PaginatedResponse, SearchFilters } from '@/types';
import { serverFetch } from '@/utils/serverApi';
import ListingsPageClient from '../../../(hr)/listings/ListingsPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'Properties for sale in Zadar – Houses & Apartments | Padria',
  description: 'Browse premium real estate listings in Zadar County. Houses, apartments and seafront properties with detailed descriptions and photos.',
  alternates: {
    canonical: `${siteUrl}/en/listings`,
    languages: {
      'hr-HR': `${siteUrl}/listings`,
      'en-US': `${siteUrl}/en/listings`,
      'x-default': `${siteUrl}/listings`,
    },
  },
  openGraph: {
    title: 'Properties for sale in Zadar – Houses & Apartments | Padria',
    description: 'Browse premium real estate listings in Zadar County. Houses, apartments and seafront properties.',
    url: `${siteUrl}/en/listings`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Real estate Zadar – Padria Real Estate' }],
    type: 'website' as const,
    locale: 'en_US',
    alternateLocale: ['hr_HR'],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Properties for sale in Zadar – Houses & Apartments | Padria',
    description: 'Browse premium real estate listings in Zadar County.',
    images: ['/og-image.jpg'],
  },
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

function pickNumber(value: string | string[] | undefined): number | undefined {
  const s = pickString(value);
  if (!s) return undefined;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/en` },
    { '@type': 'ListItem', position: 2, name: 'Listings', item: `${siteUrl}/en/listings` },
  ],
};

export default async function EnListingsPage({ searchParams }: PageProps) {
  const filters: SearchFilters = {
    location: pickString(searchParams.location) ?? '',
    property_type: pickString(searchParams.property_type),
    listing_type: pickString(searchParams.listing_type),
    min_price: pickNumber(searchParams.min_price),
    max_price: pickNumber(searchParams.max_price),
    page: Math.max(1, pickNumber(searchParams.page) ?? 1),
    page_size: 12,
    sort_by: 'newest',
  };

  const data = await serverFetch<PaginatedResponse<Listing>>('/listings', {
    searchParams: {
      location: filters.location,
      property_type: filters.property_type,
      listing_type: filters.listing_type,
      min_price: filters.min_price,
      max_price: filters.max_price,
      page: filters.page,
      page_size: filters.page_size,
      sort_by: filters.sort_by,
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ListingsPageClient
        initialListings={data?.data ?? []}
        totalPages={data?.total_pages ?? 1}
        initialFilters={filters}
      />
    </>
  );
}
