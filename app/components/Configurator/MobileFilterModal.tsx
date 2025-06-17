'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { FilterGroup } from './FilterSection';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterGroups: FilterGroup[];
  activeFilters: Record<string, boolean>;
  onFiltersChange: (filters: Record<string, boolean>) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  minPrice: number;
  maxPrice: number;
}

const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  onClose,
  filterGroups,
  activeFilters,
  onFiltersChange,
  priceRange,
  onPriceChange,
  minPrice,
  maxPrice,
}) => {
  const t = useTranslations();
  const { theme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  if (!isOpen) return null;

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const handleFilterChange = (filterId: string, checked: boolean) => {
    const updatedFilters = {
      ...activeFilters,
      [filterId]: checked,
    };

    // Remove false values to clean up the object
    Object.keys(updatedFilters).forEach(key => {
      if (!updatedFilters[key]) {
        delete updatedFilters[key];
      }
    });

    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    onPriceChange([minPrice, maxPrice]);
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    key => activeFilters[key]
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div
        className={`w-full max-h-[90vh] overflow-hidden rounded-t-xl ${
          theme === 'dark'
            ? 'bg-stone-900 border-t border-neutral-800'
            : 'bg-white border-t border-neutral-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center space-x-2">
            <Filter
              size={20}
              className={
                theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
              }
            />
            <h3
              className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-neutral-900'
              }`}
            >
              {t('configurator.filters')}
            </h3>
            {activeFilterCount > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  theme === 'dark'
                    ? 'bg-brand-red-500/20 text-brand-red-400'
                    : 'bg-brand-blue-500/20 text-brand-blue-600'
                }`}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-stone-800 text-neutral-400 hover:text-white'
                : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {/* Price Range */}
          <div className="mb-6">
            <h4
              className={`font-medium text-sm mb-3 ${
                theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
              }`}
            >
              {t('configurator.priceRange')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span
                  className={
                    theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
                  }
                >
                  €{priceRange[0]}
                </span>
                <span
                  className={
                    theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
                  }
                >
                  €{priceRange[1]}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={e =>
                    onPriceChange([parseInt(e.target.value), priceRange[1]])
                  }
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-stone-700 slider-thumb-dark'
                      : 'bg-neutral-300 slider-thumb-light'
                  }`}
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={e =>
                    onPriceChange([priceRange[0], parseInt(e.target.value)])
                  }
                  className={`absolute top-0 w-full h-2 rounded-lg appearance-none cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-stone-700 slider-thumb-dark'
                      : 'bg-neutral-300 slider-thumb-light'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Filter Groups */}
          {filterGroups.map(group => (
            <div key={group.title} className="mb-4">
              <button
                onClick={() => toggleGroup(group.title)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-stone-800 text-white'
                    : 'hover:bg-neutral-100 text-neutral-900'
                }`}
              >
                <span className="font-medium text-sm">
                  {group.titleTranslationKey
                    ? t(group.titleTranslationKey)
                    : group.title}
                </span>
                {expandedGroups[group.title] ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {expandedGroups[group.title] && (
                <div className="mt-2 space-y-2 pl-3">
                  {group.options.map(option => (
                    <label
                      key={option.id}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters[option.id] || false}
                        onChange={e =>
                          handleFilterChange(option.id, e.target.checked)
                        }
                        className={`rounded border-2 ${
                          theme === 'dark'
                            ? 'border-neutral-600 bg-stone-800 text-brand-red-500 focus:ring-brand-red-500'
                            : 'border-neutral-300 bg-white text-brand-blue-500 focus:ring-brand-blue-500'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          theme === 'dark'
                            ? 'text-neutral-300'
                            : 'text-neutral-700'
                        }`}
                      >
                        {option.translationKey
                          ? t(option.translationKey)
                          : option.name}
                        {option.count && (
                          <span
                            className={`ml-1 text-xs ${
                              theme === 'dark'
                                ? 'text-neutral-500'
                                : 'text-neutral-400'
                            }`}
                          >
                            ({option.count})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex space-x-3">
            <button
              onClick={clearAllFilters}
              className={`flex-1 py-3 px-4 rounded-lg font-medium border transition-colors ${
                theme === 'dark'
                  ? 'border-neutral-600 text-neutral-300 hover:bg-stone-800 hover:text-white'
                  : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {t('configurator.clearFilters')}
            </button>
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-brand-red-500 text-white hover:bg-brand-red-600'
                  : 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
              }`}
            >
              {t('configurator.applyFilters')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterModal;
