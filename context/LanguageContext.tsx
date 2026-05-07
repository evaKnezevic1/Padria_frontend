'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Language = 'en' | 'hr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const language: Language = useMemo(() => {
    if (initialLanguage) return initialLanguage;
    return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'hr';
  }, [initialLanguage, pathname]);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;

    const isOnEn = pathname === '/en' || pathname.startsWith('/en/');
    let target: string;
    if (lang === 'en') {
      target = isOnEn ? pathname : `/en${pathname === '/' ? '' : pathname}`;
    } else {
      if (!isOnEn) {
        target = pathname;
      } else {
        const stripped = pathname.replace(/^\/en/, '');
        target = stripped === '' ? '/' : stripped;
      }
    }
    router.push(target);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
