'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from './Navigation';
import { FaSearch } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';

const heroTranslations = {
  en: {
    title: '...Zadar is a lifestyle',
    sale: 'Sale',
    rent: 'Rent',
    searchPlaceholder: 'Street, neighborhood, city',
    tagline: 'Leading boutique real estate agency in Zadar County.',
  },
  hr: {
    title: '...Zadar je stil života',
    sale: 'Prodaja',
    rent: 'Najam',
    searchPlaceholder: 'Ulica, kvart, grad',
    tagline: 'Vodeća butique agencija za posredovanje nekretninama u zadarskoj županiji',
  },
};

export default function HeroSection() {
  const { language } = useLanguage();
  const heroText = heroTranslations[language];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'prodaja' | 'najam'>('prodaja');
  const [searchQuery, setSearchQuery] = useState('');

  const heroImages = [
    '/images/hero_images/zadar3.jpg',
    '/images/hero_images/fosa.png',
    '/images/hero_images/005.jpg',
    '/images/hero_images/donat.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 10000); // Change image every 7 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchQuery.trim()) query.append('location', searchQuery.trim());
    query.append('listing_type', activeTab === 'prodaja' ? 'sale' : 'rent');
    window.location.href = `/listings?${query.toString()}`;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Images with Smooth Transitions */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-[3000ms] ease-in-out"
          style={{
            opacity: currentImageIndex === index ? 1 : 0,
          }}
        >
          <Image
            src={image}
            alt={`Hero background ${index + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
            loading={index === 0 ? 'eager' : 'lazy'}
            quality={75}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Navigation */}
      <Navigation />

      {/* Hero Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 text-center courgette-regular">
          {heroText.title}
        </h1>

        {/* Search Bar */}
        <div className="w-full max-w-2xl">
          {/* Tabs */}
          <div className="flex mb-0">
            <button
              type="button"
              onClick={() => setActiveTab('prodaja')}
              className={`px-6 py-2 text-sm font-semibold rounded-tl-lg rounded-tr-lg transition-colors ${
                activeTab === 'prodaja'
                  ? 'bg-white text-gray-900'
                  : 'bg-[#bd9462] text-white hover:bg-[#bf8743]'
              }`}
            >
              {heroText.sale}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('najam')}
              className={`px-6 py-2 text-sm font-semibold rounded-tl-lg rounded-tr-lg transition-colors ${
                activeTab === 'najam'
                  ? 'bg-white text-gray-900'
                  : 'bg-[#bd9462] text-white hover:bg-[#bf8743]'
              }`}
            >
              {heroText.rent}
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-b-lg rounded-tr-lg shadow-xl overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-5 py-4 h-10 text-gray-700 text-base outline-none placeholder-gray-400"
              placeholder={heroText.searchPlaceholder}
            />
            <button
              type="submit"
              className="bg-[#bd9462] hover:bg-[#bf8743] text-white px-6 py-4 h-10 transition-colors flex items-center justify-center"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Tagline at bottom center */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center text-center px-4">
        {/*<p className="text-2xl font-light italic text-white drop-shadow-lg">
          &ldquo;Pravi prostor. Prava odluka. Pravo vrijeme..&rdquo;
        </p>*/}
        <p className="text-gray-200 mt-2 text-lg drop-shadow courgette-regular">
          {heroText.tagline}
        </p>
      </div>
    </div>
  );
}
