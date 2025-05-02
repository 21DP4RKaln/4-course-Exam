'use client'

import React from 'react'
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
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-lg font-medium text-white mb-4">
        Select a component category
      </h2>
      
      <ul className="space-y-2">
        {categories.map(category => (
          <li key={category.id}>
            <button
              className={`w-full flex items-center px-3 py-2 rounded ${
                activeCategory === category.id
                  ? 'bg-gray-800 text-red-500'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => onSetActiveCategory(category.id)}
            >
              <span className="mr-3">{getCategoryIcon(category.id)}</span>
              <span>{category.name}</span>
              {selectedComponents[category.id] && (
                <span className="ml-auto text-green-500">✓</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CategoryList