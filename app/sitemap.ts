import { MetadataRoute } from 'next';
import { serverFetch } from '@/utils/serverApi';
import { Listing, PaginatedResponse } from '@/types';

const PAGE_SIZE = 100;

function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return 'http://localhost:3000';
}

async function fetchAllListings(): Promise<Listing[]> {
  const listings: Listing[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await serverFetch<PaginatedResponse<Listing>>('/listings', {
      searchParams: { page, page_size: PAGE_SIZE },
      revalidate: 3600,
    });

    if (!response) break;

    listings.push(...response.data);
    totalPages = response.total_pages || 1;
    page += 1;
  }

  return listings;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();
  const listings = await fetchAllListings();

  const buildAlternates = (hrPath: string, enPath: string) => ({
    languages: {
      hr: `${baseUrl}${hrPath}`,
      en: `${baseUrl}${enPath}`,
      'x-default': `${baseUrl}${hrPath}`,
    },
  });

  const staticPaths: Array<{ hr: string; en: string; changeFrequency: 'weekly' | 'daily' | 'monthly'; priority: number }> = [
    { hr: '', en: '/en', changeFrequency: 'weekly', priority: 1 },
    { hr: '/listings', en: '/en/listings', changeFrequency: 'daily', priority: 0.8 },
    { hr: '/about', en: '/en/about', changeFrequency: 'monthly', priority: 0.6 },
    { hr: '/contact', en: '/en/contact', changeFrequency: 'monthly', priority: 0.6 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap(({ hr, en, changeFrequency, priority }) => {
    const alternates = buildAlternates(hr, en);
    return [
      { url: `${baseUrl}${hr || ''}`, lastModified: now, changeFrequency, priority, alternates },
      { url: `${baseUrl}${en}`, lastModified: now, changeFrequency, priority, alternates },
    ];
  });

  const listingEntries: MetadataRoute.Sitemap = listings.flatMap((listing) => {
    const hrPath = `/listing/${listing.id}`;
    const enPath = `/en/listing/${listing.id}`;
    const alternates = buildAlternates(hrPath, enPath);
    const lastModified = listing.updated_at ? new Date(listing.updated_at) : now;
    return [
      { url: `${baseUrl}${hrPath}`, lastModified, changeFrequency: 'daily' as const, priority: 0.9, alternates },
      { url: `${baseUrl}${enPath}`, lastModified, changeFrequency: 'daily' as const, priority: 0.9, alternates },
    ];
  });

  return [...staticEntries, ...listingEntries];
}
