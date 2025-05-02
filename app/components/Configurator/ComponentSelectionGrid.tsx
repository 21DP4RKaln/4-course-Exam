'use client'

import React from 'react'
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
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (components.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        No components available in this category.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {components.map((component) => (
        <div 
          key={component.id}
          className={`border rounded-lg p-3 cursor-pointer ${
            selectedComponent?.id === component.id 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 bg-white dark:bg-gray-800'
          }`}
          onClick={() => onSelectComponent(component)}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-3">
              <span className="text-gray-500 text-xs">{activeCategory}</span>
            </div>
            
            <div className="flex-grow">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {component.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                {component.description || 'No description available'}
              </p>
            </div>
            
            <div className="ml-3 text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                €{component.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ComponentSelectionGrid