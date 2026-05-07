import AboutClient, { type AboutContent } from '../../../(hr)/about/AboutClient';
import { serverFetch } from '@/utils/serverApi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'About us – Boutique Real Estate Agency | Padria Zadar',
  description: 'Boutique real estate agency in Zadar, Croatia. We specialise in luxury seafront houses and premium properties across Zadar County.',
  alternates: {
    canonical: `${siteUrl}/en/about`,
    languages: {
      'hr-HR': `${siteUrl}/about`,
      'en-US': `${siteUrl}/en/about`,
      'x-default': `${siteUrl}/about`,
    },
  },
  openGraph: {
    title: 'About us – Boutique Real Estate Agency | Padria Zadar',
    description: 'Boutique real estate agency in Zadar, Croatia. We specialise in luxury seafront houses and premium properties.',
    url: `${siteUrl}/en/about`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate – About us' }],
    type: 'website' as const,
    locale: 'en_US',
    alternateLocale: ['hr_HR'],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'About us – Boutique Real Estate Agency | Padria Zadar',
    description: 'Boutique real estate agency in Zadar, Croatia.',
    images: ['/og-image.jpg'],
  },
};

export default async function EnAboutPage() {
  const content = await serverFetch<AboutContent>('/about');
  return <AboutClient initialContent={content} />;
}
