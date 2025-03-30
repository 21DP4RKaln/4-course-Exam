import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import ComponentSidebar from './ComponentSidebar';
import ComponentList from './ComponentList';
import ComponentFilters from './ComponentFilters';
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

interface Filter {
  cores?: string[];
  multithreading?: boolean;
  socket?: string[];
  frequency?: [number, number];
  price?: [number, number];
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
  const [filters, setFilters] = useState<Filter>({
    cores: [],
    multithreading: false,
    socket: [],
    price: [0, 500000]
  });
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
          setFilters(prev => ({
            ...prev,
            price: [minPrice, maxPrice]
          }));
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

  const filteredComponents = components.filter(component => {
    if (component.category !== selectedCategory) return false;
    
    // Apply search filter
    if (searchTerm && !component.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !component.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply price filter
    if (filters.price && (component.price < filters.price[0] || component.price > filters.price[1])) {
      return false;
    }
    
    // Apply core filter for CPUs
    if (component.category === 'CPU' && filters.cores && filters.cores.length > 0) {
      // Assuming core count is in component.specs.cores
      if (!filters.cores.includes(String(component.specs.cores))) {
        return false;
      }
    }
    
    // Apply socket filter for CPUs
    if (component.category === 'CPU' && filters.socket && filters.socket.length > 0) {
      // Assuming socket is in component.specs.socket
      if (!filters.socket.includes(component.specs.socket)) {
        return false;
      }
    }
    
    // Apply multithreading filter for CPUs
    if (component.category === 'CPU' && filters.multithreading) {
      // Check if CPU supports multithreading (if the threads > cores, it has multithreading)
      if (!(component.specs.threads > component.specs.cores)) {
        return false;
      }
    }
    
    return true;
  });

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
      {/* Original component sidebar on the left */}
      <ComponentSidebar 
        selectedCategory={selectedCategory} 
        onCategorySelect={setSelectedCategory} 
      />
      
      {/* Main content */}
      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold text-white mb-8">{t('title')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Component filter panel on the left side of the main content */}
          <div className="lg:col-span-3">
            <ComponentFilters
              category={selectedCategory}
              filters={filters}
              onFilterChange={setFilters}
              minPrice={0}
              maxPrice={500000}
            />

            <SelectedComponents 
              selectedComponents={selectedComponents}
              removeComponent={removeComponent}
            />
            
            <ConfigurationSummary 
              totalPrice={calculateTotalPrice()}
            />
          </div>

          {/* Component list in the center/right area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Search bar for components */}
            <div className="bg-[#2A2A2A] rounded-lg p-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1E1E1E] text-white rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
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