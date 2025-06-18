'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface FilterOption {
  id: string;
  name: string;
  count?: number;
  translationKey?: string;
}

export interface FilterGroup {
  title: string;
  options: FilterOption[];
  titleTranslationKey?: string;
}

interface Props {
  filterGroups?: FilterGroup[];
  activeFilters: Record<string, boolean>;
  onFiltersChange?: (filters: Record<string, boolean>) => void;
  onFilterChange?: (filters: Record<string, boolean>) => void;
  priceRange?: [number, number];
  onPriceChange?: (range: [number, number]) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  activeCategory: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  availableSpecifications?: any[];
  components?: any[];
}

const FilterSection: React.FC<Props> = ({
  filterGroups = [],
  activeFilters,
  onFiltersChange,
  onFilterChange,
  priceRange = [0, 50000],
  onPriceChange,
  onPriceRangeChange,
  activeCategory,
  minPrice = 0,
  maxPrice = 50000,
  searchQuery = '',
  onSearchChange,
  availableSpecifications = [],
  components = [],
}) => {
  const t = useTranslations();
  const { theme } = useTheme();

  // Animation variants
  const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const sectionVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: 'easeInOut' },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
  };

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    price: true, // Price filter is open by default
    'specs.cores': false,
    'specs.threads': false,
    'specs.socket': false,
    'specs.speed': false,
    manufacturer: false,
    frequency: false,
    rgb: false,
  });
  const [localPriceRange, setLocalPriceRange] =
    useState<[number, number]>(priceRange);

  // Update local price range when props change
  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);
  // Toggle filter option
  const toggleFilter = (filterId: string) => {
    const updatedFilters = { ...activeFilters };
    updatedFilters[filterId] = !updatedFilters[filterId];

    // Use whichever callback is available
    const callback = onFiltersChange || onFilterChange;
    if (callback) {
      callback(updatedFilters);
    }
  };

  // Toggle expand section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle min price change
  const handleMinPriceChange = (value: number) => {
    const newRange: [number, number] = [
      Math.min(value, localPriceRange[1]),
      localPriceRange[1],
    ];
    setLocalPriceRange(newRange);
  };

  // Handle max price change
  const handleMaxPriceChange = (value: number) => {
    const newRange: [number, number] = [
      localPriceRange[0],
      Math.max(value, localPriceRange[0]),
    ];
    setLocalPriceRange(newRange);
  };
  // Apply the price range
  const applyPriceRange = () => {
    const callback = onPriceChange || onPriceRangeChange;
    if (callback) {
      callback(localPriceRange);
    }
  };
  // Use dynamic filterGroups from props

  // Manufacturer filters for RAM
  const ramManufacturers = [
    { id: 'a-data', name: 'A-Data', count: 62 },
    { id: 'apacer', name: 'Apacer', count: 1 },
    { id: 'corsair', name: 'Corsair', count: 20 },
    { id: 'g-skill', name: 'G.Skill', count: 66 },
    { id: 'geil', name: 'GeiL', count: 1 },
    { id: 'gigabyte', name: 'Gigabyte', count: 3 },
    { id: 'kingston', name: 'Kingston', count: 57 },
  ];

  // RAM frequency range
  const ramFrequencyRange = {
    min: 1600,
    max: 8200,
  };

  // RGB options
  const rgbOptions = [
    { id: 'argb', name: 'ARGB', count: 3 },
    { id: 'rgb', name: 'RGB', count: 31 },
    { id: 'yes', name: 'да', count: 1 },
    { id: 'available', name: 'есть', count: 55 },
  ];

  return (
    <motion.aside
      className={`flex flex-col h-full p-1 min-w-[220px] w-[240px] max-w-[260px] ${
        theme === 'dark'
          ? 'bg-stone-950 border-neutral-800'
          : 'bg-white border-neutral-200'
      } border transition-colors duration-200`}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-col gap-4 mt-20"
        variants={sidebarVariants}
      >
        {/* Price Range Filter */}
        <motion.div className="flex flex-col gap-1" variants={sectionVariants}>
          <motion.button
            onClick={() => toggleSection('price')}
            className={`flex items-center justify-between w-full p-2 rounded-lg text-sm font-medium ${
              theme === 'dark'
                ? 'hover:bg-stone-900 text-white'
                : 'hover:bg-neutral-100 text-neutral-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <span>{t('filters.price')}</span>
            <motion.div
              animate={{ rotate: expandedSections.price ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {expandedSections.price ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections.price && (
              <motion.div
                className="flex flex-col gap-1.5 px-1"
                variants={expandVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                style={{ overflow: 'hidden' }}
              >
                <div className="grid grid-cols-2 gap-1">
                  <motion.input
                    type="number"
                    min={minPrice}
                    max={maxPrice}
                    value={localPriceRange[0]}
                    onChange={e => handleMinPriceChange(Number(e.target.value))}
                    className={`w-full p-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-stone-900 border-neutral-800 text-white placeholder-neutral-500'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'
                    } focus:outline-none focus:ring-2 ${
                      theme === 'dark'
                        ? 'focus:ring-brand-red-500/50'
                        : 'focus:ring-brand-blue-500/50'
                    }`}
                    placeholder={`${minPrice}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  />
                  <motion.input
                    type="number"
                    min={minPrice}
                    max={maxPrice}
                    value={localPriceRange[1]}
                    onChange={e => handleMaxPriceChange(Number(e.target.value))}
                    className={`w-full p-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-stone-900 border-neutral-800 text-white placeholder-neutral-500'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'
                    } focus:outline-none focus:ring-2 ${
                      theme === 'dark'
                        ? 'focus:ring-brand-red-500/50'
                        : 'focus:ring-brand-blue-500/50'
                    }`}
                    placeholder={`${maxPrice}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.15 }}
                  />
                </div>
                <motion.button
                  onClick={applyPriceRange}
                  className={`w-full p-2 rounded text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-brand-red-500 hover:bg-brand-red-600 text-white'
                      : 'bg-brand-blue-500 hover:bg-brand-blue-600 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  {t('configurator.filters.apply')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Specification Filters */}
        <AnimatePresence mode="popLayout">
          {filterGroups.map((group, index) => (
            <motion.div
              key={group.title}
              className="flex flex-col gap-2"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ delay: index * 0.05 }}
            >
              <motion.button
                onClick={() => toggleSection(group.title)}
                className={`flex items-center justify-between w-full p-2 rounded-lg text-sm font-medium ${
                  theme === 'dark'
                    ? 'hover:bg-stone-900 text-white'
                    : 'hover:bg-neutral-100 text-neutral-900'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <span>
                  {group.titleTranslationKey
                    ? t(group.titleTranslationKey)
                    : t(group.title)}
                </span>
                <motion.div
                  animate={{ rotate: expandedSections[group.title] ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {expandedSections[group.title] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {expandedSections[group.title] && (
                  <motion.div
                    className="flex flex-col gap-1 px-2"
                    variants={expandVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    style={{ overflow: 'hidden' }}
                  >
                    {group.options.map((option, optionIndex) => (
                      <motion.label
                        key={option.id}
                        className={`flex items-center gap-1 p-1.5 rounded-lg cursor-pointer text-sm ${
                          theme === 'dark'
                            ? 'hover:bg-stone-900 text-neutral-300'
                            : 'hover:bg-neutral-100 text-neutral-600'
                        }`}
                        whileHover={{ x: 2 }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: optionIndex * 0.03 + 0.1,
                        }}
                      >
                        <motion.input
                          type="checkbox"
                          checked={activeFilters[option.id] || false}
                          onChange={() => toggleFilter(option.id)}
                          className={`form-checkbox h-4 w-4 rounded border ${
                            theme === 'dark'
                              ? 'border-neutral-700 text-brand-red-500'
                              : 'border-neutral-300 text-brand-blue-500'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        />
                        <span>
                          {option.translationKey
                            ? t(option.translationKey)
                            : option.name}
                        </span>
                        {option.count && (
                          <motion.span
                            className={`ml-auto text-xs ${
                              theme === 'dark'
                                ? 'text-neutral-500'
                                : 'text-neutral-400'
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: optionIndex * 0.03 + 0.2 }}
                          >
                            ({option.count})
                          </motion.span>
                        )}
                      </motion.label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.aside>
  );
};

export default FilterSection;
