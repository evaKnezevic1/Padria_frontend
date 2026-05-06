import ContactClient, { type ContactContent } from './ContactClient';
import { serverFetch } from '@/utils/serverApi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'Kontakt | Agencija za nekretnine Zadar | Contact',
  description: 'Kontaktirajte nasu agenciju za nekretnine u Zadru. Stupite u kontakt s nasim timom za upite o nekretninama i konzultacije. Contact our real estate agency in Zadar for property inquiries.',
  keywords: 'kontakt, nekretnine Zadar, upiti o nekretninama, konzultacije za nekretnine, contact, real estate Zadar, property inquiries Zadar',
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: 'Kontakt | Agencija za nekretnine Zadar',
    description: 'Kontaktirajte nasu agenciju za nekretnine u Zadru. Stupite u kontakt s nasim timom za upite o nekretninama i konzultacije.',
    url: `${siteUrl}/contact`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate - Kontakt' }],
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Kontakt | Agencija za nekretnine Zadar | Contact',
    description: 'Kontaktirajte nasu agenciju za nekretnine u Zadru za upite o nekretninama.',
    images: ['/og-image.jpg'],
  },
};

export default async function ContactPage() {
  const content = await serverFetch<ContactContent>('/contact');

  return <ContactClient initialContent={content} />;
}
