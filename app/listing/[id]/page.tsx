import Navigation from '@/components/Navigation';
import { Listing } from '@/types';
import { serverFetch, SERVER_BACKEND_ROOT } from '@/utils/serverApi';
import ListingDetailClient from './ListingDetailClient';

interface PageProps {
  params: { id: string };
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export async function generateMetadata({ params }: PageProps) {
  const listing = await serverFetch<Listing>(`/listings/${params.id}`);
  if (!listing) {
    return {
      title: 'Oglas nije pronađen | Listing Not Found',
      description: 'Ovaj oglas za nekretninu nije pronađen. This listing could not be found.',
      robots: { index: false },
    };
  }

  const primaryImg = listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];
  const ogImage = primaryImg
    ? (primaryImg.image_url.startsWith('http') ? primaryImg.image_url : `${SERVER_BACKEND_ROOT}${primaryImg.image_url}`)
    : '/og-image.jpg';

  const title = `${listing.title} | Nekretnina u Zadru | Real Estate Zadar`;
  const description = listing.description || `${listing.title} u ${listing.location}, Zadar. Premijerna nekretnina.`;

  return {
    title,
    description,
    keywords: `${listing.title}, nekretnine Zadar, ${listing.location}, nekretnina Zadar, real estate Zadar, property Zadar`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${siteUrl}/listing/${params.id}` },
    openGraph: {
      title: `${listing.title} | Nekretnina u Zadru`,
      description,
      url: `${siteUrl}/listing/${params.id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: listing.title }],
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${listing.title} | Nekretnina u Zadru`,
      description,
      images: [ogImage],
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const listingId = params.id;
  const listing = await serverFetch<Listing>(`/listings/${listingId}`);

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#c4b8a3]">
        <Navigation forceWhite={true} />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-8">The listing you are looking for does not exist.</p>
          <a href="/listings" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            View All Listings
          </a>
        </div>
      </div>
    );
  }

  const imageUrls = (listing.images ?? []).map((img) =>
    img.image_url.startsWith('http') ? img.image_url : `${SERVER_BACKEND_ROOT}${img.image_url}`
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: listing.title,
        description: listing.description || listing.title,
        image: imageUrls,
        offers: {
          '@type': 'Offer',
          price: listing.price,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'Padria Real Estate' },
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: listing.address,
          addressLocality: listing.city || listing.location,
          addressCountry: 'HR',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Početna', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Oglasi', item: `${siteUrl}/listings` },
          { '@type': 'ListItem', position: 3, name: listing.title, item: `${siteUrl}/listing/${listingId}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListingDetailClient
        listingId={listingId}
        initialListing={listing}
        initialImages={listing.images ?? []}
      />
    </>
  );
}
