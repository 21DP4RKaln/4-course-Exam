'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ComponentFormData {
  name: string;
  manufacturer: string;
  category: string;
  price: string;
  specifications: string;
  availabilityStatus: string;
}

interface ComponentFormProps {
  componentId?: string;
  isEditMode?: boolean;
}

export default function ComponentForm({ componentId, isEditMode = false }: ComponentFormProps) {
  const t = useTranslations('components');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [formData, setFormData] = useState<ComponentFormData>({
    name: '',
    manufacturer: '',
    category: 'CPU',
    price: '',
    specifications: '',
    availabilityStatus: 'pieejams'
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && componentId) {
      fetchComponentData();
    }
  }, [isEditMode, componentId]);

  const fetchComponentData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/admin/components/${componentId}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(t('errors.fetchFailed'));
      }
      
      const data = await response.json();
      setFormData({
        name: data.name,
        manufacturer: data.manufacturer,
        category: data.category,
        price: String(data.price),
        specifications: data.specifications,
        availabilityStatus: data.availabilityStatus
      });
    } catch (error) {
      console.error('Component fetch error:', error);
      setError(t('errors.fetchFailed'));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const url = isEditMode 
        ? `/api/admin/components/${componentId}`
        : '/api/admin/components';
        
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });
      
      if (!response.ok) {
        throw new Error(isEditMode ? t('errors.updateFailed') : t('errors.createFailed'));
      }
      
      router.push(`/${locale}/manage-components`);
    } catch (error) {
      console.error(isEditMode ? 'Component update error:' : 'Component creation error:', error);
      setError(isEditMode ? t('errors.updateFailed') : t('errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'CPU', label: t('categories.cpu') },
    { value: 'GPU', label: t('categories.gpu') },
    { value: 'RAM', label: t('categories.ram') },
    { value: 'SSD', label: t('categories.storage') },
    { value: 'PSU', label: t('categories.psu') },
    { value: 'Case', label: t('categories.case') },
    { value: 'CPU Cooling', label: t('categories.cooling') }
  ];

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {isEditMode ? t('editComponent') : t('addComponent')}
        </h1>
        <Link
          href={`/${locale}/manage-components`}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          {t('back')}
        </Link>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                {t('name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
            </div>
            
            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-300 mb-1">
                {t('manufacturer')}
              </label>
              <input
                id="manufacturer"
                name="manufacturer"
                type="text"
                required
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                {t('category')}
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                {t('price')} (EUR)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
            </div>
            
            <div>
              <label htmlFor="availabilityStatus" className="block text-sm font-medium text-gray-300 mb-1">
                {t('availability')}
              </label>
              <select
                id="availabilityStatus"
                name="availabilityStatus"
                required
                value={formData.availabilityStatus}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              >
                <option value="pieejams">{t('statuses.available')}</option>
                <option value="nav pieejams">{t('statuses.unavailable')}</option>
                <option value="pasūtāms">{t('statuses.orderable')}</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="specifications" className="block text-sm font-medium text-gray-300 mb-1">
                {t('specifications')}
              </label>
              <textarea
                id="specifications"
                name="specifications"
                rows={6}
                required
                value={formData.specifications}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
              <p className="mt-1 text-sm text-gray-500">
                {t('specificationsHelper')}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}