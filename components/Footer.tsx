'use client';

import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { GoGoal } from 'react-icons/go';
import { IoLockClosedOutline } from 'react-icons/io5';
import { BsHouse } from 'react-icons/bs';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  const ctaItems = language === 'hr'
    ? [
      { icon: BsHouse, text: 'Zatražite besplatnu procjenu vaše nekretnine.' },
      { icon: IoLockClosedOutline, text: 'Prodajte svoju nekretninu u tajnosti bez oglašavanja.' },
      { icon: GoGoal, text: 'Istaknite svoju nekretninu na vodećim inozemnim portalima.' },
    ]
    : [
      { icon: BsHouse, text: 'Request a free valuation of your property.' },
      { icon: IoLockClosedOutline, text: 'Sell your property discreetly without advertising.' },
      { icon: GoGoal, text: 'Highlight your property on leading foreign portals.' },
    ];

  return (
    <section className="pt-8 bg-gradient-to-r bg-[#434b57] shadow-lg text-white">
      <div className="max-w-6xl mx-auto text-center px-4 sm:px-8">
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-8">
          {ctaItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text} className="flex flex-col items-center text-center gap-4 sm:max-w-[260px]">
                <Icon className="text-5xl text-white" aria-hidden="true" />
                <p className="text-lg opacity-90">{item.text}</p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center mt-10 gap-6">
          <a
            href="https://www.instagram.com/padriarealestate/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-white-400 hover:text-pink-500 text-3xl"
          >
            <FaInstagram />
          </a>
          <a
            href="https://wa.me/385989335547"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-white-400 hover:text-green-400 text-3xl"
          >
            <FaWhatsapp />
          </a>
          <img
            src="/images/hgk-logo.png"
            alt="hgk logo"
            className="w-20 h-20 -mt-6 object-contain hover:scale-110 transition"
          />
        </div>
        <p className="text-sm -mt-2 text-white/70"> {language === 'hr' ? 'Licencirana agencija za nekretnine' : 'Licensed real estate agency'}</p>
      </div>
    </section>
  );
}
