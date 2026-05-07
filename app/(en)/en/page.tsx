import HeroSection from '@/components/HeroSection';
import FeaturedListings from '@/components/FeaturedListings';
import Footer from '@/components/Footer';
import HomeAboutSection, { AboutContentResponse } from '../../(hr)/HomeAboutSection';
import { serverFetch } from '@/utils/serverApi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'Real Estate Zadar – Houses by the sea | Padria Real Estate',
  description: 'Find your dream home in Zadar, Croatia. Premium boutique real estate agency specialized in seafront houses and luxury apartments in Zadar County.',
  alternates: {
    canonical: `${siteUrl}/en`,
    languages: {
      'hr-HR': siteUrl,
      'en-US': `${siteUrl}/en`,
      'x-default': siteUrl,
    },
  },
  openGraph: {
    title: 'Real Estate Zadar – Houses by the sea | Padria Real Estate',
    description: 'Find your dream home in Zadar, Croatia. Premium boutique real estate agency specialized in seafront houses and luxury apartments.',
    url: `${siteUrl}/en`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate – Zadar' }],
    type: 'website' as const,
    locale: 'en_US',
    alternateLocale: ['hr_HR'],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Real Estate Zadar – Houses by the sea | Padria Real Estate',
    description: 'Find your dream home in Zadar, Croatia. Premium real estate near the sea.',
    images: ['/og-image.jpg'],
  },
};

export default async function EnHome() {
  const aboutData = await serverFetch<AboutContentResponse>('/about');

  return (
    <main className="bg-[#c4b8a3]">
      <HeroSection />
      <FeaturedListings />
      <HomeAboutSection initialAboutData={aboutData} />
      <Footer />
    </main>
  );
}
