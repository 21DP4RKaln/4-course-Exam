'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import ComponentSidebar from './ComponentSidebar';
import ComponentList from './ComponentList';
import ConfigurationForm from './ConfigurationForm';
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
  const locale = params.locale as string || 'en';
  const configId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [components, setComponents] = useState<Component[]>([]);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('CPU');
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component>>({});
  const [configName, setConfigName] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
    component.category === selectedCategory
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

  const handleSaveConfig = async () => {
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
      setError(typeof error === 'string' ? error : t('errors.saveFailed'));
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
    <div className="flex min-h-screen bg-[#1A1A1A]">
      {/* Left sidebar */}
      <ComponentSidebar 
        selectedCategory={selectedCategory} 
        onCategorySelect={setSelectedCategory} 
      />
      
      {/* Main content */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">{t('editConfig')}</h1>
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="text-gray-300 hover:text-white"
          >
            ← {t('backToDashboard')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Component selection area (middle section) */}
          <div className="md:col-span-8 space-y-6">
            <ComponentList 
              components={filteredComponents}
              category={selectedCategory}
              selectedComponents={selectedComponents}
              addComponent={addComponent}
            />
            
            <ConfigurationForm
              configName={configName}
              setConfigName={setConfigName}
              handleSaveConfig={handleSaveConfig}
              savingConfig={savingConfig}
              isAuthenticated={true}  
            />
          </div>
          
          {/* Right sidebar */}
          <div className="md:col-span-4">
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