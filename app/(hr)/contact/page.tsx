import ContactClient, { type ContactContent } from './ContactClient';
import { serverFetch } from '@/utils/serverApi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'Kontakt – Agencija za nekretnine Zadar | Padria',
  description: 'Kontaktirajte Padria Real Estate za upite o nekretninama u Zadru i konzultacije. Telefon, e-mail i WhatsApp dostupni su svaki dan.',
  alternates: {
    canonical: `${siteUrl}/contact`,
    languages: {
      'hr-HR': `${siteUrl}/contact`,
      'en-US': `${siteUrl}/en/contact`,
      'x-default': `${siteUrl}/contact`,
    },
  },
  openGraph: {
    title: 'Kontakt – Agencija za nekretnine Zadar | Padria',
    description: 'Kontaktirajte Padria Real Estate za upite o nekretninama u Zadru.',
    url: `${siteUrl}/contact`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate - Kontakt' }],
    type: 'website' as const,
    locale: 'hr_HR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Kontakt – Agencija za nekretnine Zadar | Padria',
    description: 'Kontaktirajte Padria Real Estate za upite o nekretninama.',
    images: ['/og-image.jpg'],
  },
};

export default async function ContactPage() {
  const content = await serverFetch<ContactContent>('/contact');

  return <ContactClient initialContent={content} />;
}
