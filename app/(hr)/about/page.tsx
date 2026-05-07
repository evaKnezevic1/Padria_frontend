import AboutClient, { type AboutContent } from './AboutClient';
import { serverFetch } from '@/utils/serverApi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'O nama – Boutique agencija za nekretnine | Padria Zadar',
  description: 'Boutique agencija za nekretnine u Zadru. Specijaliziramo se za luksuzne kuće uz more i premijerne nekretnine u Zadarskoj županiji.',
  alternates: {
    canonical: `${siteUrl}/about`,
    languages: {
      'hr-HR': `${siteUrl}/about`,
      'en-US': `${siteUrl}/en/about`,
      'x-default': `${siteUrl}/about`,
    },
  },
  openGraph: {
    title: 'O nama – Boutique agencija za nekretnine | Padria Zadar',
    description: 'Boutique agencija za nekretnine u Zadru. Specijaliziramo se za luksuzne kuće uz more.',
    url: `${siteUrl}/about`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate - O nama' }],
    type: 'website' as const,
    locale: 'hr_HR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'O nama – Boutique agencija za nekretnine | Padria Zadar',
    description: 'Boutique agencija za nekretnine u Zadru.',
    images: ['/og-image.jpg'],
  },
};

export default async function AboutPage() {
  const content = await serverFetch<AboutContent>('/about');

  return <AboutClient initialContent={content} />;
}
