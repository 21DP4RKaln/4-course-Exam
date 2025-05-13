'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Cpu, Monitor, Server, HardDrive, Zap } from 'lucide-react'

interface QuickFiltersProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  activeCategory?: string;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilter,
  onFilterChange,
  activeCategory
}) => {
  const t = useTranslations()
  
  // CPU filters
  const cpuFilters = [
    { id: 'intel-core-i9', name: 'Intel Core i9', category: 'cpu' },
    { id: 'intel-core-i7', name: 'Intel Core i7', category: 'cpu' },
    { id: 'intel-core-i5', name: 'Intel Core i5', category: 'cpu' },
    { id: 'amd-ryzen-9', name: 'AMD Ryzen 9', category: 'cpu' },
    { id: 'amd-ryzen-7', name: 'AMD Ryzen 7', category: 'cpu' },
    { id: 'amd-ryzen-5', name: 'AMD Ryzen 5', category: 'cpu' },
  ];

  // GPU filters
  const gpuFilters = [
    { id: 'nvidia-rtx-40', name: 'NVIDIA RTX 40', category: 'gpu' },
    { id: 'nvidia-rtx-30', name: 'NVIDIA RTX 30', category: 'gpu' },
    { id: 'nvidia-gtx', name: 'NVIDIA GTX', category: 'gpu' },
    { id: 'amd-rx-7000', name: 'AMD RX 7000', category: 'gpu' },
    { id: 'amd-rx-6000', name: 'AMD RX 6000', category: 'gpu' },
  ];

  // Motherboard filters
  const motherboardFilters = [
    { id: 'atx', name: 'ATX', category: 'motherboard' },
    { id: 'micro-atx', name: 'Micro-ATX', category: 'motherboard' },
    { id: 'mini-itx', name: 'Mini-ITX', category: 'motherboard' },
    { id: 'intel-compatible', name: 'Intel Compatible', category: 'motherboard' },
    { id: 'amd-compatible', name: 'AMD Compatible', category: 'motherboard' },
  ];

  // RAM filters
  const ramFilters = [
    { id: 'ddr4', name: 'DDR4', category: 'memory' },
    { id: 'ddr5', name: 'DDR5', category: 'memory' },
    { id: '16gb', name: '16GB', category: 'memory' },
    { id: '32gb', name: '32GB', category: 'memory' },
    { id: '64gb', name: '64GB', category: 'memory' },
  ];

  // Storage filters
  const storageFilters = [
    { id: 'nvme', name: 'NVMe SSD', category: 'storage' },
    { id: 'sata-ssd', name: 'SATA SSD', category: 'storage' },
    { id: 'hdd', name: 'HDD', category: 'storage' },
  ];

  // Power supply filters
  const psuFilters = [
    { id: '650w+', name: '650W+', category: 'psu' },
    { id: '750w+', name: '750W+', category: 'psu' },
    { id: '850w+', name: '850W+', category: 'psu' },
    { id: '1000w+', name: '1000W+', category: 'psu' },
  ];
  
  const getFiltersByCategoryAndActiveCategory = () => {
    if (activeCategory) {
      switch (activeCategory) {
        case 'cpu':
          return cpuFilters;
        case 'gpu':
          return gpuFilters;
        case 'motherboard':
          return motherboardFilters;
        case 'memory':
          return ramFilters;
        case 'storage':
          return storageFilters;
        case 'psu':
          return psuFilters;
        default:
          return [];
      }
    } 
   
    return cpuFilters;
  };

  const filtersToShow = getFiltersByCategoryAndActiveCategory();

  if (filtersToShow.length === 0) {
    return null;
  }
  
  const getCategoryIcon = () => {
    switch (activeCategory) {
      case 'cpu':
        return <Cpu size={18} className="mr-2" />;
      case 'gpu':
        return <Monitor size={18} className="mr-2" />;
      case 'motherboard':
        return <Server size={18} className="mr-2" />;
      case 'memory':
        return <HardDrive size={18} className="mr-2" />;
      case 'storage':
        return <HardDrive size={18} className="mr-2" />;
      case 'psu':
        return <Zap size={18} className="mr-2" />;
      default:
        return null;
    }
  };

  const getGroupTitle = () => {
    switch (activeCategory) {
      case 'cpu':
        return t('configurator.quickFilters.cpuTypes');
      case 'gpu':
        return t('configurator.quickFilters.graphicsCardSeries');
      case 'motherboard':
        return t('configurator.quickFilters.motherboardTypes');
      case 'memory':
        return t('configurator.quickFilters.memoryTypes');
      case 'storage':
        return t('configurator.quickFilters.storageTypes');
      case 'psu':
        return t('configurator.quickFilters.powerSupplyWattage');
      default:
        return t('configurator.quickFilters.quickFilters');
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        {getCategoryIcon()}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getGroupTitle()}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {filtersToShow.map(filter => (
          <button 
            key={filter.id}
            onClick={() => onFilterChange(activeFilter === filter.id ? null : filter.id)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 ${
              activeFilter === filter.id ? 
              'bg-brand-blue-600 text-white dark:bg-brand-red-600 dark:text-white shadow-sm' : 
              'bg-gray-100 text-stone-950 dark:bg-stone-950 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickFilters