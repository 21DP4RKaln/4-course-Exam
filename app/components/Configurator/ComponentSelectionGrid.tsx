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
    <div className="space-y-4">
      {components.map((component) => (
        <div 
          key={component.id}
          className={`flex h-32 border rounded-lg transition-all duration-200 ${
            selectedComponent?.id === component.id 
              ? 'border-indigo-500 dark:border-brand-red-500 bg-indigo-50 dark:bg-brand-red-900/20' 
              : 'border-gray-700 hover:border-indigo-500 dark:hover:border-brand-red-500 bg-gray-800'
          }`}
        >
          {/* Component Image */}
          <div className="h-full w-32 relative bg-gray-900 flex-shrink-0 overflow-hidden rounded-l-lg">
            <Image
              src={(component.imageUrl || '/images/Default-image.png').trim()}
              alt={component.name}
              fill
              className="object-contain p-2"
            />
          </div>

          {/* Component Info */}
          <div className="flex-grow flex flex-col justify-between p-4">
            <div>
              <h3 className="font-medium text-white text-base mb-1">
                {component.name}
              </h3>
              
              {/* Key Specifications */}
              {component.specifications && (
                <p className="text-sm text-gray-400">
                  {Object.entries(component.specifications)
                    .filter(([key]) => !key.toLowerCase().includes('url'))
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' • ')}
                </p>
              )}
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-bold text-white">
                €{component.price.toFixed(2)}
              </span>
              <button
                onClick={() => onSelectComponent(component)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedComponent?.id === component.id
                    ? 'bg-indigo-600 dark:bg-brand-red-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-indigo-600 dark:hover:bg-brand-red-600'
                }`}
              >
                {selectedComponent?.id === component.id 
                  ? t('buttons.selected') 
                  : t('buttons.select')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ComponentSelectionGrid