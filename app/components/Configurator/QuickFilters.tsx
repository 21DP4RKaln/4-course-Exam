'use client'

import React from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Cpu, Monitor, Server, HardDrive, Zap, Fan, Layers } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  const locale = useLocale()
  
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

  // Case filters
  const caseFilters = [
    { id: 'full-tower', name: 'Full Tower', category: 'case' },
    { id: 'mid-tower', name: 'Mid Tower', category: 'case' },
    { id: 'mini-tower', name: 'Mini Tower', category: 'case' },
    { id: 'tempered-glass', name: 'Tempered Glass', category: 'case' },
    { id: 'mesh', name: 'Mesh Front', category: 'case' },
  ];

  // Cooling filters
  const coolingFilters = [
    { id: 'air', name: 'Air Cooling', category: 'cooling' },
    { id: 'aio', name: 'AIO Liquid', category: 'cooling' },
    { id: 'custom', name: 'Custom Loop', category: 'cooling' },
    { id: 'rgb', name: 'RGB', category: 'cooling' },
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
        case 'case':
          return caseFilters;
        case 'cooling':
          return coolingFilters;
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
      case 'case':
        return <Layers size={18} className="mr-2" />;
      case 'cooling':
        return <Fan size={18} className="mr-2" />;
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
      case 'case':
        return t('configurator.quickFilters.caseTypes');
      case 'cooling':
        return t('configurator.quickFilters.coolingTypes');
      default:
        return t('configurator.quickFilters.quickFilters');
    }
  };

  return filtersToShow.length === 0 ? null : (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          {getCategoryIcon()}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
            {getGroupTitle()}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filtersToShow.map(filter => (
            <button 
              key={filter.id}
              onClick={() => onFilterChange(activeFilter === filter.id ? null : filter.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === filter.id
                  ? 'bg-indigo-600 dark:bg-brand-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickFilters