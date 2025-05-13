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
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {t('configurator.categoryList.selectCategory')}
      </h2>
      
      <ul className="space-y-2">
        {categories.map(category => (
          <li key={category.id}>
            <button
              className={`w-full flex items-center px-3 py-2 rounded ${
                activeCategory === category.id
                  ? 'bg-brand-blue-500 dark:bg-brand-red-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-stone-950 hover:text-brand-blue-600 dark:hover:text-brand-red-500'
              }`}
              onClick={() => onSetActiveCategory(category.id)}
            >
              <span className="mr-3 flex-shrink-0">{getCategoryIcon(category.id)}</span>
              <span className="flex-grow text-left">{t(`components.${category.id}`)}</span>
              {selectedComponents[category.id] && (
                <span className="ml-auto text-green-500 dark:text-green-400">✓</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CategoryList