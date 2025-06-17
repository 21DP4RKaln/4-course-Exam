'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  Check,
  RotateCcw,
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
  return (
    <div
      className={`w-[320px] max-w-full rounded-lg shadow-lg overflow-hidden transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-stone-950 border border-neutral-800'
          : 'bg-white border border-neutral-200'
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b ${
          theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className={theme === 'dark' ? 'text-white' : 'text-neutral-900'}>
            {t('configurator.selectedComponents')}
          </h3>
          <div className="flex items-center">
            <div className="text-sm">
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
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`h-2 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-stone-800' : 'bg-neutral-100'
            }`}
          >
            <div
              className={`h-2 rounded-full transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-brand-red-600 to-brand-red-400'
                  : 'bg-gradient-to-r from-brand-blue-600 to-brand-blue-400'
              }`}
              style={{ width: `${(selectedCount / totalCategories) * 100}%` }}
            />
          </div>
        </div>
      </div>{' '}
      {/* Component List */}
      <div className="p-4 space-y-3 max-h-[800px] overflow-y-auto scrollbar-hide">
        {visibleCategories.map(category => {
          const selected = selectedComponents[category.id];
          const isSelected =
            category.id === 'services'
              ? Array.isArray(selected)
                ? selected.length > 0
                : !!selected
              : !!selected;

          return (
            <button
              key={category.id}
              onClick={() => onSetActiveCategory(category.id)}
              className={`w-full flex items-center p-2 rounded-lg transition-all ${
                theme === 'dark'
                  ? isSelected
                    ? 'bg-stone-900 hover:bg-stone-800'
                    : 'border border-dashed border-neutral-800 hover:border-brand-red-500/50'
                  : isSelected
                    ? 'bg-neutral-50 hover:bg-neutral-100'
                    : 'border border-dashed border-neutral-200 hover:border-brand-blue-500/50'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  theme === 'dark' ? 'bg-stone-800' : 'bg-neutral-100'
                }`}
              >
                {getCategoryIcon(category.id)}
              </span>
              <div className="flex-grow text-left min-w-0">
                <div
                  className={`text-sm font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-neutral-900'
                  }`}
                >
                  {category.name}
                </div>
                {isSelected && category.id !== 'services' && (
                  <div
                    className={`text-xs truncate ${
                      theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
                    }`}
                  >
                    {(selected as Component).name}
                  </div>
                )}
                {isSelected &&
                  category.id === 'services' &&
                  Array.isArray(selected) && (
                    <div
                      className={`text-xs truncate ${
                        theme === 'dark'
                          ? 'text-neutral-400'
                          : 'text-neutral-600'
                      }`}
                    >
                      {selected.map((c: Component) => c.name).join(', ')}
                    </div>
                  )}
              </div>
              {isSelected && category.id !== 'services' && (
                <div className="flex items-center ml-2 flex-shrink-0">
                  <div
                    className={`text-sm font-medium ${
                      theme === 'dark'
                        ? 'text-brand-red-400'
                        : 'text-brand-blue-600'
                    }`}
                  >
                    €{(selected as Component).price.toFixed(2)}
                  </div>
                </div>
              )}
              {isSelected &&
                category.id === 'services' &&
                Array.isArray(selected) && (
                  <div className="flex items-center ml-2 flex-shrink-0">
                    <div
                      className={`text-sm font-medium ${
                        theme === 'dark'
                          ? 'text-brand-red-400'
                          : 'text-brand-blue-600'
                      }`}
                    >
                      €
                      {selected
                        .reduce((sum: number, c: Component) => sum + c.price, 0)
                        .toFixed(2)}
                    </div>
                  </div>
                )}
            </button>
          );
        })}
      </div>{' '}
      {/* Compatibility Issues - Only show critical power-related issues */}
      {compatibilityIssues.filter(
        issue =>
          issue.includes('psuTooWeak') ||
          issue.includes('psuCriticallyUnderpowered') ||
          issue.includes('insufficientPowerConnectors')
      ).length > 0 && (
        <div
          className={`mx-4 mb-4 p-3 rounded-lg ${
            theme === 'dark'
              ? 'bg-red-900/20 border border-red-800'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div
            className={`flex items-center gap-2 text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}
          >
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span className="truncate">
              {t('configurator.compatibility.issuesFound')}
            </span>
          </div>
          <ul
            className={`text-xs space-y-1 max-h-20 overflow-y-auto scrollbar-hide ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}
          >
            {compatibilityIssues
              .filter(
                issue =>
                  issue.includes('psuTooWeak') ||
                  issue.includes('psuCriticallyUnderpowered') ||
                  issue.includes('insufficientPowerConnectors')
              )
              .map((issue, index) => (
                <li key={index} className="break-words">
                  {issue}
                </li>
              ))}
          </ul>
        </div>
      )}
      {/* Summary & Actions */}
      <div
        className={`p-4 border-t ${
          theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'
        }`}
      >
        <div className="space-y-4">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span
              className={
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              }
            >
              Total:
            </span>
            <span
              className={`text-lg font-bold ${
                theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
              }`}
            >
              €{totalPrice.toFixed(2)}
            </span>
          </div>{' '}
          {/* Configuration Name Input */}
          <div className="mt-2">
            <input
              type="text"
              value={configName || ''}
              onChange={e => setConfigName(e.target.value)}
              placeholder="PC#1"
              className={`w-full p-2 rounded border text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-stone-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-brand-red-500'
                  : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-brand-blue-500'
              } focus:outline-none`}
            />
          </div>
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onSaveConfiguration}
              className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors truncate ${
                theme === 'dark'
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              {t('configurator.actions.save')}
            </button>
            <button
              onClick={onAddToCart}
              className={`px-2 py-2 rounded-lg text-sm font-medium text-white transition-colors truncate ${
                theme === 'dark'
                  ? 'bg-brand-red-500 hover:bg-brand-red-600'
                  : 'bg-brand-blue-500 hover:bg-brand-blue-600'
              } disabled:opacity-50`}
              disabled={selectedCount === 0 || compatibilityIssues.length > 0}
            >
              {t('configurator.actions.addToCart')}
            </button>
          </div>
          {/* PDF and Reset Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* PDF Export Button - using save-button component */}
            <SaveButton
              onClick={onExportPDF}
              disabled={!hasAllRequiredComponents}
            />
            {/* Reset Button - using reset-button component */}
            <ResetButton
              onClick={onResetConfiguration}
              disabled={selectedCount === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedComponentsList;
