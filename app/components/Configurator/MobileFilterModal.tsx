'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const modalVariants = {
    hidden: {
      y: '100%',
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  };

  const expandVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      y: -5,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      y: 0,
      transition: {
        height: { duration: 0.3, ease: 'easeInOut' },
        opacity: { duration: 0.2, delay: 0.1 },
        y: { duration: 0.2, delay: 0.1 },
      },
    },
  };

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className={`w-full max-h-[90vh] overflow-hidden rounded-t-xl ${
              theme === 'dark'
                ? 'bg-stone-900 border-t border-neutral-800'
                : 'bg-white border-t border-neutral-200'
            }`}
            variants={modalVariants}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800"
              variants={headerVariants}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Filter
                    size={20}
                    className={
                      theme === 'dark'
                        ? 'text-brand-red-400'
                        : 'text-brand-blue-600'
                    }
                  />
                </motion.div>
                <motion.h3
                  className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-neutral-900'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {t('configurator.filters')}
                </motion.h3>
                <AnimatePresence>
                  {activeFilterCount > 0 && (
                    <motion.span
                      className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark'
                          ? 'bg-brand-red-500/20 text-brand-red-400'
                          : 'bg-brand-blue-500/20 text-brand-blue-600'
                      }`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    >
                      {activeFilterCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-stone-800 text-neutral-400 hover:text-white'
                    : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <X size={20} />
              </motion.button>
            </motion.div>

            {/* Content */}
            <motion.div
              className="overflow-y-auto max-h-[60vh] p-4"
              variants={contentVariants}
            >
              {/* Price Range */}
              <motion.div className="mb-6" variants={sectionVariants}>
                <motion.h4
                  className={`font-medium text-sm mb-3 ${
                    theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {t('configurator.priceRange')}
                </motion.h4>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <motion.span
                      className={
                        theme === 'dark'
                          ? 'text-neutral-400'
                          : 'text-neutral-600'
                      }
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.15 }}
                    >
                      €{priceRange[0]}
                    </motion.span>
                    <motion.span
                      className={
                        theme === 'dark'
                          ? 'text-neutral-400'
                          : 'text-neutral-600'
                      }
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.15 }}
                    >
                      €{priceRange[1]}
                    </motion.span>
                  </div>
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
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
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Filter Groups */}
              {filterGroups.map((group, index) => (
                <motion.div
                  key={group.title}
                  className="mb-4"
                  variants={sectionVariants}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.button
                    onClick={() => toggleGroup(group.title)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-stone-800 text-white'
                        : 'hover:bg-neutral-100 text-neutral-900'
                    }`}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.span
                      className="font-medium text-sm"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      {group.titleTranslationKey
                        ? t(group.titleTranslationKey)
                        : group.title}
                    </motion.span>
                    <motion.div
                      animate={{
                        rotate: expandedGroups[group.title] ? 180 : 0,
                      }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      {expandedGroups[group.title] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {expandedGroups[group.title] && (
                      <motion.div
                        className="mt-2 space-y-2 pl-3"
                        variants={expandVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        style={{ overflow: 'hidden' }}
                      >
                        {group.options.map((option, optionIndex) => (
                          <motion.label
                            key={option.id}
                            className="flex items-center space-x-3 cursor-pointer"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: optionIndex * 0.05 + 0.1,
                            }}
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <motion.input
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
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ duration: 0.1 }}
                            />
                            <motion.span
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-neutral-300'
                                  : 'text-neutral-700'
                              }`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                duration: 0.2,
                                delay: optionIndex * 0.05 + 0.15,
                              }}
                            >
                              {option.translationKey
                                ? t(option.translationKey)
                                : option.name}
                              {option.count && (
                                <motion.span
                                  className={`ml-1 text-xs ${
                                    theme === 'dark'
                                      ? 'text-neutral-500'
                                      : 'text-neutral-400'
                                  }`}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: optionIndex * 0.05 + 0.2,
                                  }}
                                >
                                  ({option.count})
                                </motion.span>
                              )}
                            </motion.span>
                          </motion.label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>

            {/* Footer */}
            <motion.div
              className="p-4 border-t border-neutral-200 dark:border-neutral-800"
              variants={footerVariants}
            >
              <motion.div
                className="flex space-x-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.button
                  onClick={clearAllFilters}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium border transition-colors ${
                    theme === 'dark'
                      ? 'border-neutral-600 text-neutral-300 hover:bg-stone-800 hover:text-white'
                      : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {t('configurator.clearFilters')}
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-brand-red-500 text-white hover:bg-brand-red-600'
                      : 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
                  }`}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {t('configurator.applyFilters')}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileFilterModal;
