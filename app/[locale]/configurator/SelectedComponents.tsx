'use client'

import { useTranslations } from 'next-intl'
import { Edit2, X } from 'lucide-react'
import { ReactNode } from 'react'

interface Category {
  id: string
  name: string
  icon: ReactNode
}

interface SelectedComponentsListProps {
  components: Record<string, any>
  categories: Category[]
  onEdit: (categoryId: string) => void
}

export default function SelectedComponentsList({
  components,
  categories,
  onEdit
}: SelectedComponentsListProps) {
  const t = useTranslations()

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id)
  }

  const hasSelectedComponents = Object.keys(components).length > 0

  if (!hasSelectedComponents) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Selected Components
      </h2>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Object.entries(components).map(([categoryId, component]) => {
          const category = getCategoryById(categoryId)
          
          return (
            <div key={categoryId} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 text-gray-500 dark:text-gray-400">
                  {category?.icon}
                </span>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category?.name}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {component.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <p className="mr-4 font-semibold text-gray-900 dark:text-white">
                  €{component.price.toFixed(2)}
                </p>
                <button 
                  onClick={() => onEdit(categoryId)}
                  className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  title="Edit selection"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}