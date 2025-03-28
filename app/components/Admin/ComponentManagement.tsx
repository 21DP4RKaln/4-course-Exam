'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Component {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  price: number;
  productCode?: string;
  specifications: string;
  availabilityStatus: string;
}

type CategoryType = string;

export default function ComponentManagement() {
  const t = useTranslations('components');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [showSpecsModal, setShowSpecsModal] = useState(false);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/components', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push(`/${locale}/login`);
          return;
        }
        throw new Error(t('errors.fetchFailed'));
      }
      
      const data = await response.json();
      setComponents(data);
    } catch (error) {
      console.error('Components fetch error:', error);
      setError(t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      try {
        setDeleteLoading(id);
        const response = await fetch(`/api/admin/components/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(t('errors.deleteFailed'));
        }
        
        setComponents(prev => prev.filter(component => component.id !== id));
      } catch (error) {
        console.error('Component deletion error:', error);
        alert(t('errors.deleteFailed'));
      } finally {
        setDeleteLoading(null);
      }
    }
  };
  
  const handleViewSpecs = (component: Component) => {
    setSelectedComponent(component);
    setShowSpecsModal(true);
  };

  const filteredComponents = components.filter(component => {
    const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
    const matchesSearch = 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (component.productCode && component.productCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      component.specifications.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: 'all', label: t('allCategories') },
    { value: 'CPU', label: t('categories.cpu') },
    { value: 'GPU', label: t('categories.gpu') },
    { value: 'RAM', label: t('categories.ram') },
    { value: 'SSD', label: t('categories.storage') },
    { value: 'PSU', label: t('categories.psu') },
    { value: 'Case', label: t('categories.case') },
    { value: 'CPU Cooling', label: t('categories.cooling') }
  ];
  
  const formatSpecifications = (specifications: string) => {
    try {
      const specsObj = JSON.parse(specifications) as Record<string, string>;
      return (
        <div className="space-y-1">
          {Object.entries(specsObj).map(([key, value]) => (
            value ? (
              <div key={key} className="text-xs">
                <span className="text-gray-500">{getSpecLabel(key, selectedComponent?.category || '')}: </span>
                <span className="text-white">{value}</span>
              </div>
            ) : null
          ))}
        </div>
      );
    } catch (e) {
      return <p className="text-xs text-gray-300">{specifications}</p>;
    }
  };

  const getSpecLabel = (key: string, category: string): string => {
    const lowercaseCategory = category.toLowerCase().replace(/\s+/g, '');
    try {
      const translationKey = `specs.${lowercaseCategory}.${key}`;
      if (t.raw(translationKey)) {
        return t(translationKey);
      }
    } catch (e) {
    }
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <Link
          href={`/${locale}/admin-dashboard`}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          {t('back')}
        </Link>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-800 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 text-white rounded-md pl-10 pr-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        
        <Link
          href={`/${locale}/manage-components/new`}
          className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
        >
          {t('addComponent')}
        </Link>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg overflow-x-auto">
        {filteredComponents.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('manufacturer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('productCode')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('price')} (€)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('availability')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('specifications')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1E1E1E] divide-y divide-gray-700">
              {filteredComponents.map((component) => (
                <tr key={component.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{component.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{component.manufacturer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{t(`categories.${component.category.toLowerCase().replace(/\s+/g, '')}`)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{component.productCode || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white font-medium">{Number(component.price).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      component.availabilityStatus === 'pieejams'
                        ? 'bg-green-100 text-green-800'
                        : component.availabilityStatus === 'pasūtāms'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {t(`statuses.${component.availabilityStatus === 'pieejams' ? 'available' : 
                                       component.availabilityStatus === 'pasūtāms' ? 'orderable' : 'unavailable'}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleViewSpecs(component)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {t('specifications')}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/${locale}/manage-components/${component.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {t('edit')}
                      </Link>
                      <button
                        onClick={() => handleDeleteComponent(component.id)}
                        disabled={deleteLoading === component.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {deleteLoading === component.id ? t('deleting') : t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">{t('noComponents')}</p>
            <Link 
              href={`/${locale}/manage-components/new`}
              className="inline-block mt-4 text-[#E63946] hover:text-[#FF4D5A]"
            >
              {t('addComponent')}
            </Link>
          </div>
        )}
      </div>
      
      {/* Specifications Modal */}
      {showSpecsModal && selectedComponent && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowSpecsModal(false)}
        >
          <div 
            className="bg-[#2A2A2A] rounded-lg p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                {selectedComponent.name} - {t('specifications')}
              </h3>
              <button 
                onClick={() => setShowSpecsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              {selectedComponent.productCode && (
                <div className="mb-2 pb-2 border-b border-gray-700">
                  <span className="text-gray-400">{t('productCode')}: </span>
                  <span className="text-white">{selectedComponent.productCode}</span>
                </div>
              )}
              
              {formatSpecifications(selectedComponent.specifications)}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSpecsModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}