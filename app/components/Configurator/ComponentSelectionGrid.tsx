'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Component } from './interfaces'

interface ComponentSelectionGridProps {
  components: Component[];
  selectedComponent: Component | undefined;
  onSelectComponent: (component: Component) => void;
  activeCategory: string;
  isLoading: boolean;
}

const ComponentSelectionGrid: React.FC<ComponentSelectionGridProps> = ({
  components,
  selectedComponent,
  onSelectComponent,
  activeCategory,
  isLoading
}) => {
  const t = useTranslations()
  
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue-500 dark:border-brand-red-500"></div>
      </div>
    )
  }

  if (components.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        {t('configurator.componentGrid.noComponents')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {components.map((component) => (
        <div 
          key={component.id}
          className={`flex h-32 border rounded-lg transition-all duration-200 ${
            selectedComponent?.id === component.id 
              ? 'border-brand-blue-500 dark:border-brand-red-500 bg-brand-blue-50 dark:bg-brand-red-900/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-brand-blue-500 dark:hover:border-brand-red-500 bg-white dark:bg-gray-800'
          }`}
        >
          {/* Component Image */}
          <div className="h-full w-32 relative bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden rounded-l-lg">
            <Image
              src={(component.imageUrl || '/images/Default-image.png').trim()}
              alt={component.name}
              fill
              className="object-contain p-2"
            />
          </div>
          
          {/* Component Info */}
          <div className="flex-grow p-3">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {component.name}
            </h3>
            
            {/* Key Specifications */}
            <div className="mt-1">
              {activeCategory === 'cpu' && component.specifications && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {component.specifications.cores && `${t('specs.cores')}: ${component.specifications.cores}`}
                  {component.specifications.threads && ` | ${t('specs.threads')}: ${component.specifications.threads}`}
                  {component.specifications.baseClock && ` | ${t('specs.baseClock')}: ${component.specifications.baseClock}`}
                </p>
              )}
              {/* Similar compact specs for other categories */}
            </div>
          </div>
          
          {/* Price and Actions */}
          <div className="p-3 flex-shrink-0 flex flex-col justify-between border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <p className="font-bold text-xl text-gray-900 dark:text-white">
                €{component.price.toFixed(2)}
              </p>
              <button
                onClick={() => onSelectComponent(component)}
                className="px-4 py-2 bg-brand-blue-600 dark:bg-brand-red-600 text-white text-sm rounded hover:bg-brand-blue-700 dark:hover:bg-brand-red-700 transition-colors"
              >
                {selectedComponent?.id === component.id ? t('buttons.selected') : t('buttons.select')}
              </button>
            </div>
            <button
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('buttons.compare')}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ComponentSelectionGrid