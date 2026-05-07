'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import apiClient from '@/utils/apiClient';

const heroImages = [
  '/images/hero_images/zadar3.jpg',
  '/images/hero_images/fosa.png',
  '/images/hero_images/005.jpg',
  '/images/hero_images/donat.png',
];

export interface AboutContent {
  id: number;
  title: string;
  intro: string;
  mission_title: string;
  mission_text: string;
  why_title: string;
  why_items: string;
  contact_title: string;
  contact_text: string;
  title_en: string | null;
  intro_en: string | null;
  mission_title_en: string | null;
  mission_text_en: string | null;
  why_title_en: string | null;
  why_items_en: string | null;
  contact_title_en: string | null;
  contact_text_en: string | null;
  about_image_url: string | null;
}

const uiText = {
  en: {
    edit: 'Edit Page', save: 'Save', saving: 'Saving...', cancel: 'Cancel',
    saveError: 'Failed to save changes. Please try again.',
    addEnglish: '🇬🇧 Add English version', removeEnglish: '🇬🇧 English version ✓',
    addCroatian: '🇭🇷 Add Croatian version', removeCroatian: '🇭🇷 Croatian version ✓',
    add: '+ Add', croatianSection: '🇭🇷 Croatian Version', englishSection: '🇬🇧 English Version (optional)',
  },
  hr: {
    edit: 'Uredi stranicu', save: 'Spremi', saving: 'Spremanje...', cancel: 'Odustani',
    saveError: 'Greška pri spremanju. Pokušajte ponovo.',
    addEnglish: '🇬🇧 Dodaj englesku verziju', removeEnglish: '🇬🇧 Engleska verzija ✓',
    addCroatian: '🇭🇷 Dodaj hrvatsku verziju', removeCroatian: '🇭🇷 Hrvatska verzija ✓',
    add: '+ Dodaj', croatianSection: '🇭🇷 Hrvatska verzija', englishSection: '🇬🇧 Engleska verzija (opcionalno)',
  },
};

interface AboutClientProps {
  initialContent?: AboutContent | null;
}

export default function AboutClient({ initialContent }: AboutClientProps) {
  const { language } = useLanguage();
  const t = uiText[language];

  const [content, setContent] = useState<AboutContent | null>(initialContent ?? null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [draft, setDraft] = useState<AboutContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(!initialContent);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    verifyAdmin();
    if (!initialContent) {
      fetchContent();
    }
  }, [initialContent]);

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
      const res = await apiClient.get('/about');
      setContent(res.data);
    } catch {
      // fallback — backend seeds defaults on first request
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    if (content) {
      setDraft({ ...content });
      setShowEnglish(!!(content.title_en || content.intro_en));
      setIsEditing(true);
      setSaveError('');
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft(null);
    setShowEnglish(false);
    setSaveError('');
  };

  const handleChange = (field: keyof AboutContent, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleHRWhyItemsChange = (index: number, value: string) => {
    if (!draft) return;
    const items = (draft.why_items ?? '').split('|');
    items[index] = value;
    setDraft({ ...draft, why_items: items.join('|') });
  };

  const addHRWhyItem = () => {
    if (!draft) return;
    const current = draft.why_items ?? '';
    setDraft({ ...draft, why_items: current ? current + '|Novi stavak' : 'Novi stavak' });
  };

  const removeHRWhyItem = (index: number) => {
    if (!draft) return;
    const items = (draft.why_items ?? '').split('|').filter((_, i) => i !== index);
    setDraft({ ...draft, why_items: items.join('|') });
  };

  const handleENWhyItemsChange = (index: number, value: string) => {
    if (!draft) return;
    const items = (draft.why_items_en ?? '').split('|');
    items[index] = value;
    setDraft({ ...draft, why_items_en: items.join('|') });
  };

  const addENWhyItem = () => {
    if (!draft) return;
    const current = draft.why_items_en ?? '';
    setDraft({ ...draft, why_items_en: current ? current + '|New item' : 'New item' });
  };

  const removeENWhyItem = (index: number) => {
    if (!draft) return;
    const items = (draft.why_items_en ?? '').split('|').filter((_, i) => i !== index);
    setDraft({ ...draft, why_items_en: items.join('|') });
  };

  const saveChanges = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        title: draft.title,
        intro: draft.intro,
        mission_title: draft.mission_title,
        mission_text: draft.mission_text,
        why_title: draft.why_title,
        why_items: draft.why_items,
        contact_title: draft.contact_title,
        contact_text: draft.contact_text,
        title_en: showEnglish ? draft.title_en : null,
        intro_en: showEnglish ? draft.intro_en : null,
        mission_title_en: showEnglish ? draft.mission_title_en : null,
        mission_text_en: showEnglish ? draft.mission_text_en : null,
        why_title_en: showEnglish ? draft.why_title_en : null,
        why_items_en: showEnglish ? draft.why_items_en : null,
        contact_title_en: showEnglish ? draft.contact_title_en : null,
        contact_text_en: showEnglish ? draft.contact_text_en : null,
      };
      const res = await apiClient.put('/about', payload);
      setContent(res.data);
      setIsEditing(false);
      setDraft(null);
      setShowEnglish(false);
    } catch (err: any) {
      console.error('About save error:', err);
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 401 || status === 403) {
        setSaveError(language === 'hr' ? 'Sesija je istekla. Molimo prijavite se ponovo.' : 'Session expired. Please log in again.');
      } else if (detail) {
        setSaveError(detail);
      } else {
        setSaveError(t.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  /* resolve displayed value based on viewer language */
  const loc = (base: keyof AboutContent): string => {
    if (!content) return '';
    if (language === 'en') {
      const enKey = `${base}_en` as keyof AboutContent;
      return (content[enKey] as string) || (content[base] as string) || '';
    }
    return (content[base] as string) || '';
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        {heroImages.map((image, index) => (
          <div key={index} className="absolute inset-0 transition-opacity duration-[3000ms] ease-in-out"
            style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: currentImageIndex === index ? 1 : 0 }}>
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ))}
        <Navigation />
        <div className="relative flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  /* ---- editing mode: Croatian always visible, English toggleable ---- */
  if (isEditing && draft) {
    const hrWhyItems = (draft.why_items ?? '').split('|').filter(Boolean);
    const enWhyItems = (draft.why_items_en ?? '').split('|').filter(Boolean);

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
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto mt-16">

            {/* ── Sticky top bar ── */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 pt-6 pb-4 rounded-t-2xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-bold text-gray-800">
                  {language === 'hr' ? 'Uredi stranicu "O nama"' : 'Edit "About Us" page'}
                </h2>
                <div className="flex gap-3 shrink-0">
                  <button onClick={saveChanges} disabled={saving}
                    className="px-5 py-2 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-colors">
                    {saving ? t.saving : t.save}
                  </button>
                  <button onClick={cancelEditing} disabled={saving}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    {t.cancel}
                  </button>
                </div>
              </div>
              {saveError && <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded-lg">{saveError}</div>}
            </div>

            {/* ── Croatian section (always shown) ── */}
            <div className="px-8 pt-6 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🇭🇷</span>
                <h3 className="text-lg font-bold text-orange-700">{t.croatianSection}</h3>
              </div>

              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {language === 'hr' ? 'Naslov' : 'Title'}
              </label>
              <input
                className="text-3xl font-bold text-gray-800 border-b-2 border-orange-400 bg-transparent focus:outline-none w-full mb-4"
                placeholder="O nama"
                value={draft.title ?? ''}
                onChange={(e) => handleChange('title', e.target.value)}
              />

              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {language === 'hr' ? 'Uvod' : 'Introduction'}
              </label>
              <textarea
                className="w-full text-gray-700 text-sm mb-4 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                rows={3}
                placeholder="Napišite uvod..."
                value={draft.intro ?? ''}
                onChange={(e) => handleChange('intro', e.target.value)}
              />

              <div className="w-8 h-0.5 bg-orange-500 rounded my-4" />

              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {language === 'hr' ? 'Naslov misije' : 'Mission title'}
              </label>
              <input
                className="w-full text-lg font-bold text-gray-800 mb-2 border-b-2 border-orange-400 bg-transparent focus:outline-none"
                placeholder="Naša misija"
                value={draft.mission_title ?? ''}
                onChange={(e) => handleChange('mission_title', e.target.value)}
              />
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 mt-3">
                {language === 'hr' ? 'Tekst misije' : 'Mission text'}
              </label>
              <textarea
                className="w-full text-gray-700 text-sm mb-4 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                rows={2}
                placeholder="Opišite vašu misiju..."
                value={draft.mission_text ?? ''}
                onChange={(e) => handleChange('mission_text', e.target.value)}
              />

              <div className="w-8 h-0.5 bg-orange-500 rounded my-4" />

              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {language === 'hr' ? 'Naslov prednosti' : '"Why choose us" title'}
              </label>
              <input
                className="w-full text-lg font-bold text-gray-800 mb-3 border-b-2 border-orange-400 bg-transparent focus:outline-none"
                placeholder="Zašto odabrati nas?"
                value={draft.why_title ?? ''}
                onChange={(e) => handleChange('why_title', e.target.value)}
              />
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                {language === 'hr' ? 'Stavke prednosti' : 'Bullet points'}
              </label>
              <ul className="text-gray-700 space-y-2 mb-2 text-sm">
                {hrWhyItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold shrink-0">✓</span>
                    <input
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      value={item}
                      onChange={(e) => handleHRWhyItemsChange(index, e.target.value)}
                    />
                    <button onClick={() => removeHRWhyItem(index)} className="text-red-400 hover:text-red-600 font-bold text-lg shrink-0" title="Remove">✕</button>
                  </li>
                ))}
              </ul>
              <button onClick={addHRWhyItem} className="mb-4 px-3 py-1.5 text-xs border-2 border-dashed border-orange-400 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors">
                + {language === 'hr' ? 'Dodaj stavku' : 'Add item'}
              </button>

              <div className="w-8 h-0.5 bg-orange-500 rounded my-4" />

              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {language === 'hr' ? 'Naslov kontakta' : 'Contact section title'}
              </label>
              <input
                className="w-full text-lg font-bold text-gray-800 mb-2 border-b-2 border-orange-400 bg-transparent focus:outline-none"
                placeholder="Kontaktirajte nas"
                value={draft.contact_title ?? ''}
                onChange={(e) => handleChange('contact_title', e.target.value)}
              />
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 mt-3">
                {language === 'hr' ? 'Tekst kontakta' : 'Contact text'}
              </label>
              <textarea
                className="w-full text-gray-700 text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                rows={2}
                placeholder="Kontaktirajte nas danas..."
                value={draft.contact_text ?? ''}
                onChange={(e) => handleChange('contact_text', e.target.value)}
              />
            </div>

            {/* ── English section toggle button ── */}
            <div className="px-8 pb-4 flex gap-4 justify-end border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setShowEnglish(!showEnglish)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  showEnglish
                    ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {showEnglish ? t.removeEnglish : t.addEnglish}
              </button>
            </div>

            {/* ── English section (shown when toggled) ── */}
            {showEnglish && (
              <div className="px-8 pb-8 border-t-2 border-blue-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🇬🇧</span>
                  <h3 className="text-lg font-bold text-blue-700">{t.englishSection}</h3>
                </div>

                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Title</label>
                <input
                  className="text-3xl font-bold text-gray-800 border-b-2 border-blue-400 bg-transparent focus:outline-none w-full mb-4"
                  placeholder="About Us"
                  value={draft.title_en ?? ''}
                  onChange={(e) => handleChange('title_en', e.target.value)}
                />

                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Introduction</label>
                <textarea
                  className="w-full text-gray-700 text-sm mb-4 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={3}
                  placeholder="Write an introduction..."
                  value={draft.intro_en ?? ''}
                  onChange={(e) => handleChange('intro_en', e.target.value)}
                />

                <div className="w-8 h-0.5 bg-blue-500 rounded my-4" />

                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Mission title</label>
                <input
                  className="w-full text-lg font-bold text-gray-800 mb-2 border-b-2 border-blue-400 bg-transparent focus:outline-none"
                  placeholder="Our Mission"
                  value={draft.mission_title_en ?? ''}
                  onChange={(e) => handleChange('mission_title_en', e.target.value)}
                />
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 mt-3">Mission text</label>
                <textarea
                  className="w-full text-gray-700 text-sm mb-4 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={2}
                  placeholder="Describe your mission..."
                  value={draft.mission_text_en ?? ''}
                  onChange={(e) => handleChange('mission_text_en', e.target.value)}
                />

                <div className="w-8 h-0.5 bg-blue-500 rounded my-4" />

                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">"Why choose us" title</label>
                <input
                  className="w-full text-lg font-bold text-gray-800 mb-3 border-b-2 border-blue-400 bg-transparent focus:outline-none"
                  placeholder="Why Choose Us?"
                  value={draft.why_title_en ?? ''}
                  onChange={(e) => handleChange('why_title_en', e.target.value)}
                />
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Bullet points</label>
                <ul className="text-gray-700 space-y-2 mb-2 text-sm">
                  {enWhyItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-blue-500 font-bold shrink-0">✓</span>
                      <input
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={item}
                        onChange={(e) => handleENWhyItemsChange(index, e.target.value)}
                      />
                      <button onClick={() => removeENWhyItem(index)} className="text-red-400 hover:text-red-600 font-bold text-lg shrink-0" title="Remove">✕</button>
                    </li>
                  ))}
                </ul>
                <button onClick={addENWhyItem} className="mb-4 px-3 py-1.5 text-xs border-2 border-dashed border-blue-400 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                  + Add item
                </button>

                <div className="w-8 h-0.5 bg-blue-500 rounded my-4" />

                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Contact section title</label>
                <input
                  className="w-full text-lg font-bold text-gray-800 mb-2 border-b-2 border-blue-400 bg-transparent focus:outline-none"
                  placeholder="Contact Us"
                  value={draft.contact_title_en ?? ''}
                  onChange={(e) => handleChange('contact_title_en', e.target.value)}
                />
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 mt-3">Contact text</label>
                <textarea
                  className="w-full text-gray-700 text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={2}
                  placeholder="Contact us today..."
                  value={draft.contact_text_en ?? ''}
                  onChange={(e) => handleChange('contact_text_en', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---- display mode ---- */
  const whyItems = (language === 'en' ? (content.why_items_en || content.why_items) : content.why_items).split('|').filter(Boolean);

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

          <h1 className="sr-only">O nama | Padria agencija za nekretnine Zadar</h1>
          <div className="flex items-center justify-between mb-4">
            <p className="text-4xl font-bold text-gray-800">{loc('title')}</p>
            {isAdmin && (
              <button onClick={startEditing} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                ✏️ {t.edit}
              </button>
            )}
          </div>

          <p className="text-gray-700 text-sm mb-2">{loc('intro')}</p>
          <div className="w-8 h-0.5 bg-orange-500 rounded my-2" />

          <h2 className="text-lg font-bold text-gray-800 mb-2">{loc('mission_title')}</h2>
          <p className="text-gray-700 text-sm mb-2">{loc('mission_text')}</p>
          <div className="w-8 h-0.5 bg-orange-500 rounded my-2" />

          <h2 className="text-lg font-bold text-gray-800 mb-2">{loc('why_title')}</h2>
          <ul className="text-gray-700 space-y-1 mb-2 text-sm">
            {whyItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-orange-500 font-bold shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="w-8 h-0.5 bg-orange-500 rounded my-2" />

          <h2 className="text-lg font-bold text-gray-800 mb-2">{loc('contact_title')}</h2>
          <p className="text-gray-700 text-sm">
            {loc('contact_text')}{' '}
            <Link href={language === 'en' ? '/en/contact' : '/contact'} className="text-orange-500 hover:text-orange-600 font-semibold">
              {language === 'en' ? 'Contact us' : 'Kontaktirajte nas'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
