'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface Component {
  id: string
  name: string
  price: number
  description: string
  imageUrl?: string
}

interface ComponentSelectionPanelProps {
  components: Component[]
  selectedComponent: Component | undefined
  onSelectComponent: (component: Component) => void
  category: string
}

export default function ComponentSelectionPanel({
  components,
  selectedComponent,
  onSelectComponent,
  category
}: ComponentSelectionPanelProps) {
  const t = useTranslations()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t('configurator.selectComponent')}
      </h2>

      {components.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No components available in this category.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {components.map((component) => (
            <div 
              key={component.id}
              className={`border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                selectedComponent?.id === component.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => onSelectComponent(component)}
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
                    <span className="text-gray-400 text-xs">{category}</span>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {component.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {component.description}
                  </p>
                </div>
                
                <div className="ml-4 text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    €{component.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}