'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import FeaturedListings from '@/components/FeaturedListings';
import { useLanguage } from '@/context/LanguageContext';
import Footer from '@/components/Footer';
import apiClient from '@/utils/apiClient';

interface AboutContentResponse {
  id: number;
  about_image_url?: string | null;
  home_story_title: string;
  home_story_text: string;
  home_story_title_en?: string | null;
  home_story_text_en?: string | null;
}

export default function Home() {
  const { language } = useLanguage();
  const [aboutData, setAboutData] = useState<AboutContentResponse | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyDraft, setStoryDraft] = useState({
    home_story_title: '',
    home_story_text: '',
    home_story_title_en: '',
    home_story_text_en: '',
  });
  const [storySaving, setStorySaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [adminActionError, setAdminActionError] = useState('');

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await apiClient.get<AboutContentResponse>('/about');
        setAboutData(response.data);
      } catch (error) {
        console.error('Failed to load About content:', error);
      }
    };

    const verifyAdmin = async () => {
      try {
        const res = await apiClient.get('/admin/me');
        setIsAdmin(res.data && res.data.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };

    fetchAboutData();
    verifyAdmin();
  }, []);

  const displayedTitle = language === 'en'
    ? (aboutData?.home_story_title_en || aboutData?.home_story_title || 'Our Story')
    : (aboutData?.home_story_title || 'Naša priča');

  const displayedText = language === 'en'
    ? (aboutData?.home_story_text_en || aboutData?.home_story_text || '')
    : (aboutData?.home_story_text || '');

  const displayedImage = aboutData?.about_image_url || '/images/meet_us.jfif';

  const startStoryEditing = () => {
    if (!aboutData) return;
    setStoryDraft({
      home_story_title: aboutData.home_story_title || '',
      home_story_text: aboutData.home_story_text || '',
      home_story_title_en: aboutData.home_story_title_en || '',
      home_story_text_en: aboutData.home_story_text_en || '',
    });
    setAdminActionError('');
    setIsEditingStory(true);
  };

  const cancelStoryEditing = () => {
    setIsEditingStory(false);
    setAdminActionError('');
  };

  const saveStoryChanges = async () => {
    setStorySaving(true);
    setAdminActionError('');
    try {
      const res = await apiClient.put('/about', {
        home_story_title: storyDraft.home_story_title,
        home_story_text: storyDraft.home_story_text,
        home_story_title_en: storyDraft.home_story_title_en || null,
        home_story_text_en: storyDraft.home_story_text_en || null,
      });
      setAboutData(res.data);
      setIsEditingStory(false);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setAdminActionError(detail || (language === 'hr' ? 'Greška pri spremanju.' : 'Failed to save changes.'));
    } finally {
      setStorySaving(false);
    }
  };

  const handleHomeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setAdminActionError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/about/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAboutData(res.data);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setAdminActionError(detail || (language === 'hr' ? 'Greška pri promjeni slike.' : 'Failed to change image.'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  return (
    <main className="bg-[#c4b8a3]">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Listings */}
      <FeaturedListings />

      {/* About Us Section */}
      <section className="py-24 bg-[#434b57] text-white mx-4 sm:mx-6 lg:mx-12 rounded-lg my-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[500px]">
            {/* Left - Image */}
            <div className="order-2 lg:order-1 h-[500px] flex items-center justify-center">
              {aboutData ? (
                <img
                  src={displayedImage}
                  alt="Agency Owners"
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== '/images/meet_us.jfif') {
                      target.src = '/images/meet_us.jfif';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}

              {isAdmin && (
                <div className="absolute mt-[430px] z-10">
                  <label className="inline-block cursor-pointer bg-white text-[#434b57] px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition-colors">
                    {uploadingImage
                      ? (language === 'hr' ? 'Učitavanje...' : 'Uploading...')
                      : (language === 'hr' ? 'Promijeni sliku' : 'Change image')}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHomeImageUpload}
                      disabled={uploadingImage || storySaving}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Right - Text */}
            <div className="order-1 lg:order-2 lg:pl-8">
              {!isEditingStory ? (
                <>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <h2 className="text-5xl font-bold">{displayedTitle}</h2>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={startStoryEditing}
                        className="bg-white text-[#434b57] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        {language === 'hr' ? 'Uredi tekst' : 'Edit text'}
                      </button>
                    )}
                  </div>

                  <p className="text-lg leading-relaxed mb-6 opacity-90">{displayedText}</p>
                </>
              ) : (
                <div className="bg-white/10 border border-white/25 rounded-lg p-4 mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">HR naslov</label>
                    <input
                      type="text"
                      value={storyDraft.home_story_title}
                      onChange={(e) => setStoryDraft((prev) => ({ ...prev, home_story_title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">HR tekst</label>
                    <textarea
                      rows={5}
                      value={storyDraft.home_story_text}
                      onChange={(e) => setStoryDraft((prev) => ({ ...prev, home_story_text: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">EN title</label>
                    <input
                      type="text"
                      value={storyDraft.home_story_title_en}
                      onChange={(e) => setStoryDraft((prev) => ({ ...prev, home_story_title_en: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">EN text</label>
                    <textarea
                      rows={5}
                      value={storyDraft.home_story_text_en}
                      onChange={(e) => setStoryDraft((prev) => ({ ...prev, home_story_text_en: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white text-gray-800"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={saveStoryChanges}
                      disabled={storySaving}
                      className="bg-white text-[#434b57] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      {storySaving ? (language === 'hr' ? 'Spremanje...' : 'Saving...') : (language === 'hr' ? 'Spremi' : 'Save')}
                    </button>
                    <button
                      type="button"
                      onClick={cancelStoryEditing}
                      disabled={storySaving}
                      className="border border-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10 disabled:opacity-50 transition-colors"
                    >
                      {language === 'hr' ? 'Odustani' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}

              {isAdmin && adminActionError && (
                <p className="text-sm text-red-200 mb-4">{adminActionError}</p>
              )}

              <p className="text-xl font-semibold mb-6">Pavica Knežević</p>
              <Link
                href="/public/about"
                className="inline-block text-lg font-semibold uppercase tracking-wide hover:text-orange-300 transition-colors flex items-center gap-2"
              >
                {language === 'hr' ? 'Više o nama' : 'Learn More'} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
