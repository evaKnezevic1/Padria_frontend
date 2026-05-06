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

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/listings`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const listingEntries: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/listing/${listing.id}`,
    lastModified: listing.updated_at ? new Date(listing.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...listingEntries];
}
