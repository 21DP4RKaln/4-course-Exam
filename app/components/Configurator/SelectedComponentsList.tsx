'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Monitor,
  HardDrive,
  Server,
  Zap,
  Fan,
  Box,
  X,
  AlertTriangle,
  Wrench,
  Download,
} from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';
import ResetButton from '@/app/components/ui/reset-button-animated';
import SaveButton from '@/app/components/ui/save-button';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Component {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId?: string;
  specifications?: any;
}

interface Props {
  selectedComponents: Record<string, Component | Component[]>;
  componentCategories: Category[];
  configName: string;
  setConfigName: (name: string) => void;
  totalPrice: number;
  compatibilityIssues: string[];
  loading: boolean;
  onSetActiveCategory: (category: string) => void;
  onSaveConfiguration: () => void;
  onSubmitConfiguration: () => void;
  onAddToCart: () => void;
  onResetConfiguration: () => void;
  onExportPDF: () => void;
  totalPowerConsumption: number;
  getRecommendedPsuWattage: () => string;
}

const SelectedComponentsList: React.FC<Props> = ({
  selectedComponents,
  componentCategories,
  configName,
  setConfigName,
  totalPrice,
  compatibilityIssues,
  loading,
  onSetActiveCategory,
  onSaveConfiguration,
  onSubmitConfiguration,
  onAddToCart,
  onResetConfiguration,
  onExportPDF,
  totalPowerConsumption,
  getRecommendedPsuWattage,
}) => {
  const t = useTranslations();
  const { theme } = useTheme();

  // Debug logging for selectedComponents changes
  useEffect(() => {
    console.log(
      '🎯 SelectedComponentsList: Components updated',
      selectedComponents
    );
    console.log('🎯 Component count:', Object.keys(selectedComponents).length);
  }, [selectedComponents]);

  // Generate default configuration name if none exists
  useEffect(() => {
    if (!configName || configName.trim() === '') {
      const configCount =
        parseInt(localStorage.getItem('configCounter') || '0') + 1;
      localStorage.setItem('configCounter', configCount.toString());
      setConfigName(`PC#${configCount}`);
    }
  }, [configName, setConfigName]);

  // Get category icon based on category id
  const getCategoryIcon = (categoryId: string) => {
    const iconColor =
      theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600';
    switch (categoryId) {
      case 'cpu':
        return <Cpu size={20} className={iconColor} />;
      case 'gpu':
        return <Monitor size={20} className={iconColor} />;
      case 'ram':
        return <HardDrive size={20} className={iconColor} />;
      case 'motherboard':
        return <Server size={20} className={iconColor} />;
      case 'psu':
        return <Zap size={20} className={iconColor} />;
      case 'cooling':
        return <Fan size={20} className={iconColor} />;
      case 'case':
        return <Box size={20} className={iconColor} />;
      case 'storage':
        return <HardDrive size={20} className={iconColor} />;
      case 'services':
        return <Wrench size={20} className={iconColor} />;
      default:
        return <HardDrive size={20} className={iconColor} />;
    }
  };

  // Only show relevant categories: exclude Optical and Network, and show Services only if selected
  const visibleCategories = componentCategories.filter(
    cat =>
      cat.id !== 'optical' &&
      cat.id !== 'network' &&
      (cat.id !== 'services' ||
        (Array.isArray(selectedComponents.services)
          ? selectedComponents.services.length > 0
          : !!selectedComponents.services))
  );

  // Count selected across visible categories
  const selectedCount = Object.keys(selectedComponents).reduce((count, key) => {
    if (key === 'services' && Array.isArray(selectedComponents.services)) {
      return count + selectedComponents.services.length;
    }
    return count + (selectedComponents[key] ? 1 : 0);
  }, 0);
  const totalCategories = visibleCategories.length;

  // Check if all required components are selected for PDF export
  const requiredCategories = [
    'cpu',
    'gpu',
    'motherboard',
    'ram',
    'storage',
    'psu',
    'case',
    'cooling',
  ];
  const hasAllRequiredComponents = requiredCategories.every(
    categoryId => selectedComponents[categoryId]
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const progressVariants = {
    hidden: { opacity: 0, scaleX: 0 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const componentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className={`w-[320px] max-w-full rounded-lg shadow-lg overflow-hidden transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-stone-950 border border-neutral-800'
          : 'bg-white border border-neutral-200'
      }`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className={`p-4 border-b ${
          theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'
        }`}
        variants={headerVariants}
      >
        <div className="flex items-center justify-between">
          <motion.h3
            className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {t('configurator.selectedComponents')}
          </motion.h3>
          <div className="flex items-center">
            <motion.div
              className="text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <span
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-neutral-900'
                }`}
              >
                {selectedCount}
              </span>
              <span
                className={
                  theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'
                }
              >
                /{totalCategories}
              </span>
            </motion.div>
          </div>
        </div>
        <motion.div className="mt-3" variants={progressVariants}>
          <div
            className={`h-2 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-stone-800' : 'bg-neutral-100'
            }`}
          >
            <motion.div
              className={`h-2 rounded-full transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-brand-red-600 to-brand-red-400'
                  : 'bg-gradient-to-r from-brand-blue-600 to-brand-blue-400'
              }`}
              style={{ width: `${(selectedCount / totalCategories) * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${(selectedCount / totalCategories) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Component List */}
      <div className="p-4 space-y-3 max-h-[800px] overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {visibleCategories.map((category, index) => {
            const selected = selectedComponents[category.id];
            const isSelected =
              category.id === 'services'
                ? Array.isArray(selected)
                  ? selected.length > 0
                  : !!selected
                : !!selected;

            return (
              <motion.button
                key={category.id}
                onClick={() => onSetActiveCategory(category.id)}
                className={`w-full p-3 rounded-lg transition-all flex items-center text-left ${
                  isSelected
                    ? theme === 'dark'
                      ? 'bg-brand-red-900/20 border border-brand-red-500/30 hover:bg-brand-red-900/30'
                      : 'bg-brand-blue-50 border border-brand-blue-200 hover:bg-brand-blue-100'
                    : theme === 'dark'
                      ? 'bg-stone-900 border border-neutral-800 hover:bg-stone-800'
                      : 'bg-neutral-50 border border-neutral-200 hover:bg-neutral-100'
                }`}
                variants={componentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                layout
                layoutId={`category-${category.id}`}
              >
                <motion.div
                  className="flex-shrink-0 mr-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {getCategoryIcon(category.id)}
                </motion.div>
                <div className="flex-grow min-w-0">
                  <div
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-neutral-900'
                    }`}
                  >
                    {category.name}
                  </div>
                  {isSelected && category.id !== 'services' && (
                    <motion.div
                      className={`text-xs truncate ${
                        theme === 'dark'
                          ? 'text-neutral-400'
                          : 'text-neutral-600'
                      }`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      {(selected as Component).name}
                    </motion.div>
                  )}
                  {isSelected &&
                    category.id === 'services' &&
                    Array.isArray(selected) && (
                      <motion.div
                        className={`text-xs truncate ${
                          theme === 'dark'
                            ? 'text-neutral-400'
                            : 'text-neutral-600'
                        }`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {selected.map((c: Component) => c.name).join(', ')}
                      </motion.div>
                    )}
                </div>
                {isSelected && category.id !== 'services' && (
                  <motion.div
                    className="flex items-center ml-2 flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                  >
                    <div
                      className={`text-sm font-medium ${
                        theme === 'dark'
                          ? 'text-brand-red-400'
                          : 'text-brand-blue-600'
                      }`}
                    >
                      €{(selected as Component).price.toFixed(2)}
                    </div>
                  </motion.div>
                )}
                {isSelected &&
                  category.id === 'services' &&
                  Array.isArray(selected) && (
                    <motion.div
                      className="flex items-center ml-2 flex-shrink-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                    >
                      <div
                        className={`text-sm font-medium ${
                          theme === 'dark'
                            ? 'text-brand-red-400'
                            : 'text-brand-blue-600'
                        }`}
                      >
                        €
                        {selected
                          .reduce(
                            (sum: number, c: Component) => sum + c.price,
                            0
                          )
                          .toFixed(2)}
                      </div>
                    </motion.div>
                  )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Compatibility Issues - Only show critical power-related issues */}
      <AnimatePresence>
        {compatibilityIssues.filter(
          issue =>
            issue.includes('power') ||
            issue.includes('wattage') ||
            issue.includes('consumption')
        ).length > 0 && (
          <motion.div
            className={`mx-4 mb-4 p-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-500/30'
                : 'bg-red-50 border-red-200'
            }`}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <AlertTriangle
                  size={16}
                  className={`mt-0.5 mr-2 flex-shrink-0 ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-500'
                  }`}
                />
              </motion.div>
              <div>
                <motion.h4
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-700'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                >
                  {t('configurator.compatibilityIssues')}
                </motion.h4>
                <motion.ul
                  className={`text-xs mt-1 space-y-1 ${
                    theme === 'dark' ? 'text-red-300' : 'text-red-600'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {compatibilityIssues
                    .filter(
                      issue =>
                        issue.includes('power') ||
                        issue.includes('wattage') ||
                        issue.includes('consumption')
                    )
                    .map((issue, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: 0.25 + index * 0.05,
                        }}
                      >
                        • {issue}
                      </motion.li>
                    ))}
                </motion.ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total Price and Actions */}
      <motion.div
        className={`p-4 border-t ${
          theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'
        }`}
        variants={buttonVariants}
      >
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span
            className={`text-sm font-medium ${
              theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
            }`}
          >
            {t('configurator.totalPrice')}:
          </span>
          <motion.span
            className={`text-lg font-bold ${
              theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
            }`}
            key={totalPrice}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            €{totalPrice.toFixed(2)}
          </motion.span>
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 gap-2">
            {/* PDF Export Button - using save-button component */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <SaveButton
                onClick={onExportPDF}
                disabled={!hasAllRequiredComponents}
              />
            </motion.div>
            {/* Reset Button - using reset-button component */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ResetButton
                onClick={onResetConfiguration}
                disabled={selectedCount === 0}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SelectedComponentsList;
