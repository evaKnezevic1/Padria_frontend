import AboutClient, { type AboutContent } from './AboutClient';
import { serverFetch } from '@/utils/serverApi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'O nama | Agencija za nekretnine Zadar | About Us',
  description: 'Saznajte vise o nasoj agenciji za nekretnine u Zadru. Specijaliziramo se za luksuzne kuce uz more i premijerne nekretnine u Hrvatskoj. Learn about our real estate agency in Zadar, Croatia.',
  keywords: 'o nama, agencija za nekretnine Zadar, strucnjaci za nekretnine, luksuzne kuce Zadar, about us, real estate agency Zadar, property specialists Croatia',
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    title: 'O nama | Agencija za nekretnine Zadar',
    description: 'Saznajte vise o nasoj agenciji za nekretnine u Zadru. Specijaliziramo se za luksuzne kuce uz more i premijerne nekretnine u Hrvatskoj.',
    url: `${siteUrl}/about`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate - O nama' }],
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'O nama | Agencija za nekretnine Zadar | About Us',
    description: 'Saznajte vise o nasoj agenciji za nekretnine u Zadru. Specijaliziramo se za luksuzne nekretnine u Hrvatskoj.',
    images: ['/og-image.jpg'],
  },
};

export default async function AboutPage() {
  const content = await serverFetch<AboutContent>('/about');

  return <AboutClient initialContent={content} />;
}
