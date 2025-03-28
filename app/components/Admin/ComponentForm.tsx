'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type ComponentCategory = 'CPU' | 'GPU' | 'RAM' | 'SSD' | 'PSU' | 'Case' | 'CPU Cooling';

interface ComponentFormData {
  name: string;
  manufacturer: string;
  category: ComponentCategory;
  price: string;
  productCode: string;
  specifications: Record<string, string>;
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
    productCode: '',
    specifications: {} as Record<string, string>,
    availabilityStatus: 'pieejams'
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  const specFields: Record<ComponentCategory, Array<{name: string; label: string; type: string; placeholder: string}>> = {
    CPU: [
      { name: 'cores', label: t('specs.cpu.cores'), type: 'number', placeholder: '8' },
      { name: 'threads', label: t('specs.cpu.threads'), type: 'number', placeholder: '16' },
      { name: 'frequency', label: t('specs.cpu.frequency'), type: 'text', placeholder: '3.6 GHz' },
      { name: 'boostFrequency', label: t('specs.cpu.boostFrequency'), type: 'text', placeholder: '5.0 GHz' },
      { name: 'socket', label: t('specs.cpu.socket'), type: 'text', placeholder: 'AM5' },
      { name: 'tdp', label: t('specs.cpu.tdp'), type: 'text', placeholder: '105W' },
      { name: 'cache', label: t('specs.cpu.cache'), type: 'text', placeholder: '32MB L3' },
    ],
    GPU: [
      { name: 'vram', label: t('specs.gpu.vram'), type: 'text', placeholder: '12GB GDDR6X' },
      { name: 'coreClock', label: t('specs.gpu.coreClock'), type: 'text', placeholder: '1.8 GHz' },
      { name: 'boostClock', label: t('specs.gpu.boostClock'), type: 'text', placeholder: '2.5 GHz' },
      { name: 'tdp', label: t('specs.gpu.tdp'), type: 'text', placeholder: '320W' },
      { name: 'ports', label: t('specs.gpu.ports'), type: 'text', placeholder: '3x DisplayPort 1.4, 1x HDMI 2.1' },
      { name: 'length', label: t('specs.gpu.length'), type: 'text', placeholder: '285mm' },
    ],
    RAM: [
      { name: 'capacity', label: t('specs.ram.capacity'), type: 'text', placeholder: '32GB (2x16GB)' },
      { name: 'type', label: t('specs.ram.type'), type: 'text', placeholder: 'DDR5' },
      { name: 'speed', label: t('specs.ram.speed'), type: 'text', placeholder: '6000MHz' },
      { name: 'latency', label: t('specs.ram.latency'), type: 'text', placeholder: 'CL36' },
      { name: 'voltage', label: t('specs.ram.voltage'), type: 'text', placeholder: '1.35V' },
    ],
    SSD: [
      { name: 'capacity', label: t('specs.storage.capacity'), type: 'text', placeholder: '1TB' },
      { name: 'interface', label: t('specs.storage.interface'), type: 'text', placeholder: 'PCIe 4.0 x4' },
      { name: 'readSpeed', label: t('specs.storage.readSpeed'), type: 'text', placeholder: '7000 MB/s' },
      { name: 'writeSpeed', label: t('specs.storage.writeSpeed'), type: 'text', placeholder: '5300 MB/s' },
      { name: 'formFactor', label: t('specs.storage.formFactor'), type: 'text', placeholder: 'M.2 2280' },
    ],
    PSU: [
      { name: 'wattage', label: t('specs.psu.wattage'), type: 'text', placeholder: '850W' },
      { name: 'efficiency', label: t('specs.psu.efficiency'), type: 'text', placeholder: '80+ Gold' },
      { name: 'modular', label: t('specs.psu.modular'), type: 'text', placeholder: 'Fully Modular' },
      { name: 'formFactor', label: t('specs.psu.formFactor'), type: 'text', placeholder: 'ATX' },
    ],
    Case: [
      { name: 'formFactor', label: t('specs.case.formFactor'), type: 'text', placeholder: 'Mid Tower' },
      { name: 'motherboardSupport', label: t('specs.case.motherboardSupport'), type: 'text', placeholder: 'ATX, mATX, ITX' },
      { name: 'dimensions', label: t('specs.case.dimensions'), type: 'text', placeholder: '450 x 210 x 480 mm' },
      { name: 'maxGpuLength', label: t('specs.case.maxGpuLength'), type: 'text', placeholder: '360mm' },
      { name: 'maxCpuCoolerHeight', label: t('specs.case.maxCpuCoolerHeight'), type: 'text', placeholder: '170mm' },
      { name: 'includedFans', label: t('specs.case.includedFans'), type: 'text', placeholder: '3x 120mm RGB' },
    ],
    'CPU Cooling': [
      { name: 'type', label: t('specs.cooling.type'), type: 'text', placeholder: 'Air / AIO Liquid' },
      { name: 'size', label: t('specs.cooling.size'), type: 'text', placeholder: '240mm Radiator / 160mm Height' },
      { name: 'fanSize', label: t('specs.cooling.fanSize'), type: 'text', placeholder: '2x 120mm' },
      { name: 'noise', label: t('specs.cooling.noise'), type: 'text', placeholder: '15-30 dB' },
      { name: 'socketSupport', label: t('specs.cooling.socketSupport'), type: 'text', placeholder: 'AM4, AM5, LGA1700' },
    ],
  };

  useEffect(() => {
    if (isEditMode && componentId) {
      fetchComponentData();
    }
  }, [isEditMode, componentId]);

  useEffect(() => {
    const defaultSpecs: Record<string, string> = {};
    specFields[formData.category].forEach(field => {
      if (!formData.specifications[field.name]) {
        defaultSpecs[field.name] = '';
      }
    });
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, ...defaultSpecs }
    }));
  }, [formData.category]);

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
      
      let parsedSpecs: Record<string, string> = {};
      try {
        parsedSpecs = JSON.parse(data.specifications);
      } catch (e) {
        const specLines = data.specifications.split('\n');
        let productCode = '';
        
        for (const line of specLines) {
          if (line.toLowerCase().includes('product code') || line.toLowerCase().includes('preces kods')) {
            const parts = line.split(':');
            if (parts.length > 1) {
              productCode = parts[1].trim();
            }
            break;
          }
        }
        
        const category = data.category as ComponentCategory;
        specFields[category].forEach(field => {
          parsedSpecs[field.name] = '';
        });
      }
      
      setFormData({
        name: data.name,
        manufacturer: data.manufacturer,
        category: data.category as ComponentCategory,
        price: String(data.price),
        productCode: data.productCode || '',
        specifications: parsedSpecs,
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
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        [name]: value as ComponentCategory
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value
      }
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
      
      const specificationsString = JSON.stringify(formData.specifications);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          specifications: specificationsString,
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
              <label htmlFor="productCode" className="block text-sm font-medium text-gray-300 mb-1">
                {t('productCode')}
              </label>
              <input
                id="productCode"
                name="productCode"
                type="text"
                value={formData.productCode}
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
          </div>
          
          {/* Dynamic specifications based on component category */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-3">{t('specifications')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specFields[formData.category] && specFields[formData.category].map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={formData.specifications[field.name] || ''}
                    onChange={handleSpecChange}
                    placeholder={field.placeholder}
                    className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                  />
                </div>
              ))}
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