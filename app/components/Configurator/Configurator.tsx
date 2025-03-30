'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
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

export default function Configurator() {
  const t = useTranslations('configurator');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  const { addItem } = useCart();
  
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('CPU');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component>>({});
  const [configName, setConfigName] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/components');
        
        if (!response.ok) {
          throw new Error(t('errors.fetchFailed'));
        }
        
        const data = await response.json();
        setComponents(data);
        
        if (data.length > 0) {
          const prices = data.map((comp: Component) => comp.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (error) {
        console.error('Error fetching components:', error);
        setError(typeof error === 'string' ? error : t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [t]);

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

  const handleSaveConfiguration = async () => {
    if (Object.values(selectedComponents).length === 0) {
      alert(t('errors.noComponents'));
      return;
    }

    if (!configName.trim()) {
      alert(t('errors.noName'));
      return;
    }

    if (!isAuthenticated) {
      if (confirm(t('authNeededForSave'))) {
        router.push(`/${locale}/login?redirect=configurator`);
        return;
      }
      return;
    }

    try {
      setSavingConfig(true);
      
      const response = await fetch('/api/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: configName,
          components: Object.values(selectedComponents).map(comp => ({ id: comp.id })),
          status: 'draft'
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
  
  const handleAddToCart = () => {
    if (Object.values(selectedComponents).length === 0) {
      alert(t('errors.noComponents'));
      return;
    }

    if (!configName.trim()) {
      alert(t('errors.noName'));
      return;
    }
    
    addItem({
      id: `custom-${Date.now()}`, 
      name: configName,
      price: calculateTotalPrice(),
      type: 'custom'
    });
    
    alert(t('addedToCart'));
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
        <h1 className="text-3xl font-bold text-white mb-8">{t('title')}</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Component selection and configuration */}
          <div className="md:w-2/3 space-y-6">
            <div className="bg-[#2A2A2A] rounded-lg p-4 mb-4">
              {/* Simple search and price filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">{priceRange[0]}€</span>
                  <input 
                    type="range" 
                    min="0" 
                    max={priceRange[1]} 
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <input 
                    type="range" 
                    min={priceRange[0]}
                    max="3000" 
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-400 text-sm">{priceRange[1]}€</span>
                </div>
              </div>
            </div>
            
            <ComponentList 
              components={filteredComponents}
              category={selectedCategory}
              selectedComponents={selectedComponents}
              addComponent={addComponent}
            />
            
            <ConfigurationForm
              configName={configName}
              setConfigName={setConfigName}
              handleSaveConfig={handleSaveConfiguration}
              handleAddToCart={handleAddToCart}
              savingConfig={savingConfig}
              isAuthenticated={isAuthenticated}
            />
          </div>
          
          {/* Right sidebar */}
          <div className="md:w-1/3">
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
            <h2 className="text-xl font-bold text-white mb-2">{t('configSaved')}</h2>
            <p className="text-gray-400">{t('redirecting')}</p>
          </div>
        </div>
      )}
    </div>
  );
}