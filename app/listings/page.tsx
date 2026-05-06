import { Listing, PaginatedResponse, SearchFilters } from '@/types';
import { serverFetch } from '@/utils/serverApi';
import ListingsPageClient from './ListingsPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'Nekretnine na prodaju Zadar | Kuće i Apartmani uz More | Real Estate',
  description: 'Pregledajte premium nekretnine u Zadru. Kuće, apartmani i nekretnine uz more u Zadru, Hrvatska. Browse premium real estate listings in Zadar — houses, apartments and properties near the sea.',
  keywords: 'nekretnine Zadar, kuće na prodaju Zadar, apartmani Zadar, nekretnine uz more, kupiti kuću Zadar, luksuzne nekretnine Hrvatska, real estate Zadar, houses for sale Zadar, apartments Zadar, buy house Croatia',
  alternates: { canonical: `${siteUrl}/listings` },
  openGraph: {
    title: 'Nekretnine na prodaju Zadar | Kuće i Apartmani uz More',
    description: 'Pregledajte premium nekretnine u Zadru. Kuće, apartmani i nekretnine uz more u Zadru, Hrvatska.',
    url: `${siteUrl}/listings`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Nekretnine Zadar - Padria Real Estate' }],
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Nekretnine na prodaju Zadar | Kuće i Apartmani uz More',
    description: 'Pregledajte premium nekretnine u Zadru — kuće, apartmani i nekretnine uz more.',
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
    { '@type': 'ListItem', position: 1, name: 'Pocetna', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Oglasi', item: `${siteUrl}/listings` },
  ],
};

export default async function ListingsPage({ searchParams }: PageProps) {
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
