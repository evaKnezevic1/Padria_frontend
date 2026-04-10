'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import AddListingModal from './AddListingModal';
import apiClient from '@/utils/apiClient';
import { useLanguage } from '@/context/LanguageContext';

interface NavigationProps {
  isScrolled?: boolean;
  onListingAdded?: () => void;
  forceWhite?: boolean;
}

const translations = {
  en: {
    home: 'HOME',
    realEstate: 'REAL ESTATE',
    house: 'House',
    apartment: 'Apartment',
    land: 'Land',
    sale: 'Sale',
    rent: 'Rent',
    aboutUs: 'ABOUT US',
    contactUs: 'CONTACT US',
    addListing: '+ Add Listing',
    logout: 'Logout',
    adminLogin: 'Admin Login',
    logoutConfirm: 'Are you sure you want to log out?',
  },
  hr: {
    home: 'NASLOVNA',
    realEstate: 'NEKRETNINE',
    house: 'Kuća',
    apartment: 'Stan',
    land: 'Zemljište',
    sale: 'Prodaja',
    rent: 'Najam',
    aboutUs: 'O NAMA',
    contactUs: 'KONTAKT',
    addListing: '+ Dodaj oglas',
    logout: 'Odjava',
    adminLogin: 'Admin prijava',
    logoutConfirm: 'Jeste li sigurni da se želite odjaviti?',
  },
};

export default function Navigation({ isScrolled: isScrolledProp = false, onListingAdded, forceWhite = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(isScrolledProp);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<null | 'realestate'>(null);
  const [expandedMobileSubMenu, setExpandedMobileSubMenu] = useState<null | 'house' | 'apartment' | 'land'>(null);
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const pathname = usePathname();
  const isHomeTop = pathname === '/' && !isScrolled && !forceWhite;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await apiClient.get('/admin/me');
        setIsAdminLoggedIn(res.data && res.data.role === 'admin');
      } catch {
        setIsAdminLoggedIn(false);
      }
    };
    verifyAdmin();
  }, []);

  const handleAdminLogout = () => {
    if (confirm(t.logoutConfirm)) {
      apiClient.post('/admin/logout').finally(() => {
        setIsAdminLoggedIn(false);
        window.location.href = '/';
      });
    }
  };

  const handleListingAdded = () => {
    setShowAddListingModal(false);
    if (onListingAdded) {
      onListingAdded();
    }
    window.location.reload();
  };

  return (
    <>
      <AddListingModal
        isOpen={showAddListingModal}
        onClose={() => setShowAddListingModal(false)}
        onSuccess={handleListingAdded}
      />
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHomeTop ? 'bg-transparent' : 'bg-[#354f54] shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3">
          <div className="relative h-28 flex items-center">
            {/* Desktop Left Menu */}
            <div className="hidden md:flex items-center gap-16 flex-1 justify-end pr-36">
              <Link
                href="/"
                className="text-sm font-semibold uppercase tracking-[0.08em] transition-colors text-white hover:text-orange-300 courgette-regular"
              >
                {t.home}
              </Link>

              {/* Real Estate Dropdown with Nested Submenus */}
              <div className="group relative">
                <button className="text-sm font-semibold uppercase tracking-[0.08em] transition-colors flex items-center gap-2 text-white hover:text-orange-300 courgette-regular">
                  {t.realEstate}
                
                </button>
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">

                  {/* House Submenu */}
                  <div className="group/house relative">
                    <button className="w-full text-left px-4 py-3 text-gray-800 hover:bg-orange-50 text-sm flex items-center justify-between">
                      {t.house}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute left-full top-0 ml-0 w-40 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover/house:opacity-100 group-hover/house:visible transition-all duration-200 z-50">
                      <Link href="/listings?property_type=house&listing_type=sale" className="block px-4 py-3 text-gray-800 hover:bg-orange-50 text-sm">{t.sale}</Link>
                      <Link href="/listings?property_type=house&listing_type=rent" className="block px-4 py-3 text-gray-800 hover:bg-orange-50 text-sm border-b">{t.rent}</Link>
                    </div>
                  </div>

                  {/* Apartment Submenu */}
                  <div className="group/apartment relative">
                    <button className="w-full text-left px-4 py-3 text-gray-800 hover:bg-orange-50 text-sm flex items-center justify-between">
                      {t.apartment}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute left-full top-0 ml-0 w-40 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover/apartment:opacity-100 group-hover/apartment:visible transition-all duration-200 z-50">
                      <Link href="/listings?property_type=apartment&listing_type=sale" className="block px-4 py-3 text-gray-800 hover:bg-orange-50 text-sm">{t.sale}</Link>
                      <Link href="/listings?property_type=apartment&listing_type=rent" className="block px-4 py-3 text-gray-800 hover:bg-orange-50 text-sm border-b">{t.rent}</Link>
                    </div>
                  </div>

                  {/* Land Submenu - Sale Only */}
                  <div className="group/land relative">
                    <button className="w-full text-left px-4 py-3 text-gray-800 hover:bg-orange-50 text-sm flex items-center justify-between border-b">
                      {t.land}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute left-full top-0 ml-0 w-40 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover/land:opacity-100 group-hover/land:visible transition-all duration-200 z-50">
                      <Link href="/listings?property_type=land&listing_type=sale" className="block px-4 py-3 text-gray-800 hover:bg-orange-50 text-sm border-b">{t.sale}</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex h-full items-center pt-3">
              <Image
                src="/images/Padria_Logo_transp.png"
                alt="Pavica's Homes Logo"
                width={120}
                height={48}
                className="transition-all duration-300"
                priority
              />
            </Link>

            {/* Desktop Right Menu */}
            <div className="hidden md:flex items-center gap-16 flex-1 justify-start pl-24">
              <Link
                href="/public/about"
                className="text-sm font-semibold uppercase tracking-[0.08em] transition-colors text-white hover:text-orange-300 courgette-regular"
              >
                {t.aboutUs}
              </Link>

              <Link
                href="/public/contact"
                className="text-sm font-semibold uppercase tracking-[0.08em] transition-colors text-white hover:text-orange-300 courgette-regular"
              >
                {t.contactUs}
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4 absolute right-3 top-1/2 -translate-y-1/2">
              {isAdminLoggedIn && (
                <>
                  <button
                    onClick={() => setShowAddListingModal(true)}
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    {t.addListing}
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="text-sm font-medium uppercase tracking-wide transition-colors text-white hover:text-orange-300"
                  >
                    {t.logout}
                  </button>
                </>
              )}

              <button
                onClick={() => setLanguage(language === 'en' ? 'hr' : 'en')}
                className="text-sm font-medium uppercase tracking-wide transition-colors text-white hover:text-orange-300 flex items-center gap-1 ml-auto"
              >
                {language === 'en' ? 'HRV' : 'ENG'}
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-2xl text-white"
            >
              ☰
            </button>

            <div className="md:hidden w-8" />

          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 space-y-2 pb-4 bg-transparent">
              <Link href="/" className="block text-sm font-medium px-4 py-2 text-white">{t.home}</Link>
              
              {/* Mobile Real Estate Menu */}
              <div>
                <button
                  onClick={() => setExpandedMobileMenu(expandedMobileMenu === 'realestate' ? null : 'realestate')}
                  className="block w-full text-left text-sm font-medium px-4 py-2 text-white flex items-center justify-between"
                >
                  {t.realEstate}
                  <svg className={`w-4 h-4 transition-transform ${expandedMobileMenu === 'realestate' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {expandedMobileMenu === 'realestate' && (
                  <div className="bg-black/10 pl-4">
                    {/* House Submenu */}
                    <div>
                      <button
                        onClick={() => {
                          if (expandedMobileMenu === 'realestate') {
                            setExpandedMobileSubMenu(expandedMobileSubMenu === 'house' ? null : 'house');
                          }
                        }}
                        disabled={expandedMobileMenu !== 'realestate'}
                        className={`block w-full text-left text-sm font-medium px-4 py-2 text-white flex items-center justify-between ${expandedMobileMenu !== 'realestate' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {t.house}
                        <svg className={`w-4 h-4 transition-transform ${(expandedMobileMenu === 'realestate' && expandedMobileSubMenu === 'house') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </button>
                      {(expandedMobileMenu === 'realestate' && expandedMobileSubMenu === 'house') && (
                        <div className="pl-4">
                          <Link href="/listings?property_type=house&listing_type=sale" className="block text-sm font-medium px-4 py-2 text-white">{t.sale}</Link>
                          <Link href="/listings?property_type=house&listing_type=rent" className="block text-sm font-medium px-4 py-2 text-white">{t.rent}</Link>
                        </div>
                      )}
                    </div>

                    {/* Apartment Submenu */}
                    <div>
                      <button
                        onClick={() => {
                          if (expandedMobileMenu === 'realestate') {
                            setExpandedMobileSubMenu(expandedMobileSubMenu === 'apartment' ? null : 'apartment');
                          }
                        }}
                        disabled={expandedMobileMenu !== 'realestate'}
                        className={`block w-full text-left text-sm font-medium px-4 py-2 text-white flex items-center justify-between ${expandedMobileMenu !== 'realestate' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {t.apartment}
                        <svg className={`w-4 h-4 transition-transform ${(expandedMobileMenu === 'realestate' && expandedMobileSubMenu === 'apartment') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </button>
                      {(expandedMobileMenu === 'realestate' && expandedMobileSubMenu === 'apartment') && (
                        <div className="pl-4">
                          <Link href="/listings?property_type=apartment&listing_type=sale" className="block text-sm font-medium px-4 py-2 text-white">{t.sale}</Link>
                          <Link href="/listings?property_type=apartment&listing_type=rent" className="block text-sm font-medium px-4 py-2 text-white">{t.rent}</Link>
                        </div>
                      )}
                    </div>

                    {/* Land Submenu */}
                    <div>
                      <button
                        onClick={() => {
                          if (expandedMobileMenu === 'realestate') {
                            setExpandedMobileSubMenu(expandedMobileSubMenu === 'land' ? null : 'land');
                          }
                        }}
                        disabled={expandedMobileMenu !== 'realestate'}
                        className={`block w-full text-left text-sm font-medium px-4 py-2 text-white flex items-center justify-between ${expandedMobileMenu !== 'realestate' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {t.land}
                        <svg className={`w-4 h-4 transition-transform ${(expandedMobileMenu === 'realestate' && expandedMobileSubMenu === 'land') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </button>
                      {(expandedMobileMenu === 'realestate' && expandedMobileSubMenu === 'land') && (
                        <div className="pl-4">
                          <Link href="/listings?property_type=land&listing_type=sale" className="block text-sm font-medium px-4 py-2 text-white">{t.sale}</Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/public/about" className="block text-sm font-medium px-4 py-2 text-white">{t.aboutUs}</Link>
              <Link href="/public/contact" className="block text-sm font-medium px-4 py-2 text-white">{t.contactUs}</Link>
              <button
                onClick={() => setLanguage(language === 'en' ? 'hr' : 'en')}
                className="block w-full text-left text-sm font-medium px-4 py-2 text-white"
              >
                {language === 'en' ? '🇭🇷 HRV' : '🇬🇧 ENG'}
              </button>
              {isAdminLoggedIn && (
                <>
                  <button
                    onClick={() => setShowAddListingModal(true)}
                    className="block w-full text-left bg-orange-500 px-4 py-2 text-white text-sm font-medium rounded"
                  >
                    {t.addListing}
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="block w-full text-left text-sm font-medium px-4 py-2 text-white"
                  >
                    {t.logout}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
