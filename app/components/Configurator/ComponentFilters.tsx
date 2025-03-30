import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [filterSections, setFilterSections] = useState([
    { name: 'price', open: true },
    { name: 'cores', open: true },
    { name: 'multithreading', open: true },
    { name: 'socket', open: true },
    { name: 'frequency', open: true }
  ]);

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

  const toggleFilterSection = (index: number) => {
    const newSections = [...filterSections];
    newSections[index].open = !newSections[index].open;
    setFilterSections(newSections);
  };

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

  return (
    <div className="bg-[#211F38] rounded-lg overflow-hidden">
      {/* Price Filter */}
      <div className="border-b border-gray-700">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer"
          onClick={() => toggleFilterSection(0)}
        >
          <h3 className="text-white font-medium">Цена</h3>
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
              min="0" 
              max="5000" 
              value={priceRange[0]} 
              onChange={handlePriceMinChange}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Cores Filter */}
      {category === 'CPU' && (
        <div className="border-b border-gray-700">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleFilterSection(1)}
          >
            <h3 className="text-white font-medium">Кол-во ядер</h3>
            {filterSections[1].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
          {filterSections[1].open && (
            <div className="px-4 pb-4 space-y-2">
              {displayedCoreOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={`core-${option.value}`}
                    checked={selectedCores.includes(option.value)}
                    onChange={() => toggleCoreSelection(option.value)}
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
                  onClick={() => setShowMoreCores(!showMoreCores)}
                >
                  {showMoreCores ? 'Показать меньше' : 'Показать еще'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Multithreading Filter */}
      {category === 'CPU' && (
        <div className="border-b border-gray-700">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleFilterSection(2)}
          >
            <h3 className="text-white font-medium">Мультипоточность</h3>
            {filterSections[2].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
          {filterSections[2].open && (
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
                  да <span className="text-gray-500">(43)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Socket Filter */}
      {category === 'CPU' && (
        <div className="border-b border-gray-700">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleFilterSection(3)}
          >
            <h3 className="text-white font-medium">Сокет</h3>
            {filterSections[3].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
          {filterSections[3].open && (
            <div className="px-4 pb-4 space-y-2">
              {socketOptions.map((option, idx) => (
                <div key={option.value} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={`socket-${option.value}`}
                    checked={selectedSockets.includes(option.value)}
                    onChange={() => toggleSocketSelection(option.value)}
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
      )}

      {/* Frequency Filter */}
      {category === 'CPU' && (
        <div className="border-b border-gray-700">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleFilterSection(4)}
          >
            <h3 className="text-white font-medium">Частота</h3>
            {filterSections[4].open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
          {filterSections[4].open && (
            <div className="px-4 pb-4">
              <p className="text-gray-400 text-sm">
                Frequency filters would go here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComponentFilters;