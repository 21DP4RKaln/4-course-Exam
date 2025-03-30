'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ContactModal } from '../ui/ContactModal';
import { useCart } from '../../contexts/CartContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  price: number;
}

interface Configuration {
  id: string;
  name: string;
  totalPrice: number;
  components: Component[];
}

interface Filter {
  name: string;
  open: boolean;
  options?: Array<{
    value: string;
    label: string;
    count: number;
    checked: boolean;
  }>;
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const { addItem } = useCart();
  
  const [filters, setFilters] = useState<Filter[]>([
    { 
      name: 'price', 
      open: true 
    },
    { 
      name: 'cores', 
      open: true,
      options: [
        { value: '4', label: '4', count: 5, checked: false },
        { value: '6', label: '6', count: 8, checked: false },
        { value: '8', label: '8', count: 6, checked: false },
        { value: '10', label: '10', count: 2, checked: false },
        { value: '12', label: '12', count: 2, checked: false },
        { value: '14', label: '14', count: 2, checked: false },
        { value: '16', label: '16', count: 7, checked: false }
      ]
    },
    { 
      name: 'multithreading', 
      open: true,
      options: [
        { value: 'yes', label: 'да', count: 43, checked: false }
      ]
    },
    { 
      name: 'socket', 
      open: true,
      options: [
        { value: 'AM4', label: 'AM4', count: 4, checked: false },
        { value: 'LGA1200', label: 'LGA 1200', count: 3, checked: false },
        { value: 'STR4', label: 'STR4', count: 5, checked: false },
        { value: 'LGA1700', label: 'LGA 1700', count: 14, checked: false },
        { value: 'AM5', label: 'AM5', count: 14, checked: false },
        { value: 'LGA1851', label: 'LGA 1851', count: 3, checked: false }
      ]
    },
    { 
      name: 'frequency', 
      open: true 
    }
  ]);
  
  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public-configurations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch ready configurations');
        }
        
        const data = await response.json();
        setConfigs(data);
        
        if (data.length > 0) {
          const prices = data.map((config: Configuration) => config.totalPrice);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (error) {
        console.error('Failed to fetch configurations:', error);
        setError(t('errors.fetchFailed'));
        
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfigurations();
  }, [t]);

  const toggleFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters[index].open = !newFilters[index].open;
    setFilters(newFilters);
  };

  const toggleFilterOption = (filterIndex: number, optionIndex: number) => {
    const newFilters = [...filters];
    if (newFilters[filterIndex].options) {
      newFilters[filterIndex].options![optionIndex].checked = !newFilters[filterIndex].options![optionIndex].checked;
      setFilters(newFilters);
    }
  };

  const getFilteredConfigs = () => {
    return configs.filter(config => {
      if (config.totalPrice < priceRange[0] || config.totalPrice > priceRange[1]) {
        return false;
      }
      
      
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
          {/* New Sidebar - Filtri */}
          <div className="md:col-span-3">
            <div className="bg-[#1E2039] rounded-lg overflow-hidden sticky top-4">
              <div className="p-4 text-center">
                <div className="relative my-2">
                  <input 
                    type="search"
                    placeholder="Поиск по категории"
                    className="w-full bg-[#0a0b1a] text-white rounded-md p-2 pl-10 focus:outline-none"
                  />
                  <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Price Filter */}
              <div className="border-t border-gray-800">
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFilter(0)}
                >
                  <h3 className="text-white font-medium">Цена</h3>
                  {filters[0].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
                {filters[0].open && (
                  <div className="px-4 pb-4">
                    <div className="flex space-x-2 mb-3">
                      <input 
                        type="number" 
                        value={priceRange[0]} 
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full bg-[#0a0b1a] text-white rounded-md p-2 text-sm"
                        min="0"
                      />
                      <span className="text-gray-500 flex items-center">—</span>
                      <input 
                        type="number" 
                        value={priceRange[1]} 
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full bg-[#0a0b1a] text-white rounded-md p-2 text-sm"
                      />
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      value={priceRange[0]} 
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Cores Filter */}
              <div className="border-t border-gray-800">
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFilter(1)}
                >
                  <h3 className="text-white font-medium">Кол-во ядер</h3>
                  {filters[1].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
                {filters[1].open && (
                  <div className="px-4 pb-4 space-y-2">
                    {filters[1].options?.map((option, idx) => (
                      <div key={option.value} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`core-${option.value}`}
                          checked={option.checked}
                          onChange={() => toggleFilterOption(1, idx)}
                          className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                        />
                        <label htmlFor={`core-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                          {option.label} <span className="text-gray-500">({option.count})</span>
                        </label>
                      </div>
                    ))}
                    <button className="text-sm text-gray-400 hover:text-white mt-2 underline">
                      Показать еще
                    </button>
                  </div>
                )}
              </div>

              {/* Multithreading Filter */}
              <div className="border-t border-gray-800">
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFilter(2)}
                >
                  <h3 className="text-white font-medium">Мультипоточность</h3>
                  {filters[2].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
                {filters[2].open && (
                  <div className="px-4 pb-4 space-y-2">
                    {filters[2].options?.map((option, idx) => (
                      <div key={option.value} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`mt-${option.value}`}
                          checked={option.checked}
                          onChange={() => toggleFilterOption(2, idx)}
                          className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                        />
                        <label htmlFor={`mt-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                          {option.label} <span className="text-gray-500">({option.count})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Socket Filter */}
              <div className="border-t border-gray-800">
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFilter(3)}
                >
                  <h3 className="text-white font-medium">Сокет</h3>
                  {filters[3].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
                {filters[3].open && (
                  <div className="px-4 pb-4 space-y-2">
                    {filters[3].options?.map((option, idx) => (
                      <div key={option.value} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`socket-${option.value}`}
                          checked={option.checked}
                          onChange={() => toggleFilterOption(3, idx)}
                          className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                        />
                        <label htmlFor={`socket-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                          {option.label} <span className="text-gray-500">({option.count})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Frequency Filter */}
              <div className="border-t border-gray-800">
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFilter(4)}
                >
                  <h3 className="text-white font-medium">Частота</h3>
                  {filters[4].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
                {filters[4].open && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-400 text-sm">
                      Frequency filters would go here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main content - Product list */}
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
                <p className="text-white">{t('noResults')}</p>
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