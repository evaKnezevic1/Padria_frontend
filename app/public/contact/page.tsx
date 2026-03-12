'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/context/LanguageContext';
import apiClient from '@/utils/apiClient';

const translations = {
  en: {
    addressLabel: 'Address',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    edit: 'Edit',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    saveError: 'Failed to save changes. Please try again.',
    croatian: 'Croatian',
    english: 'English',
  },
  hr: {
    addressLabel: 'Adresa',
    phoneLabel: 'Telefon',
    emailLabel: 'E-mail',
    edit: 'Uredi',
    save: 'Spremi',
    saving: 'Spremanje...',
    cancel: 'Odustani',
    saveError: 'Greška pri spremanju. Pokušajte ponovo.',
    croatian: 'Hrvatski',
    english: 'Engleski',
  },
};

interface ContactContent {
  id: number;
  title: string;
  subtitle: string;
  title_en: string | null;
  subtitle_en: string | null;
  address: string;
  phone: string;
  email: string;
}

const heroImages = [
  '/images/hero_images/background2.png',
  '/images/hero_images/fosa.png',
  '/images/hero_images/zadric.jpg',
  '/images/hero_images/donat.png',
];

export default function ContactPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [content, setContent] = useState<ContactContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLang, setEditLang] = useState<'hr' | 'en'>('hr');
  const [draft, setDraft] = useState<ContactContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    verifyAdmin();
    fetchContent();
  }, []);

  const verifyAdmin = async () => {
    try {
      const res = await apiClient.get('/admin/me');
      setIsAdmin(res.data && res.data.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await apiClient.get('/contact');
      setContent(res.data);
    } catch {
      setContent({
        id: 1,
        title: 'Kontaktirajte nas',
        subtitle: 'Javite nam se putem bilo kojeg od kanala ispod.',
        title_en: null,
        subtitle_en: null,
        address: 'Madijevaca 3, Zadar',
        phone: '+385 98 893 547',
        email: 'padriarealestate@gmail.com',
      });
    }
  };

  const startEditing = () => {
    if (content) {
      setDraft({ ...content });
      setIsEditing(true);
      setSaveError('');
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft(null);
    setSaveError('');
  };

  const handleChange = (field: keyof ContactContent, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const saveChanges = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await apiClient.put('/contact', {
        title: draft.title,
        subtitle: draft.subtitle,
        title_en: draft.title_en,
        subtitle_en: draft.subtitle_en,
        address: draft.address,
        phone: draft.phone,
        email: draft.email,
      });
      setContent(res.data);
      setIsEditing(false);
      setDraft(null);
    } catch {
      setSaveError(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const displayData = isEditing ? draft : content;

  /* resolve displayed value based on viewer language */
  const displayTitle = (): string => {
    if (!content) return '';
    if (language === 'en') return content.title_en || content.title || '';
    return content.title || '';
  };

  const displaySubtitle = (): string => {
    if (!content) return '';
    if (language === 'en') return content.subtitle_en || content.subtitle || '';
    return content.subtitle || '';
  };

  /* For editing: get the field value for the currently-selected edit language */
  const editTitleVal = (): string => {
    if (!draft) return '';
    return editLang === 'en' ? (draft.title_en ?? '') : draft.title;
  };

  const editSubtitleVal = (): string => {
    if (!draft) return '';
    return editLang === 'en' ? (draft.subtitle_en ?? '') : draft.subtitle;
  };

  const handleTitleChange = (value: string) => {
    const key = editLang === 'en' ? 'title_en' : 'title';
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubtitleChange = (value: string) => {
    const key = editLang === 'en' ? 'subtitle_en' : 'subtitle';
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {heroImages.map((image, index) => (
        <div key={index} className="absolute inset-0 transition-opacity duration-[3000ms] ease-in-out"
          style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: currentImageIndex === index ? 1 : 0 }}>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      <Navigation />

      <div className="relative z-10 flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 pt-20">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-10 md:p-14 max-h-[75vh] overflow-y-auto mt-16">

          {/* Title row */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            {isEditing ? (
              <div className="flex-1">
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setEditLang('hr')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${editLang === 'hr' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    🇭🇷 {t.croatian}
                  </button>
                  <button onClick={() => setEditLang('en')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${editLang === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    🇬🇧 {t.english}
                  </button>
                </div>
                <input className="text-4xl font-bold text-gray-800 border-b-2 border-orange-400 bg-transparent focus:outline-none w-full"
                  value={editTitleVal()} onChange={(e) => handleTitleChange(e.target.value)} />
              </div>
            ) : (
              <h1 className="text-4xl font-bold text-gray-800">{displayTitle()}</h1>
            )}

            {isAdmin && (
              <div className="flex gap-3 shrink-0">
                {isEditing ? (
                  <>
                    <button onClick={saveChanges} disabled={saving}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
                      {saving ? t.saving : t.save}
                    </button>
                    <button onClick={cancelEditing} disabled={saving}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                      {t.cancel}
                    </button>
                  </>
                ) : (
                  <button onClick={startEditing} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                     {t.edit}
                  </button>
                )}
              </div>
            )}
          </div>

          {saveError && <p className="text-red-500 text-sm text-center mb-4">{saveError}</p>}

          {/* Subtitle */}
          {isEditing ? (
            <textarea className="w-full text-center text-gray-500 text-sm mb-10 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" rows={2}
              value={editSubtitleVal()} onChange={(e) => handleSubtitleChange(e.target.value)} />
          ) : (
            <p className="text-center text-gray-500 text-sm mb-10 max-w-sm mx-auto">{displaySubtitle()}</p>
          )}

          <div className="w-8 h-0.5 bg-orange-500 rounded mx-auto mb-10" />

          {/* Three contact sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">

            {/* ADDRESS */}
            <div className="flex flex-col items-center text-center px-6 py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z" />
                <circle cx="12" cy="8" r="2.5" stroke="currentColor" fill="none" />
              </svg>
              <h3 className="text-xs font-bold tracking-[0.2em] text-gray-600 uppercase mb-3">{t.addressLabel}</h3>
              {isEditing ? (
                <input type="text" value={draft?.address ?? ''} onChange={(e) => handleChange('address', e.target.value)}
                  className="text-gray-700 text-sm border-b border-orange-400 focus:outline-none text-center w-full bg-transparent" />
              ) : (
                <p className="text-gray-700 text-sm">{displayData?.address}</p>
              )}
            </div>

            {/* PHONE */}
            <div className="flex flex-col items-center text-center px-6 py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
                <line x1="11" y1="18" x2="13" y2="18" strokeLinecap="round" />
                <path strokeLinecap="round" d="M15.5 5.5 C17 4 18.5 4 19.5 5" />
                <path strokeLinecap="round" d="M17 3.5 C19 2 21 2 22.5 3.5" />
              </svg>
              <h3 className="text-xs font-bold tracking-[0.2em] text-gray-600 uppercase mb-3">{t.phoneLabel}</h3>
              {isEditing ? (
                <input type="text" value={draft?.phone ?? ''} onChange={(e) => handleChange('phone', e.target.value)}
                  className="text-gray-700 text-sm border-b border-orange-400 focus:outline-none text-center w-full bg-transparent" />
              ) : (
                <p className="text-gray-700 text-sm">
                  <a href={`tel:${displayData?.phone}`} className="hover:text-orange-500 transition-colors">{displayData?.phone}</a>
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div className="flex flex-col items-center text-center px-6 py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                <line x1="9" y1="9" x2="15" y2="9" strokeLinecap="round" />
                <line x1="9" y1="13" x2="15" y2="13" strokeLinecap="round" />
                <line x1="9" y1="17" x2="12" y2="17" strokeLinecap="round" />
              </svg>
              <h3 className="text-xs font-bold tracking-[0.2em] text-gray-600 uppercase mb-3">{t.emailLabel}</h3>
              {isEditing ? (
                <input type="email" value={draft?.email ?? ''} onChange={(e) => handleChange('email', e.target.value)}
                  className="text-gray-700 text-sm border-b border-orange-400 focus:outline-none text-center w-full bg-transparent" />
              ) : (
                <p className="text-gray-700 text-sm">
                  <a href={`mailto:${displayData?.email}`} className="hover:text-orange-500 transition-colors">{displayData?.email}</a>
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

