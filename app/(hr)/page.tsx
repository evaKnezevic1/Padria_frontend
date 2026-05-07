import HeroSection from '@/components/HeroSection';
import FeaturedListings from '@/components/FeaturedListings';
import Footer from '@/components/Footer';
import HomeAboutSection, { AboutContentResponse } from './HomeAboutSection';
import { serverFetch } from '@/utils/serverApi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'Nekretnine Zadar – Kuće uz more | Padria Real Estate',
  description: 'Pronađite dom iz snova u Zadru. Premijerna boutique agencija specijalizirana za kuće uz more i luksuzne apartmane u Zadarskoj županiji.',
  alternates: {
    canonical: siteUrl,
    languages: {
      'hr-HR': siteUrl,
      'en-US': `${siteUrl}/en`,
      'x-default': siteUrl,
    },
  },
  openGraph: {
    title: 'Nekretnine Zadar – Kuće uz more | Padria Real Estate',
    description: 'Pronađite dom iz snova u Zadru. Premijerna boutique agencija specijalizirana za kuće uz more i luksuzne apartmane.',
    url: siteUrl,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate - Nekretnine Zadar' }],
    type: 'website' as const,
    locale: 'hr_HR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Nekretnine Zadar – Kuće uz more | Padria Real Estate',
    description: 'Pronađite dom iz snova u Zadru. Premijerna boutique agencija specijalizirana za kuće uz more.',
    images: ['/og-image.jpg'],
  },
};

export default async function Home() {
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
