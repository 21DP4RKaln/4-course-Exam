'use client'

import { useTranslations } from 'next-intl'
import { Edit } from 'lucide-react'

interface Component {
  id: string
  name: string
  price: number
  description: string
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
}

interface SelectedComponentsListProps {
  components: Record<string, Component | undefined>
  categories: Category[]
  onEdit: (categoryId: string) => void
}

export default function SelectedComponentsList({
  components,
  categories,
  onEdit
}: SelectedComponentsListProps) {
  const t = useTranslations()

  const selectedComponentsCount = Object.values(components).filter(Boolean).length
  
  if (selectedComponentsCount === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t('configurator.selectedComponents')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No components selected yet. Start by selecting components from the categories on the left.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t('configurator.selectedComponents')}
      </h2>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {categories.map(category => {
          const component = components[category.id]
          
          return (
            <div key={category.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 text-gray-500 dark:text-gray-400">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  {component ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {component.name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                      Not selected
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                {component && (
                  <span className="text-sm font-medium text-gray-900 dark:text-white mr-4">
                    €{component.price.toFixed(2)}
                  </span>
                )}
                <button 
                  onClick={() => onEdit(category.id)}
                  className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  aria-label={`Edit ${category.name}`}
                >
                  <Edit size={18} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}