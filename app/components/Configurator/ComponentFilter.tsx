'use client';

import { useTranslations } from 'next-intl';

interface Category {
  key: string;
  label: string;
}

interface ComponentFilterProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function ComponentFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  searchTerm,
  setSearchTerm
}: ComponentFilterProps) {
  const t = useTranslations('configurator');

  return (
    <div className="bg-[#2A2A2A] rounded-lg overflow-hidden sticky top-4">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">{t('components')}</h2>
      </div>
      
      {/* Component categories */}
      <div className="p-4">
        {categories.map((category) => (
          <button 
            key={category.key}
            className={`block w-full text-left mb-2 px-3 py-2 rounded ${
              selectedCategory === category.key 
                ? 'bg-[#E63946] text-white' 
                : 'text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedCategory(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      {/* Price filter */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 mb-2">{t('filterByPrice')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('minPrice')}</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm">€{priceRange[0]}</span>
              <input 
                type="range" 
                min="0" 
                max={priceRange[1]} 
                step="10"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('maxPrice')}</label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min={priceRange[0]}
                max="1200" 
                step="10"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-300 text-sm">€{priceRange[1]}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search box */}
      <div className="p-4 border-t border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#E63946] border border-gray-700"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}