import ContactClient, { type ContactContent } from '../../../(hr)/contact/ContactClient';
import { serverFetch } from '@/utils/serverApi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padriarealestate.hr';

export const metadata = {
  title: 'Contact – Real Estate Agency Zadar | Padria',
  description: 'Get in touch with Padria Real Estate for property enquiries and consultations in Zadar, Croatia. Phone, email and WhatsApp available daily.',
  alternates: {
    canonical: `${siteUrl}/en/contact`,
    languages: {
      'hr-HR': `${siteUrl}/contact`,
      'en-US': `${siteUrl}/en/contact`,
      'x-default': `${siteUrl}/contact`,
    },
  },
  openGraph: {
    title: 'Contact – Real Estate Agency Zadar | Padria',
    description: 'Get in touch with Padria Real Estate for property enquiries and consultations in Zadar.',
    url: `${siteUrl}/en/contact`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Padria Real Estate – Contact' }],
    type: 'website' as const,
    locale: 'en_US',
    alternateLocale: ['hr_HR'],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Contact – Real Estate Agency Zadar | Padria',
    description: 'Get in touch with Padria Real Estate.',
    images: ['/og-image.jpg'],
  },
};

export default async function EnContactPage() {
  const content = await serverFetch<ContactContent>('/contact');
  return <ContactClient initialContent={content} />;
}
