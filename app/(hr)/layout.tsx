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

const ballet = localFont({
  src: '../../public/fonts/Ballet-Regular-VariableFont_opsz.ttf',
  display: 'swap',
  variable: '--font-ballet',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr'),
  title: 'Padria Real Estate | Nekretnine Zadar',
  description: 'Premijerna boutique agencija za nekretnine u Zadru. Pronađite kuće, apartmane i nekretnine uz more u Zadarskoj županiji.',
  openGraph: {
    siteName: 'Padria Real Estate',
    type: 'website',
    locale: 'hr_HR',
    alternateLocale: ['en_US'],
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
  description: 'Vodeća boutique agencija za nekretnine u Zadarskoj županiji. Specijalizirani za prodaju i najam kuća, apartmana i luksuznih nekretnina uz more u Zadru i okolici.',
  url: siteUrl,
  telephone: '+385989335547',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Zadar',
    postalCode: '23000',
    addressRegion: 'Zadarska županija',
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
  url: siteUrl,
  inLanguage: 'hr',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/listings?location={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hr" suppressHydrationWarning className={`${snellRoundhand.variable} ${ballet.variable}`}>
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
        <LanguageProvider initialLanguage="hr">
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
