'use client'

import { useTranslations } from 'next-intl'
import { Edit, Cpu } from 'lucide-react'
import Image from 'next/image'

interface Component {
  id: string
  name: string
  price: number
  description: string
  imageUrl?: string
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
  
  const selectedComponents = Object.entries(components)
    .filter(([_, component]) => component !== undefined)
    .map(([categoryId, component]) => ({
      categoryId,
      component: component as Component,
      category: categories.find(cat => cat.id === categoryId)
    }));

  const selectedComponentsCount = selectedComponents.length;
  
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {selectedComponents.map(({ categoryId, component, category }) => (
          <div 
            key={categoryId}
            className="border rounded-lg p-4 hover:border-red-500 transition-colors border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              {/* Placeholder for component image */}
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-4">
                {component.imageUrl ? (
                  <Image 
                    src={component.imageUrl} 
                    alt={component.name} 
                    width={64} 
                    height={64} 
                    className="object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">{category?.name || categoryId}</span>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {category?.name || categoryId}
                  </h3>
                  <button 
                    onClick={() => onEdit(categoryId)}
                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    aria-label={`Edit ${category?.name || categoryId}`}
                  >
                    <Edit size={18} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {component.name}
                </p>
                <div className="mt-1 flex justify-end">
                  <span className="font-bold text-gray-900 dark:text-white">
                    €{component.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Show empty slots for categories that haven't been selected yet */}
        {categories
          .filter(category => !components[category.id])
          .map(category => (
            <div 
              key={category.id}
              className="border border-dashed rounded-lg p-4 border-gray-300 dark:border-gray-600 hover:border-red-500 cursor-pointer"
              onClick={() => onEdit(category.id)}
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mr-4">
                  {category.icon}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <Edit size={18} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                    Click to select a {category.name.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}