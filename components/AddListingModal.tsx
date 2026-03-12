'use client';

import { useState, useEffect } from 'react';
import apiClient, { backendRoot } from '@/utils/apiClient';
import { Listing, ListingImage } from '@/types';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  listingId?: string;
  initialData?: Partial<Listing>;
  existingImages?: ListingImage[];
}

export default function AddListingModal({ isOpen, onClose, onSuccess, listingId, initialData, existingImages = [] }: AddListingModalProps) {
  const isEditMode = !!listingId;
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip_code: initialData?.zip_code || '',
    location: initialData?.location || '',
    bedrooms: initialData?.bedrooms?.toString() || '',
    bathrooms: initialData?.bathrooms?.toString() || '',
    size_sqft: initialData?.size_sqft?.toString() || '',
    property_type: initialData?.property_type || 'house',
    listing_type: initialData?.listing_type || 'sale',
    featured: initialData?.featured || false,
  });

  const [showEnglish, setShowEnglish] = useState(false);
  const [englishData, setEnglishData] = useState({
    title_en: initialData?.title_en || '',
    description_en: initialData?.description_en || '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImagesToKeep, setExistingImagesToKeep] = useState<string[]>(
    existingImages.map(img => img.id)
  );

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zip_code: initialData.zip_code || '',
        location: initialData.location || '',
        bedrooms: initialData.bedrooms?.toString() || '',
        bathrooms: initialData.bathrooms?.toString() || '',
        size_sqft: initialData.size_sqft?.toString() || '',
        property_type: initialData.property_type || 'house',
        listing_type: initialData.listing_type || 'sale',
        featured: initialData.featured || false,
      });
      setExistingImagesToKeep(existingImages.map(img => img.id));
      setEnglishData({
        title_en: initialData.title_en || '',
        description_en: initialData.description_en || '',
      });
      setShowEnglish(!!(initialData.title_en || initialData.description_en));
    }
  }, [isEditMode, initialData, existingImages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEnglishInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEnglishData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages([...images, ...files]);
    
    // Create previews for new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setExistingImagesToKeep(existingImagesToKeep.filter(id => id !== imageId));
  };

  const handleRemoveNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.price) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create listing payload
      const listingPayload = {
        title: formData.title,
        description: formData.description,
        title_en: showEnglish && englishData.title_en ? englishData.title_en : null,
        description_en: showEnglish && englishData.description_en ? englishData.description_en : null,
        price: parseFloat(formData.price),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        location: formData.location || `${formData.city}, ${formData.state}`,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        size_sqft: parseInt(formData.size_sqft) || 0,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        featured: formData.featured,
      };

      let finalListingId = listingId;

      if (isEditMode) {
        // Update existing listing
        await apiClient.put(`/listings/${listingId}`, listingPayload);
      } else {
        // Create new listing
        const response = await apiClient.post('/listings', listingPayload);
        finalListingId = response.data.id;
      }

      // Upload new images if any
      if (images.length > 0) {
        const formDataImg = new FormData();
        images.forEach((image) => {
          formDataImg.append('files', image);
        });
        
        await apiClient.post(`/listings/${finalListingId}/images`, formDataImg, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Delete removed images (for edit mode)
      if (isEditMode) {
        const imagesToDelete = existingImages.filter(img => !existingImagesToKeep.includes(img.id));
        for (const image of imagesToDelete) {
          await apiClient.delete(`/listings/${listingId}/images/${image.id}`);
        }
      }

      // Success
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error('Error saving listing:', err);
      setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} listing. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      size_sqft: '',
      property_type: 'house',
      listing_type: 'sale',
      featured: false,
    });
    setImages([]);
    setImagePreviews([]);
    setError('');
    if (!isEditMode) {
      setExistingImagesToKeep([]);
    }
    setShowEnglish(false);
    setEnglishData({ title_en: '', description_en: '' });
  };

  const getFullImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${backendRoot}${imageUrl}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Listing' : 'Add New Listing'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Beautiful Family Home"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe the property..."
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="250000"
              />
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <select
                name="listing_type"
                value={formData.listing_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="123 Main St"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Zagreb"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">State/Region</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Grad Zagreb"
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Zip Code</label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="10000"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="3"
              />
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="2"
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Size (sqft)</label>
              <input
                type="number"
                name="size_sqft"
                value={formData.size_sqft}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="2000"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label className="ml-2 text-gray-700 font-semibold">
                Featured Listing
              </label>
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              
              {/* Existing Images (Edit Mode) */}
              {isEditMode && existingImages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-gray-700 font-semibold mb-3">Current Images</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {existingImages.map((image) => (
                      existingImagesToKeep.includes(image.id) && (
                        <div key={image.id} className="relative group">
                          <img
                            src={getFullImageUrl(image.image_url)}
                            alt="Listing"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(image.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-gray-700 font-semibold mb-3">
                    {isEditMode ? 'New Images' : 'Preview'}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
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
              disabled={loading}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Listing' : 'Create Listing')}
            </button>
          </div>

          {/* English Version Form */}
          {showEnglish && (
            <div className="mt-8 border-t-2 border-blue-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🇬🇧</span>
                <h3 className="text-lg font-bold text-blue-700">English Version (optional)</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Title (English)</label>
                  <input
                    type="text"
                    name="title_en"
                    value={englishData.title_en}
                    onChange={handleEnglishInputChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="English title..."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Description (English)</label>
                  <textarea
                    name="description_en"
                    value={englishData.description_en}
                    onChange={handleEnglishInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="English description..."
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
