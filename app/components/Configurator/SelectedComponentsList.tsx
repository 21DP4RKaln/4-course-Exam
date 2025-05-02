'use client'

import React from 'react'
import { Check, AlertTriangle, Info } from 'lucide-react'
import { Component, Category } from './interfaces'
import { getCategoryIcon } from './utils'

interface SelectedComponentsListProps {
  selectedComponents: Record<string, Component | undefined>;
  componentCategories: Category[];
  configName: string;
  setConfigName: (name: string) => void;
  totalPrice: number;
  compatibilityIssues: string[];
  loading: boolean;
  onSetActiveCategory: (categoryId: string) => void;
  onSaveConfiguration: () => void;
  onSubmitConfiguration: () => void;
  onAddToCart: () => void;
  totalPowerConsumption: number;
  getRecommendedPsuWattage: () => string;
}

const SelectedComponentsList: React.FC<SelectedComponentsListProps> = ({
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
  totalPowerConsumption,
  getRecommendedPsuWattage
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Your Configuration
      </h2>
      
      {/* Configuration name field */}
      <div className="mb-4">
        <input
          type="text"
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
          placeholder="Configuration name"
        />
      </div>
      
      {/* Selected components */}
      <div className="space-y-3 mb-4">
        {Object.entries(selectedComponents)
          .filter(([_, component]) => component !== undefined)
          .map(([categoryId, component]) => {
            const category = componentCategories.find(cat => cat.id === categoryId);
            return (
              <div 
                key={categoryId}
                className="border border-gray-200 dark:border-gray-700 rounded p-3"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-3">
                    {getCategoryIcon(categoryId)}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {category?.name || categoryId}
                      </h3>
                      <button 
                        onClick={() => onSetActiveCategory(categoryId)}
                        className="ml-2 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {component!.name}
                    </p>
                    <div className="mt-1 text-right">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        €{component!.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
        {/* Empty slots */}
        {componentCategories
          .filter(category => !selectedComponents[category.id])
          .map(category => (
            <div 
              key={category.id}
              className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 hover:border-red-500 cursor-pointer"
              onClick={() => onSetActiveCategory(category.id)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-3">
                  {getCategoryIcon(category.id)}
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                    Click to select
                  </p>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      
      {/* PSU recommendation */}
      {totalPowerConsumption > 0 && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-start">
            <Info size={16} className="text-blue-500 mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <span className="font-medium">Recommended PSU:</span> {getRecommendedPsuWattage()} or higher
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Based on estimated power consumption of {totalPowerConsumption}W
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Compatibility warnings */}
      {compatibilityIssues.length > 0 && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Compatibility Issues</h3>
              <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 list-disc pl-5 space-y-1">
                {compatibilityIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Price & Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Price:</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            €{totalPrice.toFixed(2)}
          </span>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={onAddToCart}
            disabled={Object.keys(selectedComponents).length === 0}
            className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Add to Cart
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onSaveConfiguration}
              disabled={loading}
              className="py-2 px-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
            >
              Save as draft
            </button>
            
            <button
              onClick={onSubmitConfiguration}
              disabled={loading}
              className="py-2 px-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
            >
              Submit
            </button>
          </div>
        </div>
        
        {/* Compatibility status */}
        {Object.keys(selectedComponents).length > 0 && (
          <div className="mt-4 text-center">
            {compatibilityIssues.length === 0 ? (
              <div className="flex items-center justify-center text-green-600 dark:text-green-400 text-sm">
                <Check size={16} className="mr-1" /> 
                All components are compatible
              </div>
            ) : (
              <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-sm">
                <AlertTriangle size={16} className="mr-1" /> 
                Compatibility issues detected
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectedComponentsList