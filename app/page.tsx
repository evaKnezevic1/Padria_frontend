import HeroSection from '@/components/HeroSection';
import FeaturedListings from '@/components/FeaturedListings';
import Footer from '@/components/Footer';
import HomeAboutSection, { AboutContentResponse } from './HomeAboutSection';
import { serverFetch } from '@/utils/serverApi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.com';

export const metadata = {
  title: 'Agencija za nekretnine Zadar | Kuće i Apartmani uz More | Real Estate',
  description: 'Pronađite dom iz snova u Zadru. Premijerna agencija za nekretnine specijalizirana za kuće uz more i luksuzne apartmane u Zadru, Hrvatska. Find your dream home in Zadar — premium real estate near the sea.',
  keywords: 'nekretnine Zadar, kuće Zadar, apartmani Zadar, kuće uz more, luksuzne nekretnine Zadar, kupiti kuću Hrvatska, real estate Zadar, houses Zadar, apartments Zadar, buy house Croatia, luxury properties Zadar',
  alternates: { canonical: siteUrl },
  openGraph: {
    title: 'Agencija za nekretnine Zadar | Kuće i Apartmani uz More',
    description: 'Pronađite dom iz snova u Zadru. Premium real estate in Zadar — houses and apartments near the sea in Croatia.',
    url: siteUrl,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate - Nekretnine Zadar' }],
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Agencija za nekretnine Zadar | Kuće i Apartmani uz More',
    description: 'Pronađite dom iz snova u Zadru. Premium real estate near the sea in Zadar, Croatia.',
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
