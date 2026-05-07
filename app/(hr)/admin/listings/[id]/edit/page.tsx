'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Listing, ListingImage } from '@/types';
import apiClient from '@/utils/apiClient';

export default function AdminListingEditPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const isNew = listingId === 'new';

  const [formData, setFormData] = useState<Partial<Listing>>({
    title: '',
    description: '',
    price: 0,
    location: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    bedrooms: 1,
    bathrooms: 1,
    size_sqft: 0,
    property_type: 'house',
    featured: false,
  });

  const [showEnglish, setShowEnglish] = useState(false);
  const [englishData, setEnglishData] = useState({ title_en: '', description_en: '' });

  const [images, setImages] = useState<ListingImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchListing();
    }
  }, [isNew, listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/listings/${listingId}`);
      setFormData(response.data);
      setEnglishData({
        title_en: response.data.title_en || '',
        description_en: response.data.description_en || '',
      });
      setShowEnglish(!!(response.data.title_en || response.data.description_en));

      const imagesResponse = await apiClient.get(`/listings/${listingId}/images`);
      setImages(imagesResponse.data);
    } catch (err) {
      console.error('Error fetching listing:', err);
      alert('Failed to load listing');
      router.push('/admin/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: keyof Listing
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'price' || field === 'bedrooms' || field === 'bathrooms' || field === 'size_sqft'
        ? Number(value) 
        : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages([...newImages, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(images.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let listingIdResult = listingId;

      const payload = {
        ...formData,
        title_en: showEnglish && englishData.title_en ? englishData.title_en : null,
        description_en: showEnglish && englishData.description_en ? englishData.description_en : null,
      };

      if (isNew) {
        const response = await apiClient.post('/listings', payload);
        listingIdResult = response.data.id;
      } else {
        await apiClient.put(`/listings/${listingId}`, payload);
      }

      // Upload new images
      if (newImages.length > 0) {
        const formDataImages = new FormData();
        newImages.forEach((file) => {
          formDataImages.append('files', file);
        });
        await apiClient.post(`/listings/${listingIdResult}/images`, formDataImages, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Delete removed images
      for (const image of images.filter((img) => !img.id)) {
        await apiClient.delete(`/listings/${listingIdResult}/images/${image.id}`);
      }

      alert(isNew ? 'Listing created successfully!' : 'Listing updated successfully!');
      router.push('/admin/listings');
    } catch (err) {
      console.error('Error saving listing:', err);
      alert('Failed to save listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              {isNew ? 'Add New Listing' : 'Edit Listing'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isNew ? 'Create a new property listing' : 'Update property information'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange(e, 'title')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Beautiful 3BR House in Downtown"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Price *</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleChange(e, 'price')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="450000"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Description *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange(e, 'description')}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Detailed description of the property..."
                ></textarea>
              </div>

              {/* Address Information */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Address</h2>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Street Address *</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleChange(e, 'address')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleChange(e, 'city')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">State *</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleChange(e, 'state')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">ZIP Code *</label>
                <input
                  type="text"
                  value={formData.zip_code || ''}
                  onChange={(e) => handleChange(e, 'zip_code')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="10001"
                />
              </div>

              {/* Property Details */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Property Details</h2>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Property Type *</label>
                <select
                  value={formData.property_type || ''}
                  onChange={(e) => handleChange(e, 'property_type')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Bedrooms *</label>
                <input
                  type="number"
                  value={formData.bedrooms || ''}
                  onChange={(e) => handleChange(e, 'bedrooms')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Bathrooms *</label>
                <input
                  type="number"
                  value={formData.bathrooms || ''}
                  onChange={(e) => handleChange(e, 'bathrooms')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Square Feet *</label>
                <input
                  type="number"
                  value={formData.size_sqft || ''}
                  onChange={(e) => handleChange(e, 'size_sqft')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Featured */}
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="ml-3 text-gray-700 font-semibold">Featured Listing</span>
                </label>
              </div>

              {/* Image Upload */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Images</h2>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-sm text-gray-600 mt-2">You can select multiple image files</p>
              </div>

              {/* Current Images */}
              {images.length > 0 && (
                <div className="lg:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-4">Current Images</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.image_url}
                          alt={image.alt_text}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div className="lg:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-4">New Images Preview</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="lg:col-span-2 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowEnglish(!showEnglish)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    showEnglish
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {showEnglish ? '🇬🇧 English version ✓' : '🇬🇧 English version'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {submitting ? 'Saving...' : isNew ? 'Create Listing' : 'Update Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/listings')}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* English Version Form */}
              {showEnglish && (
                <div className="lg:col-span-2 border-t-2 border-blue-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🇬🇧</span>
                    <h3 className="text-lg font-bold text-blue-700">English Version (optional)</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Title (English)</label>
                      <input
                        type="text"
                        value={englishData.title_en}
                        onChange={(e) => setEnglishData(prev => ({ ...prev, title_en: e.target.value }))}
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="English title..."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Description (English)</label>
                      <textarea
                        value={englishData.description_en}
                        onChange={(e) => setEnglishData(prev => ({ ...prev, description_en: e.target.value }))}
                        rows={6}
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="English description..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
