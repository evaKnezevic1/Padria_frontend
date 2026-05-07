import '@/styles/globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

const snellRoundhand = localFont({
  src: [
    { path: '../../public/fonts/SnellRoundhand.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/SnellRoundhand.woff', weight: '400', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-snell-roundhand',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr'),
  title: 'Padria Real Estate | Real Estate Zadar, Croatia',
  description: 'Premium boutique real estate agency in Zadar, Croatia. Find houses, apartments and luxury properties near the sea.',
  openGraph: {
    siteName: 'Padria Real Estate',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['hr_HR'],
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Padria Real Estate',
  description: 'Leading boutique real estate agency in Zadar County. Specialized in selling and renting houses, apartments and luxury seafront properties in Zadar and the surrounding area.',
  url: `${siteUrl}/en`,
  telephone: '+385989335547',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Zadar',
    postalCode: '23000',
    addressRegion: 'Zadar County',
    addressCountry: 'HR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 44.1194,
    longitude: 15.2314,
  },
  areaServed: {
    '@type': 'City',
    name: 'Zadar',
  },
  sameAs: [
    'https://www.instagram.com/padriarealestate/',
  ],
  priceRange: '€€€',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Padria Real Estate',
  url: `${siteUrl}/en`,
  inLanguage: 'en',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/en/listings?location={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function EnRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={snellRoundhand.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <LanguageProvider initialLanguage="en">
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
