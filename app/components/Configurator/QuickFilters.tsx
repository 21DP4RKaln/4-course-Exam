import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/app/contexts/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { filters } from './filters';

interface Props {
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
  activeCategory?: string;
  quickCpuFilter?: string | null;
  onQuickCpuFilterChange?: React.Dispatch<React.SetStateAction<string | null>>;
  isQuickFilterActive?: (filterType: string) => boolean;
  activeFilters?: Record<string, boolean>;
}

const QuickFilters: React.FC<Props> = ({
  activeFilter,
  onFilterChange,
  activeCategory,
  quickCpuFilter,
  onQuickCpuFilterChange,
  isQuickFilterActive,
  activeFilters = {},
}) => {
  const t = useTranslations();
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const currentFilter =
    quickCpuFilter !== undefined ? quickCpuFilter : activeFilter;
  const currentOnFilterChange = onQuickCpuFilterChange || onFilterChange;

  const [lastActiveFilter, setLastActiveFilter] = useState<string | null>(
    currentFilter || null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const MAX_VISIBLE_ITEMS = 6;
  const getBrandColor = useCallback(
    (filterId: string | null, isActive: boolean) => {
      if (!isActive) {
        return theme === 'dark'
          ? 'text-neutral-400 hover:text-neutral-200 active:text-neutral-100'
          : 'text-neutral-600 hover:text-neutral-900 active:text-neutral-800';
      }

      if (!filterId) return theme === 'dark' ? 'text-red-400' : 'text-blue-600';
      // CPU brands and series
      if (
        filterId.toLowerCase().includes('intel') ||
        filterId.toLowerCase().includes('core')
      ) {
        return 'text-blue-500';
      }
      if (
        filterId.toLowerCase().includes('amd') ||
        filterId.toLowerCase().includes('ryzen') ||
        filterId.toLowerCase().includes('threadripper')
      ) {
        return 'text-orange-500';
      } // GPU brands and series
      if (
        filterId.toLowerCase().includes('nvidia') ||
        filterId.toLowerCase().includes('rtx') ||
        filterId.toLowerCase().includes('gtx')
      ) {
        return 'text-green-500';
      }
      if (
        filterId.toLowerCase().includes('amd') &&
        (filterId.toLowerCase().includes('rx') ||
          filterId.toLowerCase().includes('radeon'))
      ) {
        return 'text-red-500';
      }
      if (
        filterId.toLowerCase().includes('intel') &&
        (filterId.toLowerCase().includes('arc') ||
          filterId.toLowerCase().includes('a580') ||
          filterId.toLowerCase().includes('a750'))
      ) {
        return 'text-blue-400';
      } // PSU efficiency ratings
      if (
        filterId.toLowerCase().includes('80plus-bronze') ||
        filterId.toLowerCase().includes('bronze')
      ) {
        return 'text-amber-600';
      }
      if (
        filterId.toLowerCase().includes('80plus-gold') ||
        filterId.toLowerCase().includes('gold')
      ) {
        return 'text-yellow-500';
      }
      if (
        filterId.toLowerCase().includes('80plus-platinum') ||
        filterId.toLowerCase().includes('platinum')
      ) {
        return 'text-slate-300';
      }
      if (
        filterId.toLowerCase().includes('80plus-titanium') ||
        filterId.toLowerCase().includes('titanium')
      ) {
        return 'text-gray-400';
      } // Motherboard form factors and compatibility
      if (
        filterId.toLowerCase().includes('atx') &&
        !filterId.toLowerCase().includes('micro') &&
        !filterId.toLowerCase().includes('mini')
      ) {
        return 'text-purple-500';
      }
      if (
        filterId.toLowerCase().includes('micro-atx') ||
        filterId.toLowerCase().includes('microatx')
      ) {
        return 'text-cyan-500';
      }
      if (
        filterId.toLowerCase().includes('mini-itx') ||
        filterId.toLowerCase().includes('mini-atx') ||
        filterId.toLowerCase().includes('miniitx')
      ) {
        return 'text-pink-500';
      }
      if (filterId.toLowerCase().includes('eatx')) {
        return 'text-indigo-600';
      }
      if (filterId.toLowerCase().includes('intel-compatible')) {
        return 'text-blue-500';
      }
      if (filterId.toLowerCase().includes('amd-compatible')) {
        return 'text-orange-500';
      } // RAM specifications
      if (filterId.toLowerCase().includes('ddr4')) {
        return 'text-indigo-500';
      }
      if (filterId.toLowerCase().includes('ddr5')) {
        return 'text-violet-500';
      }
      if (filterId.toLowerCase().includes('16gb')) {
        return 'text-emerald-500';
      }
      if (filterId.toLowerCase().includes('32gb')) {
        return 'text-teal-500';
      }
      if (filterId.toLowerCase().includes('64gb')) {
        return 'text-sky-500';
      }
      if (filterId.toLowerCase().includes('128gb')) {
        return 'text-blue-400';
      }
      if (filterId.toLowerCase().includes('256gb')) {
        return 'text-indigo-400';
      } // Storage types
      if (filterId.toLowerCase().includes('nvme')) {
        return 'text-red-500';
      }
      if (
        filterId.toLowerCase().includes('sata-ssd') ||
        filterId.toLowerCase().includes('sata ssd')
      ) {
        return 'text-orange-400';
      }
      if (filterId.toLowerCase().includes('hdd')) {
        return 'text-gray-500';
      } // Cooling types
      if (
        filterId.toLowerCase().includes('air') &&
        filterId.toLowerCase().includes('cooling')
      ) {
        return 'text-sky-400';
      }
      if (
        filterId.toLowerCase().includes('liquid') &&
        filterId.toLowerCase().includes('cooling')
      ) {
        return 'text-blue-600';
      }
      if (
        filterId.toLowerCase().includes('fluid') &&
        filterId.toLowerCase().includes('cooling')
      ) {
        return 'text-blue-600';
      }
      // Services
      if (filterId.toLowerCase().includes('windows')) {
        return 'text-blue-500';
      }
      if (
        filterId.toLowerCase().includes('wifi') ||
        filterId.toLowerCase().includes('bluetooth')
      ) {
        return 'text-green-500';
      }
      if (filterId.toLowerCase().includes('4gpu')) {
        return 'text-purple-500';
      }
      if (filterId.toLowerCase().includes('sound')) {
        return 'text-yellow-500';
      }
      if (filterId.toLowerCase().includes('capture')) {
        return 'text-red-500';
      }
      return theme === 'dark' ? 'text-red-400' : 'text-blue-600';
    },
    [theme]
  );
  const getBrandUnderlineColor = useCallback(
    (filterId: string | null) => {
      if (!filterId)
        return theme === 'dark' ? 'after:bg-red-500' : 'after:bg-blue-600';
      // CPU brands and series
      if (
        filterId.toLowerCase().includes('intel') ||
        filterId.toLowerCase().includes('core')
      ) {
        return 'after:bg-blue-500';
      }
      if (
        filterId.toLowerCase().includes('amd') ||
        filterId.toLowerCase().includes('ryzen') ||
        filterId.toLowerCase().includes('threadripper')
      ) {
        return 'after:bg-orange-500';
      } // GPU brands and series
      if (
        filterId.toLowerCase().includes('nvidia') ||
        filterId.toLowerCase().includes('rtx') ||
        filterId.toLowerCase().includes('gtx')
      ) {
        return 'after:bg-green-500';
      }
      if (
        filterId.toLowerCase().includes('amd') &&
        (filterId.toLowerCase().includes('rx') ||
          filterId.toLowerCase().includes('radeon'))
      ) {
        return 'after:bg-red-500';
      }
      if (
        filterId.toLowerCase().includes('intel') &&
        (filterId.toLowerCase().includes('arc') ||
          filterId.toLowerCase().includes('a580') ||
          filterId.toLowerCase().includes('a750'))
      ) {
        return 'after:bg-blue-400';
      } // PSU efficiency ratings
      if (
        filterId.toLowerCase().includes('80plus-bronze') ||
        filterId.toLowerCase().includes('bronze')
      ) {
        return 'after:bg-amber-600';
      }
      if (
        filterId.toLowerCase().includes('80plus-gold') ||
        filterId.toLowerCase().includes('gold')
      ) {
        return 'after:bg-yellow-500';
      }
      if (
        filterId.toLowerCase().includes('80plus-platinum') ||
        filterId.toLowerCase().includes('platinum')
      ) {
        return 'after:bg-slate-300';
      }
      if (
        filterId.toLowerCase().includes('80plus-titanium') ||
        filterId.toLowerCase().includes('titanium')
      ) {
        return 'after:bg-gray-400';
      } // Motherboard form factors and compatibility
      if (
        filterId.toLowerCase().includes('atx') &&
        !filterId.toLowerCase().includes('micro') &&
        !filterId.toLowerCase().includes('mini')
      ) {
        return 'after:bg-purple-500';
      }
      if (
        filterId.toLowerCase().includes('micro-atx') ||
        filterId.toLowerCase().includes('microatx')
      ) {
        return 'after:bg-cyan-500';
      }
      if (
        filterId.toLowerCase().includes('mini-itx') ||
        filterId.toLowerCase().includes('mini-atx') ||
        filterId.toLowerCase().includes('miniitx')
      ) {
        return 'after:bg-pink-500';
      }
      if (filterId.toLowerCase().includes('eatx')) {
        return 'after:bg-indigo-600';
      }
      if (filterId.toLowerCase().includes('intel-compatible')) {
        return 'after:bg-blue-500';
      }
      if (filterId.toLowerCase().includes('amd-compatible')) {
        return 'after:bg-orange-500';
      } // RAM specifications
      if (filterId.toLowerCase().includes('ddr4')) {
        return 'after:bg-indigo-500';
      }
      if (filterId.toLowerCase().includes('ddr5')) {
        return 'after:bg-violet-500';
      }
      if (filterId.toLowerCase().includes('16gb')) {
        return 'after:bg-emerald-500';
      }
      if (filterId.toLowerCase().includes('32gb')) {
        return 'after:bg-teal-500';
      }
      if (filterId.toLowerCase().includes('64gb')) {
        return 'after:bg-sky-500';
      }
      if (filterId.toLowerCase().includes('128gb')) {
        return 'after:bg-blue-400';
      }
      if (filterId.toLowerCase().includes('256gb')) {
        return 'after:bg-indigo-400';
      }
      // Storage types
      if (filterId.toLowerCase().includes('nvme')) {
        return 'after:bg-red-500';
      }
      if (
        filterId.toLowerCase().includes('sata-ssd') ||
        filterId.toLowerCase().includes('sata ssd')
      ) {
        return 'after:bg-orange-400';
      }
      if (filterId.toLowerCase().includes('hdd')) {
        return 'after:bg-gray-500';
      } // Cooling types
      if (
        filterId.toLowerCase().includes('air') &&
        filterId.toLowerCase().includes('cooling')
      ) {
        return 'after:bg-sky-400';
      }
      if (
        filterId.toLowerCase().includes('liquid') &&
        filterId.toLowerCase().includes('cooling')
      ) {
        return 'after:bg-blue-600';
      }
      if (
        filterId.toLowerCase().includes('fluid') &&
        filterId.toLowerCase().includes('cooling')
      ) {
        return 'after:bg-blue-600';
      }
      // Services
      if (filterId.toLowerCase().includes('windows')) {
        return 'after:bg-blue-500';
      }
      if (
        filterId.toLowerCase().includes('wifi') ||
        filterId.toLowerCase().includes('bluetooth')
      ) {
        return 'after:bg-green-500';
      }
      if (filterId.toLowerCase().includes('4gpu')) {
        return 'after:bg-purple-500';
      }
      if (filterId.toLowerCase().includes('sound')) {
        return 'after:bg-yellow-500';
      }
      if (filterId.toLowerCase().includes('capture')) {
        return 'after:bg-red-500';
      }
      return theme === 'dark' ? 'after:bg-red-500' : 'after:bg-blue-600';
    },
    [theme]
  );
  const getBrandGlow = useCallback(
    (filterId: string | null, isActive: boolean) => {
      if (!isActive) return '';

      if (!filterId)
        return theme === 'dark'
          ? 'shadow-[0_0_20px_rgba(239,68,68,0.5)]'
          : 'shadow-[0_0_20px_rgba(37,99,235,0.4)]';
      // CPU brands and series
      if (
        filterId.toLowerCase().includes('intel') ||
        filterId.toLowerCase().includes('core')
      ) {
        return 'shadow-[0_0_20px_rgba(59,130,246,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('amd') ||
        filterId.toLowerCase().includes('ryzen') ||
        filterId.toLowerCase().includes('threadripper')
      ) {
        return 'shadow-[0_0_20px_rgba(249,115,22,0.5)]';
      } // GPU brands and series
      if (
        filterId.toLowerCase().includes('nvidia') ||
        filterId.toLowerCase().includes('rtx') ||
        filterId.toLowerCase().includes('gtx')
      ) {
        return 'shadow-[0_0_20px_rgba(34,197,94,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('amd') &&
        (filterId.toLowerCase().includes('rx') ||
          filterId.toLowerCase().includes('radeon'))
      ) {
        return 'shadow-[0_0_20px_rgba(239,68,68,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('intel') &&
        (filterId.toLowerCase().includes('arc') ||
          filterId.toLowerCase().includes('a580') ||
          filterId.toLowerCase().includes('a750'))
      ) {
        return 'shadow-[0_0_20px_rgba(96,165,250,0.5)]';
      } // PSU efficiency ratings
      if (
        filterId.toLowerCase().includes('80plus-bronze') ||
        filterId.toLowerCase().includes('bronze')
      ) {
        return 'shadow-[0_0_20px_rgba(217,119,6,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('80plus-gold') ||
        filterId.toLowerCase().includes('gold')
      ) {
        return 'shadow-[0_0_20px_rgba(234,179,8,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('80plus-platinum') ||
        filterId.toLowerCase().includes('platinum')
      ) {
        return 'shadow-[0_0_20px_rgba(203,213,225,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('80plus-titanium') ||
        filterId.toLowerCase().includes('titanium')
      ) {
        return 'shadow-[0_0_20px_rgba(156,163,175,0.5)]';
      } // Motherboard form factors and compatibility
      if (
        filterId.toLowerCase().includes('atx') &&
        !filterId.toLowerCase().includes('micro') &&
        !filterId.toLowerCase().includes('mini')
      ) {
        return 'shadow-[0_0_20px_rgba(168,85,247,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('micro-atx') ||
        filterId.toLowerCase().includes('microatx')
      ) {
        return 'shadow-[0_0_20px_rgba(6,182,212,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('mini-itx') ||
        filterId.toLowerCase().includes('mini-atx') ||
        filterId.toLowerCase().includes('miniitx')
      ) {
        return 'shadow-[0_0_20px_rgba(236,72,153,0.5)]';
      }
      if (filterId.toLowerCase().includes('eatx')) {
        return 'shadow-[0_0_20px_rgba(79,70,229,0.5)]';
      }
      if (filterId.toLowerCase().includes('intel-compatible')) {
        return 'shadow-[0_0_20px_rgba(59,130,246,0.5)]';
      }
      if (filterId.toLowerCase().includes('amd-compatible')) {
        return 'shadow-[0_0_20px_rgba(249,115,22,0.5)]';
      } // RAM specifications
      if (filterId.toLowerCase().includes('ddr4')) {
        return 'shadow-[0_0_20px_rgba(99,102,241,0.5)]';
      }
      if (filterId.toLowerCase().includes('ddr5')) {
        return 'shadow-[0_0_20px_rgba(139,92,246,0.5)]';
      }
      if (filterId.toLowerCase().includes('16gb')) {
        return 'shadow-[0_0_20px_rgba(16,185,129,0.5)]';
      }
      if (filterId.toLowerCase().includes('32gb')) {
        return 'shadow-[0_0_20px_rgba(20,184,166,0.5)]';
      }
      if (filterId.toLowerCase().includes('64gb')) {
        return 'shadow-[0_0_20px_rgba(14,165,233,0.5)]';
      }
      if (filterId.toLowerCase().includes('128gb')) {
        return 'shadow-[0_0_20px_rgba(96,165,250,0.5)]';
      }
      if (filterId.toLowerCase().includes('256gb')) {
        return 'shadow-[0_0_20px_rgba(129,140,248,0.5)]';
      }
      // Storage types
      if (filterId.toLowerCase().includes('nvme')) {
        return 'shadow-[0_0_20px_rgba(239,68,68,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('sata-ssd') ||
        filterId.toLowerCase().includes('sata ssd')
      ) {
        return 'shadow-[0_0_20px_rgba(251,146,60,0.5)]';
      }
      if (filterId.toLowerCase().includes('hdd')) {
        return 'shadow-[0_0_20px_rgba(107,114,128,0.5)]';
      }
      // Cooling types
      if (
        filterId.toLowerCase().includes('air') &&
        filterId.toLowerCase().includes('cooling')
      ) {
        return 'shadow-[0_0_20px_rgba(14,165,233,0.5)]';
      }
      if (
        filterId.toLowerCase().includes('fluid') &&
        filterId.toLowerCase().includes('cooling')
      ) {
        return 'shadow-[0_0_20px_rgba(37,99,235,0.5)]';
      }
      return theme === 'dark'
        ? 'shadow-[0_0_20px_rgba(239,68,68,0.5)]'
        : 'shadow-[0_0_20px_rgba(37,99,235,0.4)]';
    },
    [theme]
  );
  const getFiltersByCategoryAndActiveCategory = useCallback(() => {
    if (!activeCategory) return [];
    const slugMapping: Record<string, string> = {
      cpu: 'cpu',
      gpu: 'gpu',
      motherboard: 'motherboard',
      ram: 'ram',
      storage: 'storage',
      case: 'case',
      psu: 'psu',
      cooling: 'cooling',
      services: 'services',
    };

    const key = slugMapping[activeCategory] || activeCategory;
    const categoryFilters = filters[key] || [];
    return categoryFilters;
  }, [activeCategory]);

  const filtersToShow = getFiltersByCategoryAndActiveCategory();
  const allFilters =
    filtersToShow.length > 0
      ? [{ id: null, name: t('common.all') || 'All' }, ...filtersToShow]
      : [];
  const totalFilterCount = allFilters.length;
  const maxIndex = Math.max(0, totalFilterCount - MAX_VISIBLE_ITEMS);
  const getActiveFilterIndex = useCallback(() => {
    return allFilters.findIndex(filter => {
      if (filter.id === null) {
        return Object.keys(activeFilters).length === 0; // "All" is active when no filters
      }
      return isQuickFilterActive && filter.id
        ? isQuickFilterActive(filter.id)
        : false;
    });
  }, [allFilters, activeFilters, isQuickFilterActive]);
  const ensureActiveFilterVisible = useCallback(() => {
    if (isUserScrolling) return;

    const activeFilterIndex = getActiveFilterIndex();

    if (activeFilterIndex === -1) return;

    if (activeFilterIndex < currentIndex) {
      setCurrentIndex(activeFilterIndex);
    } else if (activeFilterIndex >= currentIndex + MAX_VISIBLE_ITEMS) {
      setCurrentIndex(
        Math.min(maxIndex, activeFilterIndex - MAX_VISIBLE_ITEMS + 1)
      );
    }
  }, [
    getActiveFilterIndex,
    currentIndex,
    maxIndex,
    MAX_VISIBLE_ITEMS,
    isUserScrolling,
  ]);
  const scrollSafe = useCallback(
    (direction: 'left' | 'right') => {
      setIsUserScrolling(true);

      if (direction === 'left') {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else {
        setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
      }

      setTimeout(() => setIsUserScrolling(false), 500);
    },
    [maxIndex]
  );

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  const visibleFilters = allFilters.slice(
    currentIndex,
    currentIndex + MAX_VISIBLE_ITEMS
  );
  const handleFilterChange = useCallback(
    (filterId: string | null) => {
      setLastActiveFilter(filterId);
      if (currentOnFilterChange) {
        currentOnFilterChange(filterId);
      }
    },
    [currentOnFilterChange]
  );
  useEffect(() => {
    if (currentFilter !== lastActiveFilter) {
      ensureActiveFilterVisible();
    }
  }, [currentFilter, lastActiveFilter, ensureActiveFilterVisible]);

  useEffect(() => {
    if (currentFilter !== lastActiveFilter) {
      setLastActiveFilter(currentFilter || null);
    }
  }, [currentFilter, lastActiveFilter]);
  useEffect(() => {
    setCurrentIndex(0);
    setIsUserScrolling(false);
  }, [activeCategory]);

  if (filtersToShow.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative h-[45px] ${
        theme === 'dark'
          ? 'bg-dark-card border border-dark-border'
          : 'bg-white border border-neutral-200'
      } rounded-lg flex items-center overflow-hidden transition-colors duration-200`}
      ref={containerRef}
    >
      {' '}
      {canScrollLeft && (
        <button
          onClick={() => scrollSafe('left')}
          className={`absolute left-0 top-0 bottom-0 w-8 flex justify-center items-center z-10 group ${
            theme === 'dark'
              ? 'bg-dark-card hover:bg-gradient-to-r hover:from-blue-900/20 hover:to-purple-900/20'
              : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
          } rounded-l-lg transition-all duration-300`}
          aria-label="Scroll left"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-colors duration-300 ${
              theme === 'dark'
                ? 'text-neutral-400 group-hover:text-blue-400'
                : 'text-neutral-600 group-hover:text-blue-600'
            }`}
          />
        </button>
      )}{' '}
      <div className="flex items-center justify-start overflow-hidden mx-8 w-full transition-transform duration-300 ease-in-out">
        {visibleFilters.map((filter, index) => {
          const isActive =
            filter.id === null
              ? Object.keys(activeFilters).length === 0 // "All" is active when no filters are active
              : isQuickFilterActive && filter.id
                ? isQuickFilterActive(filter.id)
                : false;

          return (
            <button
              key={`${filter.id}-${index}`}
              className={`whitespace-nowrap flex-1 flex justify-center items-center text-sm font-medium h-[45px] relative 
                transition-all duration-300 ease-in-out transform 
                hover:scale-105 active:scale-95 
                ${getBrandGlow(filter.id, isActive)}
                ${
                  isActive
                    ? `${getBrandColor(filter.id, isActive)} ${getBrandUnderlineColor(filter.id)} after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:transition-all after:duration-300`
                    : `${getBrandColor(filter.id, isActive)} hover:shadow-md`
                }`}
              onClick={() => handleFilterChange(filter.id)}
            >
              {filter.name}
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scrollSafe('right')}
          className={`absolute right-0 top-0 bottom-0 w-8 flex justify-center items-center z-10 group ${
            theme === 'dark'
              ? 'bg-dark-card hover:bg-gradient-to-l hover:from-blue-900/20 hover:to-purple-900/20'
              : 'bg-white hover:bg-gradient-to-l hover:from-blue-50 hover:to-purple-50'
          } rounded-r-lg transition-all duration-300`}
          aria-label="Scroll right"
        >
          <ChevronRight
            className={`w-4 h-4 transition-colors duration-300 ${
              theme === 'dark'
                ? 'text-neutral-400 group-hover:text-blue-400'
                : 'text-neutral-600 group-hover:text-blue-600'
            }`}
          />
        </button>
      )}
    </div>
  );
};

export default QuickFilters;
