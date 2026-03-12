'use client';

import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import FeaturedListings from '@/components/FeaturedListings';
import { useLanguage } from '@/context/LanguageContext';
import { FaInstagram } from 'react-icons/fa';

export default function Home() {
  const { language } = useLanguage();
  return (
    <main>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Listings */}
      <FeaturedListings />

      {/* Call to Action Section */}
      <section className="py-8 bg-gradient-to-r bg-[#735220] text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">{language === 'hr' ? 'Tražite svoj novi dom?' : 'Ready to Find Your Next Home?'}</h2>
          <p className="text-base mb-4 opacity-90">
            {language === 'hr' ? 'Pogledajte našu ponudu nekretnina ili nam se javite za pomoć pri odabiru.' : 'Browse all our available listings or contact our team for personalized assistance.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="bg-white text-[#735220] hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {language === 'hr' ? 'Pregledaj sve ponude' : 'Browse All Listings'}
            </Link>
            <Link
              href="/public/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-[#735220] px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {language === 'hr' ? 'Kontaktirajte nas' : 'Contact Us'}
            </Link>
          </div>
          <div className="flex justify-center mt-4">
            <a
              href="https://www.instagram.com/padriarealestate/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white-400 hover:text-pink-500 text-3xl"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
