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

  const propertyTypeMap: Record<string, string> = {
    house: 'Kuća',
    apartment: 'Apartman',
    land: 'Zemljište',
  };
  const propertyTypeLabel = propertyTypeMap[listing.property_type] ?? 'Nekretnina';
  const cityLabel = listing.city || listing.location || 'Zadar';
  const sizeLabel = listing.size_sqft ? `${listing.size_sqft} m²` : '';
  const bedroomsLabel = listing.property_type !== 'land' && listing.bedrooms
    ? `${listing.bedrooms} ${listing.bedrooms === 1 ? 'spavaća soba' : 'spavaće sobe'}`
    : '';
  const priceLabel = listing.price
    ? new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)
    : '';

  const title = `${listing.title} – ${propertyTypeLabel} ${sizeLabel} u ${cityLabel} | Padria`.replace(/\s+/g, ' ').trim();
  const description = listing.description
    ? listing.description.slice(0, 155)
    : [propertyTypeLabel, sizeLabel, bedroomsLabel, `u ${cityLabel}`, priceLabel ? `Cijena ${priceLabel}` : '']
        .filter(Boolean)
        .join(', ') + '.';

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}/listing/${params.id}`,
      languages: {
        'hr-HR': `${siteUrl}/listing/${params.id}`,
        'en-US': `${siteUrl}/en/listing/${params.id}`,
        'x-default': `${siteUrl}/listing/${params.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/listing/${params.id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${propertyTypeLabel} ${sizeLabel} – ${cityLabel}` }],
      type: 'website' as const,
      locale: 'hr_HR',
      alternateLocale: ['en_US'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
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

  const realEstateNode: Record<string, unknown> = {
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description || listing.title,
    image: imageUrls,
    url: `${siteUrl}/listing/${listingId}`,
    datePosted: listing.created_at,
    dateModified: listing.updated_at,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/listing/${listingId}`,
      seller: { '@type': 'RealEstateAgent', name: 'Padria Real Estate' },
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.city || listing.location,
      addressRegion: 'Zadarska županija',
      postalCode: listing.zip_code,
      addressCountry: 'HR',
    },
  };

  if (listing.size_sqft) {
    realEstateNode.floorSize = {
      '@type': 'QuantitativeValue',
      value: listing.size_sqft,
      unitCode: 'MTK',
    };
  }
  if (listing.property_type !== 'land' && listing.bedrooms) {
    realEstateNode.numberOfBedrooms = listing.bedrooms;
    realEstateNode.numberOfRooms = listing.bedrooms;
  }
  if (listing.property_type !== 'land' && listing.bathrooms) {
    realEstateNode.numberOfBathroomsTotal = listing.bathrooms;
  }
  if (typeof listing.latitude === 'number' && typeof listing.longitude === 'number') {
    realEstateNode.geo = {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude,
      longitude: listing.longitude,
    };
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      realEstateNode,
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
