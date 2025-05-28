'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import ComponentCard from './ComponentCard'
import { useTheme } from '@/app/contexts/ThemeContext'

interface ComponentSelectionGridProps {
  components: any[]
  activeCategory: string
  loading: boolean
  selectedComponents: Record<string, any>
  onSelectComponent: (component: any) => void
}

const ComponentSelectionGrid: React.FC<ComponentSelectionGridProps> = ({
  components,
  activeCategory,
  loading,
  selectedComponents,
  onSelectComponent
}) => {
  const t = useTranslations('configurator')
  const { theme } = useTheme()
    if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${
          theme === 'dark'
            ? 'border-brand-red-500'
            : 'border-brand-blue-500'
        }`}></div>
      </div>
    )
  }

  // Ensure components is an array
  const componentArray = Array.isArray(components) ? components : [];
  
  if (componentArray.length === 0) {
    return (
      <div className={`rounded-lg p-8 text-center border border-dashed ${
        theme === 'dark'
          ? 'bg-stone-900/50 border-neutral-800 text-neutral-400'
          : 'bg-neutral-100/50 border-neutral-300 text-neutral-500'
      }`}>
        <p>
          {t('noComponentsFound')}
        </p>
      </div>
    )
  }  return (
    <div className="space-y-3 overflow-hidden w-full">
      {componentArray.map(component => (
        <div key={component.id} className="w-full min-w-0">
          <ComponentCard
            component={component}
            isSelected={selectedComponents[activeCategory]?.id === component.id}
            onSelect={onSelectComponent}
          />
        </div>
      ))}
    </div>
  )
}

export default ComponentSelectionGrid
