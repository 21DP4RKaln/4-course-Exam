'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Component, Category } from './interfaces'
import { getCategoryIcon } from './utils'

interface CategoryListProps {
  categories: Category[];
  activeCategory: string;
  selectedComponents: Record<string, Component | undefined>;
  onSetActiveCategory: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  activeCategory,
  selectedComponents,
  onSetActiveCategory
}) => {
  const t = useTranslations()
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg h-auto">
      <nav>
        {categories.map(category => {
          const isActive = activeCategory === category.id;
          const isSelected = Boolean(selectedComponents[category.id]);
          
          return (
            <button
              key={category.id}
              onClick={() => onSetActiveCategory(category.id)}
              className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600/10 dark:bg-brand-red-600/10 text-indigo-500 dark:text-brand-red-500 border-r-4 border-indigo-600 dark:border-brand-red-600'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <span className="mr-3 text-lg opacity-75">
                {getCategoryIcon(category.id)}
              </span>
              <span className="flex-1 text-left font-medium">
                {t(`components.${category.id}`)}
              </span>
              {isSelected && (
                <span className="ml-3 text-green-400 opacity-75">✓</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  )
}

export default CategoryList