'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';

// --------------------- COMPONENT LIST ---------------------

interface Component {
  id: string;
  category: string;
  name: string;
  manufacturer: string;
  price: number;
  specs: Record<string, any>;
  stock: number;
}

interface ComponentListProps {
  components: Component[];
  category: string;
  selectedComponents: Record<string, Component>;
  addComponent: (component: Component) => void;
}

export function ComponentList({
  components,
  category,
  selectedComponents,
  addComponent
}: ComponentListProps) {
  const t = useTranslations('configurator');
  
  const isSelected = (component: Component) => {
    return selectedComponents[component.category]?.id === component.id;
  };

  const formatSpecs = (specs: Record<string, any>) => {
    return Object.entries(specs).slice(0, 4).map(([key, value]) => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      return { key: formattedKey, value };
    });
  };

  const getCategoryTranslationKey = (categoryName: string): string => {
    return categoryName.toLowerCase().replace(/\s+/g, '');
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        {/* Use the helper function to format the category key properly */}
        <h2 className="text-xl font-semibold text-white">
          {t(`categories.${getCategoryTranslationKey(category)}`)}
        </h2>
        <span className="text-gray-400 text-sm">{components.length} {t('available')}</span>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        {components.length > 0 ? (
          <div className="p-4 space-y-4">
            {components.map((component) => (
              <div 
                key={component.id} 
                className={`bg-gray-800 rounded-lg p-4 ${isSelected(component) ? 'ring-2 ring-[#E63946]' : ''}`}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-white font-medium">{component.name}</h3>
                    <p className="text-gray-400 text-sm">{component.manufacturer}</p>
                    
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      {formatSpecs(component.specs).map(({ key, value }) => (
                        <p key={key} className="text-gray-400 text-xs">
                          <span className="text-gray-500">{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                    
                    {component.stock <= 0 && (
                      <p className="mt-2 text-red-500 text-xs">{t('outOfStock')}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-white font-bold mb-2">€{component.price.toFixed(2)}</span>
                    <button
                      onClick={() => addComponent(component)}
                      disabled={component.stock <= 0}
                      className={`px-3 py-1 rounded text-sm ${
                        isSelected(component)
                          ? 'bg-green-700 text-white hover:bg-green-800'
                          : 'bg-[#E63946] text-white hover:bg-[#FF4D5A]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSelected(component) 
                        ? t('actions.selected') 
                        : component.stock > 0 
                          ? t('actions.add') 
                          : t('actions.unavailable')
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400">{t('noComponentsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --------------------- COMPONENT FILTERS ---------------------

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface CategoryData {
  manufacturers?: string[];
  cores?: string[];
  sockets?: string[];
  vram?: string[];
  capacity?: string[];
  type?: string[];
  storageType?: string[];
  storageCapacity?: string[];
  count?: number;
}

interface Filter {
  manufacturer?: string[];
  price?: [number, number];
  cores?: string[];
  socket?: string[];
  multithreading?: boolean;
  vram?: string[];
  capacity?: string[];
  type?: string[];
  storageType?: string[];
  storageCapacity?: string[];
}

interface ComponentFiltersProps {
  category: string;
  filters: Filter;
  onFilterChange: (newFilters: Filter) => void;
  minPrice: number;
  maxPrice: number;
  categoryData: CategoryData;
}

export function ComponentFilters({
  category,
  filters,
  onFilterChange,
  minPrice = 0,
  maxPrice = 5000,
  categoryData = {}
}: ComponentFiltersProps) {
  const t = useTranslations('configurator');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.price?.[0] || minPrice,
    filters.price?.[1] || maxPrice
  ]);
  
  const [filterSections, setFilterSections] = useState([
    { name: 'price', open: true },
    { name: 'manufacturer', open: true },
    { name: 'cores', open: true },
    { name: 'socket', open: true },
    { name: 'multithreading', open: true },
    { name: 'vram', open: true },
    { name: 'capacity', open: true },
    { name: 'type', open: true },
    { name: 'storageType', open: true },
    { name: 'storageCapacity', open: true }
  ]);
  
  // Expandable sections
  const [showMoreOptions, setShowMoreOptions] = useState<Record<string, boolean>>({
    cores: false,
    socket: false,
    vram: false,
    capacity: false,
    type: false,
    manufacturer: false,
    storageType: false,
    storageCapacity: false
  });
  
  // Selected filter options
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    cores: filters.cores || [],
    socket: filters.socket || [],
    vram: filters.vram || [],
    capacity: filters.capacity || [],
    type: filters.type || [],
    storageType: filters.storageType || [],
    storageCapacity: filters.storageCapacity || []
  });
  
  const [multiThreading, setMultiThreading] = useState<boolean>(filters.multithreading || false);

  useEffect(() => {
    onFilterChange({
      ...filters,
      ...selectedFilters,
      multithreading: multiThreading,
      price: priceRange
    });
  }, [selectedFilters, multiThreading, priceRange]);

  useEffect(() => {
    setPriceRange(filters.price || [minPrice, maxPrice]);
    
    // Reset selected filters when changing categories
    setSelectedFilters({
      cores: filters.cores || [],
      socket: filters.socket || [],
      vram: filters.vram || [],
      capacity: filters.capacity || [],
      type: filters.type || [],
      storageType: filters.storageType || [],
      storageCapacity: filters.storageCapacity || []
    });
    
    setMultiThreading(filters.multithreading || false);
  }, [filters, minPrice, maxPrice, category]);

  const toggleFilterSection = (index: number) => {
    const newSections = [...filterSections];
    newSections[index].open = !newSections[index].open;
    setFilterSections(newSections);
  };

  const toggleFilterOption = (filterName: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[filterName] || [];
      return {
        ...prev,
        [filterName]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([value, priceRange[1]]);
  };

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([priceRange[0], value]);
  };

  const getFilterOptionsWithCounts = (options: string[] = []): FilterOption[] => {
    return options.map(option => ({
      value: option,
      label: option,
      count: Math.floor(Math.random() * 10) + 1 // In a real app, these counts would come from the API
    }));
  };

  // Generate options for different filter types
  const coreOptions = getFilterOptionsWithCounts(categoryData.cores);
  const socketOptions = getFilterOptionsWithCounts(categoryData.sockets);
  const vramOptions = getFilterOptionsWithCounts(categoryData.vram);
  const capacityOptions = getFilterOptionsWithCounts(categoryData.capacity);
  const typeOptions = getFilterOptionsWithCounts(categoryData.type);
  const storageTypeOptions = getFilterOptionsWithCounts(categoryData.storageType);
  const storageCapacityOptions = getFilterOptionsWithCounts(categoryData.storageCapacity);
  const manufacturerOptions = getFilterOptionsWithCounts(categoryData.manufacturers);

  // Limit display options unless "show more" is clicked
  const getDisplayedOptions = (options: FilterOption[], filterType: string) => {
    return showMoreOptions[filterType] ? options : options.slice(0, 5);
  };

  const toggleShowMore = (filterType: string) => {
    setShowMoreOptions(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  return (
    <div className="bg-[#211F38] rounded-lg overflow-hidden">
      {/* Price Filter */}
      <div className="border-b border-gray-700">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer"
          onClick={() => toggleFilterSection(0)}
        >
          <h3 className="text-white font-medium">Price</h3>
          {filterSections[0].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
        {filterSections[0].open && (
          <div className="px-4 pb-4">
            <div className="flex space-x-2 mb-3">
              <input 
                type="number" 
                value={priceRange[0]} 
                onChange={handlePriceMinChange}
                className="w-full bg-[#1E1E1E] text-white rounded-md p-2 text-sm"
                min="0"
              />
              <span className="text-gray-500 flex items-center">—</span>
              <input 
                type="number" 
                value={priceRange[1]} 
                onChange={handlePriceMaxChange}
                className="w-full bg-[#1E1E1E] text-white rounded-md p-2 text-sm"
              />
            </div>
            <input 
              type="range" 
              min={minPrice} 
              max={maxPrice} 
              value={priceRange[0]} 
              onChange={handlePriceMinChange}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Manufacturer Filter */}
      {categoryData.manufacturers && categoryData.manufacturers.length > 0 && (
        <div className="border-b border-gray-700">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleFilterSection(1)}
          >
            <h3 className="text-white font-medium">Manufacturer</h3>
            {filterSections[1].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
          {filterSections[1].open && (
            <div className="px-4 pb-4 space-y-2">
              {getDisplayedOptions(manufacturerOptions, 'manufacturer').map((option) => (
                <div key={option.value} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={`manufacturer-${option.value}`}
                    checked={selectedFilters.manufacturer?.includes(option.value) || false}
                    onChange={() => toggleFilterOption('manufacturer', option.value)}
                    className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                  />
                  <label htmlFor={`manufacturer-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                    {option.label} <span className="text-gray-500">({option.count})</span>
                  </label>
                </div>
              ))}
              {manufacturerOptions.length > 5 && (
                <button 
                  className="text-sm text-blue-400 hover:text-white mt-2 underline"
                  onClick={() => toggleShowMore('manufacturer')}
                >
                  {showMoreOptions.manufacturer ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* CPU specific filters */}
      {category === 'CPU' && (
        <>
          {/* Cores Filter */}
          {categoryData.cores && categoryData.cores.length > 0 && (
            <div className="border-b border-gray-700">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleFilterSection(2)}
              >
                <h3 className="text-white font-medium">Cores</h3>
                {filterSections[2].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </div>
              {filterSections[2].open && (
                <div className="px-4 pb-4 space-y-2">
                  {getDisplayedOptions(coreOptions, 'cores').map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`core-${option.value}`}
                        checked={selectedFilters.cores?.includes(option.value) || false}
                        onChange={() => toggleFilterOption('cores', option.value)}
                        className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                      />
                      <label htmlFor={`core-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                        {option.label} <span className="text-gray-500">({option.count})</span>
                      </label>
                    </div>
                  ))}
                  {coreOptions.length > 5 && (
                    <button 
                      className="text-sm text-blue-400 hover:text-white mt-2 underline"
                      onClick={() => toggleShowMore('cores')}
                    >
                      {showMoreOptions.cores ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Socket Filter */}
          {categoryData.sockets && categoryData.sockets.length > 0 && (
            <div className="border-b border-gray-700">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleFilterSection(3)}
              >
                <h3 className="text-white font-medium">Socket</h3>
                {filterSections[3].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </div>
              {filterSections[3].open && (
                <div className="px-4 pb-4 space-y-2">
                  {getDisplayedOptions(socketOptions, 'socket').map((option) => (
                    <div key={option.value} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`socket-${option.value}`}
                      checked={selectedFilters.socket?.includes(option.value) || false}
                      onChange={() => toggleFilterOption('socket', option.value)}
                      className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                    />
                    <label htmlFor={`socket-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                      {option.label} <span className="text-gray-500">({option.count})</span>
                    </label>
                  </div>
                ))}
                {socketOptions.length > 5 && (
                  <button 
                    className="text-sm text-blue-400 hover:text-white mt-2 underline"
                    onClick={() => toggleShowMore('socket')}
                  >
                    {showMoreOptions.socket ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Multithreading Filter */}
        <div className="border-b border-gray-700">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleFilterSection(4)}
          >
            <h3 className="text-white font-medium">Multithreading</h3>
            {filterSections[4].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
          {filterSections[4].open && (
            <div className="px-4 pb-4 space-y-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`mt-yes`}
                  checked={multiThreading}
                  onChange={() => setMultiThreading(!multiThreading)}
                  className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                />
                <label htmlFor={`mt-yes`} className="ml-2 text-sm text-gray-300 flex-1">
                  yes <span className="text-gray-500">(43)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </>
    )}

    {/* GPU specific filters */}
    {category === 'GPU' && (
      <>
        {/* VRAM Filter */}
        {categoryData.vram && categoryData.vram.length > 0 && (
          <div className="border-b border-gray-700">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleFilterSection(5)}
            >
              <h3 className="text-white font-medium">VRAM</h3>
              {filterSections[5].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
            {filterSections[5].open && (
              <div className="px-4 pb-4 space-y-2">
                {getDisplayedOptions(vramOptions, 'vram').map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`vram-${option.value}`}
                      checked={selectedFilters.vram?.includes(option.value) || false}
                      onChange={() => toggleFilterOption('vram', option.value)}
                      className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                    />
                    <label htmlFor={`vram-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                      {option.label} <span className="text-gray-500">({option.count})</span>
                    </label>
                  </div>
                ))}
                {vramOptions.length > 5 && (
                  <button 
                    className="text-sm text-blue-400 hover:text-white mt-2 underline"
                    onClick={() => toggleShowMore('vram')}
                  >
                    {showMoreOptions.vram ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </>
    )}

    {/* RAM specific filters */}
    {category === 'RAM' && (
      <>
        {/* Capacity Filter */}
        {categoryData.capacity && categoryData.capacity.length > 0 && (
          <div className="border-b border-gray-700">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleFilterSection(6)}
            >
              <h3 className="text-white font-medium">Capacity</h3>
              {filterSections[6].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
            {filterSections[6].open && (
              <div className="px-4 pb-4 space-y-2">
                {getDisplayedOptions(capacityOptions, 'capacity').map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`capacity-${option.value}`}
                      checked={selectedFilters.capacity?.includes(option.value) || false}
                      onChange={() => toggleFilterOption('capacity', option.value)}
                      className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                    />
                    <label htmlFor={`capacity-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                      {option.label} <span className="text-gray-500">({option.count})</span>
                    </label>
                  </div>
                ))}
                {capacityOptions.length > 5 && (
                  <button 
                    className="text-sm text-blue-400 hover:text-white mt-2 underline"
                    onClick={() => toggleShowMore('capacity')}
                  >
                    {showMoreOptions.capacity ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Type Filter */}
        {categoryData.type && categoryData.type.length > 0 && (
          <div className="border-b border-gray-700">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleFilterSection(7)}
            >
              <h3 className="text-white font-medium">Type</h3>
              {filterSections[7].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
            {filterSections[7].open && (
              <div className="px-4 pb-4 space-y-2">
                {getDisplayedOptions(typeOptions, 'type').map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`type-${option.value}`}
                      checked={selectedFilters.type?.includes(option.value) || false}
                      onChange={() => toggleFilterOption('type', option.value)}
                      className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                    />
                    <label htmlFor={`type-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                      {option.label} <span className="text-gray-500">({option.count})</span>
                    </label>
                  </div>
                ))}
                {typeOptions.length > 5 && (
                  <button 
                    className="text-sm text-blue-400 hover:text-white mt-2 underline"
                    onClick={() => toggleShowMore('type')}
                  >
                    {showMoreOptions.type ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </>
    )}

    {/* Storage specific filters */}
    {category === 'Storage' && (
      <>
        {/* Storage Type Filter */}
        {categoryData.storageType && categoryData.storageType.length > 0 && (
          <div className="border-b border-gray-700">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleFilterSection(8)}
            >
              <h3 className="text-white font-medium">Type</h3>
              {filterSections[8].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
            {filterSections[8].open && (
              <div className="px-4 pb-4 space-y-2">
                {getDisplayedOptions(storageTypeOptions, 'storageType').map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`storageType-${option.value}`}
                      checked={selectedFilters.storageType?.includes(option.value) || false}
                      onChange={() => toggleFilterOption('storageType', option.value)}
                      className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                    />
                    <label htmlFor={`storageType-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                      {option.label} <span className="text-gray-500">({option.count})</span>
                    </label>
                  </div>
                ))}
                {storageTypeOptions.length > 5 && (
                  <button 
                    className="text-sm text-blue-400 hover:text-white mt-2 underline"
                    onClick={() => toggleShowMore('storageType')}
                  >
                    {showMoreOptions.storageType ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Storage Capacity Filter */}
        {categoryData.storageCapacity && categoryData.storageCapacity.length > 0 && (
          <div className="border-b border-gray-700">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleFilterSection(9)}
            >
              <h3 className="text-white font-medium">Capacity</h3>
              {filterSections[9].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
            {filterSections[9].open && (
              <div className="px-4 pb-4 space-y-2">
                {getDisplayedOptions(storageCapacityOptions, 'storageCapacity').map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`storageCapacity-${option.value}`}
                      checked={selectedFilters.storageCapacity?.includes(option.value) || false}
                      onChange={() => toggleFilterOption('storageCapacity', option.value)}
                      className="w-4 h-4 bg-[#0a0b1a] border-gray-700 rounded focus:ring-blue-600"
                    />
                    <label htmlFor={`storageCapacity-${option.value}`} className="ml-2 text-sm text-gray-300 flex-1">
                      {option.label} <span className="text-gray-500">({option.count})</span>
                    </label>
                  </div>
                ))}
                {storageCapacityOptions.length > 5 && (
                  <button 
                    className="text-sm text-blue-400 hover:text-white mt-2 underline"
                    onClick={() => toggleShowMore('storageCapacity')}
                  >
                    {showMoreOptions.storageCapacity ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>
);
}

// --------------------- CONFIGURATION FORM ---------------------

interface ConfigFormProps {
  configName: string;
  setConfigName: (name: string) => void;
  handleSaveConfig: () => void;
  handleAddToCart?: () => void;
  savingConfig: boolean;
  isAuthenticated?: boolean;
}

export function ConfigurationForm({
  configName,
  setConfigName,
  handleSaveConfig,
  handleAddToCart,
  savingConfig,
  isAuthenticated = true
}: ConfigFormProps) {
  const t = useTranslations('configurator');
  
  return (
    <div className="bg-[#211F38] rounded-lg p-4 mb-6">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {t('configName')}
      </label>
      <input
        type="text"
        value={configName}
        onChange={(e) => setConfigName(e.target.value)}
        placeholder={t('configNamePlaceholder')}
        className="w-full bg-[#1E1E1E] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946] border border-gray-700 mb-4"
      />
      
      <div className="flex space-x-4">
        <button
          onClick={handleSaveConfig}
          disabled={savingConfig}
          className="flex-1 bg-[#E63946] hover:bg-[#FF4D5A] text-white rounded-lg py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingConfig ? t('actions.saving') : t('actions.save')}
        </button>
        
        {handleAddToCart && (
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 font-medium"
          >
            {t('actions.addToCart')}
          </button>
        )}