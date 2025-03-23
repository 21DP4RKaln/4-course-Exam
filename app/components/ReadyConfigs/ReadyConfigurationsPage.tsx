'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ContactModal } from '../ui/ContactModal';
import { useCart } from '../../contexts/CartContext';

interface Configuration {
  id: string;
  name: string;
  totalPrice: number;
  components: Component[];
}

interface Component {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  price: number;
}

export default function ReadyConfigurationsPage() {
  const t = useTranslations('productCatalog');
  const configT = useTranslations('configurator');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'lv';
  
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const { addItem } = useCart();
  
  useEffect(() => {
    const mockConfigurations = [
      {
        id: 'config1',
        name: 'Gaming Pro X',
        totalPrice: 1299.99,
        components: [
          { id: 'cpu1', name: 'Intel Core i7-13700K', manufacturer: 'Intel', category: 'CPU', price: 419.99 },
          { id: 'gpu1', name: 'NVIDIA GeForce RTX 4070', manufacturer: 'NVIDIA', category: 'GPU', price: 599.99 },
          { id: 'ram1', name: 'Kingston FURY Beast DDR5 (2x16GB)', manufacturer: 'Kingston', category: 'RAM', price: 159.99 },
          { id: 'ssd1', name: 'Samsung 970 EVO Plus 1TB', manufacturer: 'Samsung', category: 'SSD', price: 89.99 },
          { id: 'psu1', name: 'Corsair RM750x', manufacturer: 'Corsair', category: 'PSU', price: 129.99 },
          { id: 'case1', name: 'NZXT H7 Flow', manufacturer: 'NZXT', category: 'Case', price: 129.99 }
        ]
      },
      {
        id: 'config2',
        name: 'Budget Gamer',
        totalPrice: 799.99,
        components: [
          { id: 'cpu2', name: 'AMD Ryzen 5 7600X', manufacturer: 'AMD', category: 'CPU', price: 299.99 },
          { id: 'gpu2', name: 'NVIDIA GeForce RTX 4060', manufacturer: 'NVIDIA', category: 'GPU', price: 299.99 },
          { id: 'ram2', name: 'Corsair Vengeance DDR4 (2x8GB)', manufacturer: 'Corsair', category: 'RAM', price: 69.99 },
          { id: 'ssd2', name: 'Crucial MX500 1TB', manufacturer: 'Crucial', category: 'SSD', price: 69.99 },
          { id: 'psu2', name: 'EVGA 650 BQ', manufacturer: 'EVGA', category: 'PSU', price: 89.99 },
          { id: 'case2', name: 'Corsair 4000D Airflow', manufacturer: 'Corsair', category: 'Case', price: 104.99 }
        ]
      },
      {
        id: 'config3',
        name: 'Content Creator Pro',
        totalPrice: 2499.99,
        components: [
          { id: 'cpu3', name: 'AMD Ryzen 9 7950X', manufacturer: 'AMD', category: 'CPU', price: 699.99 },
          { id: 'gpu3', name: 'NVIDIA GeForce RTX 4080', manufacturer: 'NVIDIA', category: 'GPU', price: 1199.99 },
          { id: 'ram3', name: 'G.Skill Trident Z RGB DDR5 (2x32GB)', manufacturer: 'G.Skill', category: 'RAM', price: 299.99 },
          { id: 'ssd3', name: 'WD Black SN850X 2TB', manufacturer: 'Western Digital', category: 'SSD', price: 149.99 },
          { id: 'psu3', name: 'be quiet! Straight Power 11 1000W', manufacturer: 'be quiet!', category: 'PSU', price: 169.99 },
          { id: 'case3', name: 'Lian Li O11 Dynamic', manufacturer: 'Lian Li', category: 'Case', price: 149.99 }
        ]
      },
      {
        id: 'config4',
        name: 'Office Pro',
        totalPrice: 599.99,
        components: [
          { id: 'cpu4', name: 'Intel Core i3-12100F', manufacturer: 'Intel', category: 'CPU', price: 109.99 },
          { id: 'gpu4', name: 'Intel UHD Graphics 730', manufacturer: 'Intel', category: 'GPU', price: 0 },
          { id: 'ram4', name: 'Crucial 16GB DDR4', manufacturer: 'Crucial', category: 'RAM', price: 59.99 },
          { id: 'ssd4', name: 'Kingston A2000 500GB', manufacturer: 'Kingston', category: 'SSD', price: 59.99 },
          { id: 'psu4', name: 'EVGA 500W', manufacturer: 'EVGA', category: 'PSU', price: 49.99 },
          { id: 'case4', name: 'Fractal Design Focus G', manufacturer: 'Fractal Design', category: 'Case', price: 59.99 }
        ]
      }
    ];
    
    setConfigs(mockConfigurations);
    setLoading(false);
  }, []);

  const getFilteredConfigs = () => {
    return configs.filter(config => {
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'gaming' && config.totalPrice < 900) return false;
        if (selectedFilter === 'office' && config.totalPrice > 900) return false;
        if (selectedFilter === 'workstation' && config.totalPrice < 1800) return false;
      }
      
      if (config.totalPrice < priceRange[0] || config.totalPrice > priceRange[1]) return false;
      
      return true;
    });
  };

  const getCategoryTranslation = (category: string) => {
    try {
      const categoryKey = category.toLowerCase().replace(/\s+/g, '');
      return configT(`categories.${categoryKey}`);
    } catch (e) {
      return category;
    }
  };
  
  const handleAddToCart = (config: Configuration) => {
    addItem({
      id: config.id,
      name: config.name,
      price: config.totalPrice,
      type: 'ready'
    });
    
    alert(t('addedToCart'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
      </div>
    );
  }

  const filteredConfigs = getFilteredConfigs();

  return (
    <div className="bg-[#1A1A1A] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar - Filtri */}
          <div className="md:col-span-3">
            <div className="bg-[#2A2A2A] rounded-lg overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">{t('filters.purpose')}</h2>
              </div>
              
              <div className="p-4">
                <button 
                  className={`block w-full text-left mb-2 px-3 py-2 rounded ${
                    selectedFilter === 'all' 
                      ? 'bg-[#E63946] text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedFilter('all')}
                >
                  {t('categories.gaming')}
                </button>
                <button 
                  className={`block w-full text-left mb-2 px-3 py-2 rounded ${
                    selectedFilter === 'office' 
                      ? 'bg-[#E63946] text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedFilter('office')}
                >
                  {t('categories.workstation')}
                </button>
                <button 
                  className={`block w-full text-left mb-2 px-3 py-2 rounded ${
                    selectedFilter === 'workstation' 
                      ? 'bg-[#E63946] text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedFilter('workstation')}
                >
                  {t('categories.3dModeling')}
                </button>
                <button 
                  className={`block w-full text-left mb-2 px-3 py-2 rounded ${
                    selectedFilter === 'gaming' 
                      ? 'bg-[#E63946] text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedFilter('gaming')}
                >
                  {t('categories.streaming')}
                </button>
              </div>
              
              {/* Cenas filtrs */}
              <div className="p-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-2">{t('filters.price')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{configT('minPrice')}</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-sm">€{priceRange[0]}</span>
                      <input 
                        type="range" 
                        min="0" 
                        max={priceRange[1]} 
                        step="100"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{configT('maxPrice')}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min={priceRange[0]}
                        max="3000" 
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-gray-300 text-sm">€{priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Galvenais saturs - Konfigurāciju saraksts */}
          <div className="md:col-span-9">
            {filteredConfigs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredConfigs.map((config) => (
                  <div key={config.id} className="bg-[#2A2A2A] rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                      <h2 className="text-xl font-semibold text-white">{config.name}</h2>
                      <p className="text-2xl font-bold text-[#E63946] mt-2">€{config.totalPrice.toFixed(2)}</p>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-400 mb-2">{configT('components')}</h3>
                      <div className="space-y-2 mb-4">
                        {config.components.map((component) => (
                          <div key={component.id} className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-white">{component.name}</p>
                              <p className="text-xs text-gray-400">{getCategoryTranslation(component.category)}</p>
                            </div>
                            <p className="text-sm text-gray-300">€{component.price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <button 
                          onClick={() => handleAddToCart(config)}
                          className="flex-1 px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
                        >
                          {t('addToCart')}
                        </button>
                        <button 
                          onClick={() => router.push(`/${locale}/configurator`)}
                          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                          {t('customize')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#2A2A2A] rounded-lg p-8 text-center">
                <p className="text-white">Nav atrasta neviena konfigurācija ar norādītajiem filtriem.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contact button */}
      <button
        onClick={() => setIsModalOpen(true)} 
        className="fixed bottom-8 right-8 z-40 bg-[#E63946] hover:bg-[#FF4D5A] text-white p-4 rounded-full shadow-lg transition-colors duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      </button>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}