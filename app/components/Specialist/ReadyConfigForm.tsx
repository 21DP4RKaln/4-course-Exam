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
  specifications: string;
  availabilityStatus: string;
}

interface ReadyConfigFormProps {
  configId?: string;
  isEditMode?: boolean;
}

export default function SpecialistReadyConfigForm({ configId, isEditMode = false }: ReadyConfigFormProps) {
  const t = useTranslations('readyConfigs');
  const configT = useTranslations('configurator');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [approvalNote, setApprovalNote] = useState(false);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch('/api/admin/components', {
          method: 'GET',
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(t('errors.fetchComponentsFailed'));
        }
        
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error('Components fetch error:', error);
        setError(t('errors.fetchComponentsFailed'));
      }
    };
    
    const fetchConfigData = async () => {
      if (isEditMode && configId) {
        try {
          const response = await fetch(`/api/specialist/ready-configs/${configId}`, {
            method: 'GET',
            cache: 'no-store'
          });
          
          if (!response.ok) {
            throw new Error(t('errors.fetchConfigFailed'));
          }
          
          const data = await response.json();
          setName(data.name);
          setDescription(data.description || '');
          setSelectedComponents(data.components.map((comp: { id: string }) => comp.id));
          setApprovalNote(data.status === 'approved');
        } catch (error) {
          console.error('Configuration fetch error:', error);
          setError(t('errors.fetchConfigFailed'));
        }
      }
    };
    
    Promise.all([fetchComponents(), fetchConfigData()])
      .finally(() => setInitialLoading(false));
  }, [isEditMode, configId, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert(t('errors.nameRequired'));
      return;
    }
    
    if (selectedComponents.length === 0) {
      alert(t('errors.componentsRequired'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const url = isEditMode 
        ? `/api/specialist/ready-configs/${configId}`
        : '/api/specialist/ready-configs';
        
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          components: selectedComponents
        })
      });
      
      if (!response.ok) {
        throw new Error(isEditMode ? t('errors.updateFailed') : t('errors.createFailed'));
      }
      
      router.push(`/${locale}/specialist/ready-configs`);
    } catch (error) {
      console.error(isEditMode ? 'Configuration update error:' : 'Configuration creation error:', error);
      setError(isEditMode ? t('errors.updateFailed') : t('errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const toggleComponentSelection = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const calculateTotalPrice = () => {
    return components
      .filter(component => selectedComponents.includes(component.id))
      .reduce((sum, component) => sum + parseFloat(component.price.toString()), 0);
  };

  const filteredComponents = components.filter(component => {
    const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
    const matchesSearch = 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: 'all', label: t('allCategories') },
    { value: 'CPU', label: configT('categories.cpu') },
    { value: 'GPU', label: configT('categories.gpu') },
    { value: 'RAM', label: configT('categories.ram') },
    { value: 'SSD', label: configT('categories.storage') },
    { value: 'PSU', label: configT('categories.psu') },
    { value: 'Case', label: configT('categories.case') },
    { value: 'CPU Cooling', label: configT('categories.cooling') }
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
          {isEditMode ? t('editConfig') : t('createConfig')}
        </h1>
        <Link
          href={`/${locale}/specialist/ready-configs`}
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
      
      {approvalNote && (
        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          {t('approvalNote')}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  {t('name')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  {t('description')}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('saving') : t('save')}
                </button>
              </div>
            </div>
          </form>
          
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('selectComponents')}</h2>
            
            <div className="mb-6 flex flex-col md:flex-row gap-4">
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
              
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
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
            
            <div className="divide-y divide-gray-700">
              {filteredComponents.length > 0 ? (
                filteredComponents.map((component) => (
                  <div 
                    key={component.id} 
                    className={`py-4 px-2 transition-colors ${
                      selectedComponents.includes(component.id) ? 'bg-[#212121]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-medium">{component.name}</h3>
                        <p className="text-sm text-gray-400">
                          {component.manufacturer} | {configT(`categories.${component.category.toLowerCase().replace(/\s+/g, '')}`)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-medium">€{parseFloat(component.price.toString()).toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => toggleComponentSelection(component.id)}
                          className={`px-3 py-1 rounded-md ${
                            selectedComponents.includes(component.id)
                              ? 'bg-green-700 text-white hover:bg-green-800'
                              : 'bg-gray-700 text-white hover:bg-gray-600'
                          }`}
                        >
                          {selectedComponents.includes(component.id) ? t('selected') : t('select')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-400">{t('noComponentsFound')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('summary')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">{t('selectedComponents')}</h3>
                {selectedComponents.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {components
                      .filter(component => selectedComponents.includes(component.id))
                      .map(component => (
                        <div 
                          key={component.id} 
                          className="flex justify-between items-center bg-[#1E1E1E] p-2 rounded"
                        >
                          <span className="text-sm text-white">{component.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">€{parseFloat(component.price.toString()).toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => toggleComponentSelection(component.id)}
                              className="text-red-400 hover:text-red-300"
                              aria-label={t('remove')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">{t('noComponentsSelected')}</p>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-white font-medium">{t('totalPrice')}</span>
                  <span className="text-xl text-[#E63946] font-bold">€{calculateTotalPrice().toFixed(2)}</span>
                </div>
                
                <p className="mt-2 text-sm text-gray-400">
                  {t('componentsSelected')}: {selectedComponents.length}
                </p>
                
                <div className="mt-4 p-3 bg-[#1E1E1E] rounded-lg">
                  <p className="text-sm text-yellow-400">
                    {t('specialistNote')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}