'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import ComponentSelector from './ComponentSelector';
import ComponentFilter from './ComponentFilter';
import SelectedComponents from './SelectedComponents';
import ConfigurationSummary from './ConfigurationSummary';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

interface Component {
  id: string;
  category: string;
  name: string;
  manufacturer: string;
  price: number;
  specs: Record<string, any>;
  stock: number;
}

interface Configuration {
  id: string;
  name: string;
  totalPrice: number;
  status: string;
  components: Component[];
}

export default function ConfigurationEditor() {
  const t = useTranslations('configurator');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'lv';
  const configId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [components, setComponents] = useState<Component[]>([]);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('CPU');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component>>({});
  const [configName, setConfigName] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Categories that will be shown in the left sidebar
  const categories = [
    { key: 'CPU', label: t('categories.cpu') },
    { key: 'GPU', label: t('categories.gpu') },
    { key: 'RAM', label: t('categories.ram') },
    { key: 'SSD', label: t('categories.storage') },
    { key: 'PSU', label: t('categories.psu') },
    { key: 'Case', label: t('categories.case') },
    { key: 'CPU Cooling', label: t('categories.cooling') }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const configResponse = await fetch(`/api/configurations/${configId}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!configResponse.ok) {
          if (configResponse.status === 401) {
            router.push(`/${locale}/login`);
            return;
          } else if (configResponse.status === 404) {
            throw new Error(t('errors.configNotFound'));
          } else {
            throw new Error(t('errors.fetchConfigFailed'));
          }
        }
        
        const configData = await configResponse.json();
        setConfiguration(configData);
        setConfigName(configData.name);
        
        const componentsRecord: Record<string, Component> = {};
        configData.components.forEach((component: Component) => {
          componentsRecord[component.category] = component;
        });
        
        setSelectedComponents(componentsRecord);
        
        const componentsResponse = await fetch('/api/components', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!componentsResponse.ok) {
          throw new Error(t('errors.fetchComponentsFailed'));
        }
        
        const componentsData = await componentsResponse.json();
        setComponents(componentsData);
        
        if (componentsData.length > 0) {
          const prices = componentsData.map((comp: Component) => comp.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(typeof error === 'string' ? error : t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [configId, router, locale, t]);

  const filteredComponents = components.filter(component => 
    component.category === selectedCategory &&
    component.price >= priceRange[0] &&
    component.price <= priceRange[1] &&
    (searchTerm === '' ||
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addComponent = (component: Component) => {
    setSelectedComponents(prev => ({
      ...prev,
      [component.category]: component
    }));
  };

  const removeComponent = (category: string) => {
    setSelectedComponents(prev => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const calculateTotalPrice = () => {
    return Object.values(selectedComponents).reduce((sum, component) => sum + component.price, 0);
  };

  const saveConfiguration = async () => {
    if (Object.values(selectedComponents).length === 0) {
      alert(t('errors.noComponents'));
      return;
    }

    if (!configName.trim()) {
      alert(t('errors.noName'));
      return;
    }

    try {
      setSavingConfig(true);
      
      const response = await fetch(`/api/configurations/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: configName,
          components: Object.values(selectedComponents).map(comp => ({ id: comp.id })),
          status: 'updated'
        })
      });

      if (!response.ok) {
        throw new Error(t('errors.saveFailed'));
      }

      setShowConfirmation(true);

      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 2000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(typeof error === 'string' ? error : t('errors.saveFailed'));
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="bg-[#1A1A1A] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">{t('editConfig')}</h1>
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="text-gray-300 hover:text-white"
          >
            ← {t('backToDashboard')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left sidebar - Component filters */}
          <div className="md:col-span-3">
            <ComponentFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
          
          {/* Main content - Component selection and configuration */}
          <div className="md:col-span-6 space-y-6">
            <ComponentSelector 
              components={filteredComponents}
              category={selectedCategory}
              selectedComponents={selectedComponents}
              addComponent={addComponent}
            />
            
            <div className="bg-[#2A2A2A] rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t('configName')}
              </label>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder={t('configNamePlaceholder')}
                className="w-full bg-gray-800 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946] border border-gray-700"
              />
            </div>
            
            <button
              onClick={saveConfiguration}
              disabled={savingConfig}
              className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white rounded-lg py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingConfig ? t('actions.saving') : t('actions.saveChanges')}
            </button>
          </div>
          
          {/* Right sidebar - Selected components summary */}
          <div className="md:col-span-3">
            <SelectedComponents 
              selectedComponents={selectedComponents}
              removeComponent={removeComponent}
            />
            
            <ConfigurationSummary 
              totalPrice={calculateTotalPrice()}
            />
          </div>
        </div>
      </div>
      
      {/* Confirmation modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2A2A2A] rounded-lg p-6 max-w-md w-full text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">{t('configUpdated')}</h2>
            <p className="text-gray-400">{t('redirecting')}</p>
          </div>
        </div>
      )}
    </div>
  );
}