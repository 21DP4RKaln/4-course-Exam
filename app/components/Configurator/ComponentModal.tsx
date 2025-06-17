'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  X,
  Cpu,
  Monitor,
  HardDrive,
  Server,
  Zap,
  Fan,
  Box,
} from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { formatPrice } from '@/lib/utils';
import { Component } from './types';

interface ComponentModalProps {
  component: Component | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onSelect: (component: Component) => void;
}

const ComponentModal: React.FC<ComponentModalProps> = ({
  component,
  isOpen,
  onClose,
  isSelected,
  onSelect,
}) => {
  const t = useTranslations();
  const { theme } = useTheme();

  if (!isOpen || !component) return null;

  const getComponentImage = () => {
    const iconColor =
      theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600';
    const bgColor =
      theme === 'dark'
        ? 'bg-brand-red-500/10 border border-brand-red-500/20'
        : 'bg-brand-blue-500/10 border border-brand-blue-500/20';

    // Show image if provided
    if (component.imageUrl) {
      return (
        <div
          className={`${bgColor} h-24 w-24 rounded-lg overflow-hidden flex items-center justify-center`}
        >
          <img
            src={component.imageUrl}
            alt={component.name}
            className="object-contain h-full w-full"
          />
        </div>
      );
    }

    // Fallback to category icon
    return (
      <div
        className={`${bgColor} h-24 w-24 rounded-lg flex items-center justify-center`}
      >
        {getCategoryIcon(component.categoryId || '', iconColor)}
      </div>
    );
  };

  const getCategoryIcon = (categoryId: string, colorClass: string) => {
    const size = 48;
    switch (categoryId) {
      case 'cpu':
        return <Cpu size={size} className={colorClass} />;
      case 'gpu':
        return <Monitor size={size} className={colorClass} />;
      case 'ram':
        return <HardDrive size={size} className={colorClass} />;
      case 'motherboard':
        return <Server size={size} className={colorClass} />;
      case 'psu':
        return <Zap size={size} className={colorClass} />;
      case 'cooling':
        return <Fan size={size} className={colorClass} />;
      case 'case':
        return <Box size={size} className={colorClass} />;
      case 'storage':
        return <HardDrive size={size} className={colorClass} />;
      default:
        return <Box size={size} className={colorClass} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`max-w-md w-full max-h-[90vh] overflow-y-auto rounded-lg ${
          theme === 'dark'
            ? 'bg-stone-900 border border-neutral-800'
            : 'bg-white border border-neutral-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3
            className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-neutral-900'
            }`}
          >
            {t('configurator.componentDetails')}
          </h3>
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
        <div className="p-4 space-y-4">
          {/* Component Image and Title */}
          <div className="flex items-center space-x-4">
            {getComponentImage()}
            <div className="flex-1">
              <h4
                className={`font-medium text-lg ${
                  theme === 'dark' ? 'text-white' : 'text-neutral-900'
                }`}
              >
                {component.name}
              </h4>
              {component.description && (
                <p
                  className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
                  }`}
                >
                  {component.description}
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
              }`}
            >
              {t('configurator.price')}:
            </span>
            <div className="text-right">
              {component.discountPrice &&
              component.discountPrice < component.price ? (
                <>
                  <div
                    className={`text-xl font-bold ${
                      theme === 'dark'
                        ? 'text-brand-red-400'
                        : 'text-brand-blue-600'
                    }`}
                  >
                    €{formatPrice(component.discountPrice)}
                  </div>
                  <div
                    className={`text-sm line-through ${
                      theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    €{formatPrice(component.price)}
                  </div>
                </>
              ) : (
                <div
                  className={`text-xl font-bold ${
                    theme === 'dark'
                      ? 'text-brand-red-400'
                      : 'text-brand-blue-600'
                  }`}
                >
                  €{formatPrice(component.price)}
                </div>
              )}
            </div>
          </div>

          {/* Stock Status */}
          {component.stock !== undefined && component.stock <= 5 && (
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
                }`}
              >
                {t('configurator.stock')}:
              </span>
              <div
                className={`text-sm font-medium ${
                  component.stock === 0
                    ? 'text-red-500'
                    : theme === 'dark'
                      ? 'text-yellow-400'
                      : 'text-yellow-600'
                }`}
              >
                {component.stock === 0
                  ? t('outOfStock')
                  : `${component.stock} ${t('inStock')}`}
              </div>
            </div>
          )}

          {/* Specifications */}
          {component.specifications &&
            Object.keys(component.specifications).length > 0 && (
              <div>
                <h5
                  className={`font-medium text-sm mb-3 ${
                    theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
                  }`}
                >
                  {t('configurator.specifications')}:
                </h5>
                <div className="space-y-2">
                  {Object.entries(component.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'text-neutral-400'
                              : 'text-neutral-600'
                          }`}
                        >
                          {t(`configurator.specs.${key}`, {
                            defaultMessage: key,
                          })}
                          :
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            theme === 'dark'
                              ? 'text-brand-red-400'
                              : 'text-brand-blue-600'
                          }`}
                        >
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Action Button */}
          <div className="pt-4">
            <button
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isSelected
                  ? theme === 'dark'
                    ? 'bg-brand-red-500/20 text-brand-red-400 border border-brand-red-500/30'
                    : 'bg-brand-blue-500/20 text-brand-blue-600 border border-brand-blue-500/30'
                  : theme === 'dark'
                    ? 'bg-brand-red-500 text-white hover:bg-brand-red-600'
                    : 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
              } ${component.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (component.stock !== 0) {
                  onSelect(component);
                  onClose();
                }
              }}
              disabled={component.stock === 0}
            >
              {component.stock === 0
                ? t('buttons.outOfStock')
                : isSelected
                  ? t('buttons.selected')
                  : t('buttons.select')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentModal;
