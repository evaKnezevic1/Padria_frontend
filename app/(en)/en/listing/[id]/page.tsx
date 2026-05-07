import Navigation from '@/components/Navigation';
import { Listing } from '@/types';
import { serverFetch, SERVER_BACKEND_ROOT } from '@/utils/serverApi';
import ListingDetailClient from '../../../../(hr)/listing/[id]/ListingDetailClient';

interface PageProps {
  params: { id: string };
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export async function generateMetadata({ params }: PageProps) {
  const listing = await serverFetch<Listing>(`/listings/${params.id}`);
  if (!listing) {
    return {
      title: 'Listing not found | Padria Real Estate',
      description: 'This property listing could not be found.',
      robots: { index: false },
    };
  }

  const primaryImg = listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];
  const ogImage = primaryImg
    ? (primaryImg.image_url.startsWith('http') ? primaryImg.image_url : `${SERVER_BACKEND_ROOT}${primaryImg.image_url}`)
    : '/og-image.jpg';

  const propertyTypeMap: Record<string, string> = {
    house: 'House',
    apartment: 'Apartment',
    land: 'Land',
  };
  const propertyTypeLabel = propertyTypeMap[listing.property_type] ?? 'Property';
  const cityLabel = listing.city || listing.location || 'Zadar';
  const sizeLabel = listing.size_sqft ? `${listing.size_sqft} m²` : '';
  const bedroomsLabel = listing.property_type !== 'land' && listing.bedrooms
    ? `${listing.bedrooms} bedroom${listing.bedrooms === 1 ? '' : 's'}`
    : '';
  const priceLabel = listing.price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)
    : '';

  const titleEn = listing.title_en || listing.title;
  const descriptionEn = listing.description_en || listing.description;

  const title = `${titleEn} – ${propertyTypeLabel} ${sizeLabel} in ${cityLabel} | Padria`.replace(/\s+/g, ' ').trim();
  const description = descriptionEn
    ? descriptionEn.slice(0, 155)
    : [propertyTypeLabel, sizeLabel, bedroomsLabel, `in ${cityLabel}`, priceLabel ? `Price ${priceLabel}` : '']
        .filter(Boolean)
        .join(', ') + '.';

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}/en/listing/${params.id}`,
      languages: {
        'hr-HR': `${siteUrl}/listing/${params.id}`,
        'en-US': `${siteUrl}/en/listing/${params.id}`,
        'x-default': `${siteUrl}/listing/${params.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/en/listing/${params.id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${propertyTypeLabel} ${sizeLabel} – ${cityLabel}` }],
      type: 'website' as const,
      locale: 'en_US',
      alternateLocale: ['hr_HR'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EnListingDetailPage({ params }: PageProps) {
  const listingId = params.id;
  const listing = await serverFetch<Listing>(`/listings/${listingId}`);

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#c4b8a3]">
        <Navigation forceWhite={true} />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-8">The listing you are looking for does not exist.</p>
          <a href="/en/listings" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            View All Listings
          </a>
        </div>
      </div>
    );
  }

  const imageUrls = (listing.images ?? []).map((img) =>
    img.image_url.startsWith('http') ? img.image_url : `${SERVER_BACKEND_ROOT}${img.image_url}`
  );

  const titleEn = listing.title_en || listing.title;
  const descriptionEn = listing.description_en || listing.description;

  const realEstateNode: Record<string, unknown> = {
    '@type': 'RealEstateListing',
    name: titleEn,
    description: descriptionEn || titleEn,
    image: imageUrls,
    url: `${siteUrl}/en/listing/${listingId}`,
    datePosted: listing.created_at,
    dateModified: listing.updated_at,
    inLanguage: 'en',
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/en/listing/${listingId}`,
      seller: { '@type': 'RealEstateAgent', name: 'Padria Real Estate' },
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.city || listing.location,
      addressRegion: 'Zadar County',
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
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/en` },
          { '@type': 'ListItem', position: 2, name: 'Listings', item: `${siteUrl}/en/listings` },
          { '@type': 'ListItem', position: 3, name: titleEn, item: `${siteUrl}/en/listing/${listingId}` },
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
