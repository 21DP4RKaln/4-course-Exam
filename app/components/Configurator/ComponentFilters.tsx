import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Filter {
  cores?: string[];
  multithreading?: boolean;
  socket?: string[];
  frequency?: [number, number];
  price?: [number, number];
}

interface ComponentFiltersProps {
  category: string;
  filters: Filter;
  onFilterChange: (newFilters: Filter) => void;
  minPrice: number;
  maxPrice: number;
}

const ComponentFilters = ({
  category,
  filters,
  onFilterChange,
  minPrice = 0,
  maxPrice = 500000
}: ComponentFiltersProps) => {
  const t = useTranslations('configurator');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.price?.[0] || minPrice,
    filters.price?.[1] || maxPrice
  ]);
  const [selectedCores, setSelectedCores] = useState<string[]>(filters.cores || []);
  const [multiThreading, setMultiThreading] = useState<boolean>(filters.multithreading || false);
  const [selectedSockets, setSelectedSockets] = useState<string[]>(filters.socket || []);
  const [showMoreCores, setShowMoreCores] = useState(false);

  useEffect(() => {
    onFilterChange({
      ...filters,
      cores: selectedCores,
      multithreading: multiThreading,
      socket: selectedSockets,
      price: priceRange
    });
  }, [selectedCores, multiThreading, selectedSockets, priceRange]);

  useEffect(() => {
    setPriceRange(filters.price || [minPrice, maxPrice]);
    setSelectedCores(filters.cores || []);
    setMultiThreading(filters.multithreading || false);
    setSelectedSockets(filters.socket || []);
  }, [filters, minPrice, maxPrice]);

  const toggleCoreSelection = (core: string) => {
    setSelectedCores(prev => 
      prev.includes(core) 
        ? prev.filter(c => c !== core) 
        : [...prev, core]
    );
  };

  const toggleSocketSelection = (socket: string) => {
    setSelectedSockets(prev => 
      prev.includes(socket) 
        ? prev.filter(s => s !== socket) 
        : [...prev, socket]
    );
  };

  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([value, priceRange[1]]);
  };

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([priceRange[0], value]);
  };

  const coreOptions = [
    { value: '4', label: '4', count: 5 },
    { value: '6', label: '6', count: 8 },
    { value: '8', label: '8', count: 6 },
    { value: '10', label: '10', count: 2 },
    { value: '12', label: '12', count: 2 },
    { value: '14', label: '14', count: 2 },
    { value: '16', label: '16', count: 7 }
  ];

  const socketOptions = [
    { value: 'AM4', label: 'AM4', count: 4 },
    { value: 'LGA1200', label: 'LGA 1200', count: 3 },
    { value: 'STR4', label: 'STR4', count: 5 },
    { value: 'LGA1700', label: 'LGA 1700', count: 14 },
    { value: 'AM5', label: 'AM5', count: 14 },
    { value: 'LGA1851', label: 'LGA 1851', count: 3 }
  ];

  const displayedCoreOptions = showMoreCores ? coreOptions : coreOptions.slice(0, 5);

  if (category !== 'CPU') {
    return (
      <div className="bg-[#1E2039] rounded-lg p-4 mb-4">
        {/* Price filter */}
        <div className="mb-4">
          <h3 className="text-white text-sm font-medium mb-2">Цена</h3>
          <div className="flex items-center space-x-2">
            <input 
              type="text"
              value={priceRange[0]}
              onChange={handlePriceMinChange}
              className="w-24 bg-[#1E1E1E] text-white text-sm rounded border border-gray-700 px-2 py-1"
            />
            <span className="text-gray-400">—</span>
            <input 
              type="text"
              value={priceRange[1]}
              onChange={handlePriceMaxChange}
              className="w-24 bg-[#1E1E1E] text-white text-sm rounded border border-gray-700 px-2 py-1"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E2039] rounded-lg p-4 mb-4">
      {/* Price filter */}
      <div className="mb-4">
        <h3 className="text-white text-sm font-medium mb-2">Цена</h3>
        <div className="flex items-center space-x-2">
          <input 
            type="text"
            value={priceRange[0]}
            onChange={handlePriceMinChange}
            className="w-24 bg-[#1E1E1E] text-white text-sm rounded border border-gray-700 px-2 py-1"
          />
          <span className="text-gray-400">—</span>
          <input 
            type="text"
            value={priceRange[1]}
            onChange={handlePriceMaxChange}
            className="w-24 bg-[#1E1E1E] text-white text-sm rounded border border-gray-700 px-2 py-1"
          />
        </div>
      </div>
      
      {/* Cores filter */}
      <div className="mb-4">
        <h3 className="text-white text-sm font-medium mb-2">Кол-во ядер</h3>
        <div className="space-y-1">
          {displayedCoreOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedCores.includes(option.value)}
                onChange={() => toggleCoreSelection(option.value)}
                className="form-checkbox h-4 w-4 rounded bg-[#1E1E1E] border-gray-700 text-indigo-600 mr-2"
              />
              <span className="text-gray-300 text-sm">{option.label} ({option.count})</span>
            </label>
          ))}
        </div>
        {coreOptions.length > 5 && (
          <button 
            className="text-blue-400 text-sm mt-2"
            onClick={() => setShowMoreCores(!showMoreCores)}
          >
            {showMoreCores ? 'Показать меньше' : 'Показать еще'}
          </button>
        )}
      </div>
      
      {/* Multithreading filter */}
      <div className="mb-4">
        <h3 className="text-white text-sm font-medium mb-2">Мультипоточность</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={multiThreading}
            onChange={() => setMultiThreading(!multiThreading)}
            className="form-checkbox h-4 w-4 rounded bg-[#1E1E1E] border-gray-700 text-indigo-600 mr-2"
          />
          <span className="text-gray-300 text-sm">да (43)</span>
        </label>
      </div>
      
      {/* Socket filter */}
      <div className="mb-4">
        <h3 className="text-white text-sm font-medium mb-2">Сокет</h3>
        <div className="space-y-1">
          {socketOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedSockets.includes(option.value)}
                onChange={() => toggleSocketSelection(option.value)}
                className="form-checkbox h-4 w-4 rounded bg-[#1E1E1E] border-gray-700 text-indigo-600 mr-2"
              />
              <span className="text-gray-300 text-sm">{option.label} ({option.count})</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Frequency filter - placeholder */}
      <div className="mb-4">
        <h3 className="text-white text-sm font-medium mb-2">Частота</h3>
        {/* Add frequency slider or inputs */}
      </div>
    </div>
  );
};

export default ComponentFilters;