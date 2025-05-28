'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Cpu, Monitor, HardDrive, Server, Zap, Fan, Box } from 'lucide-react'
import { useTheme } from '@/app/contexts/ThemeContext'
// import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface Component {
  id: string
  name: string
  price: number
  description: string
  categoryId?: string
  specifications?: any
  imageUrl?: string
}

interface ComponentCardProps {
  component: Component
  isSelected: boolean
  onSelect: (component: Component) => void
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, isSelected, onSelect }) => {  
  const t = useTranslations()
  const { theme } = useTheme()

  const getComponentImage = () => {
    const iconColor = theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
    const bgColor = theme === 'dark'
      ? 'bg-brand-red-500/10 border border-brand-red-500/20'
      : 'bg-brand-blue-500/10 border border-brand-blue-500/20'
    
    // Show image if provided
    if (component.imageUrl) {
      return (
        <div className={`${bgColor} h-12 w-12 rounded-lg overflow-hidden flex items-center justify-center`}>
          <img
            src={component.imageUrl}
            alt={component.name}
            className="object-contain h-full w-full"
          />
        </div>
      )
    }
    
    // Fallback to category icon
    return (
      <div className={`${bgColor} h-12 w-12 rounded-lg flex items-center justify-center`}>
        {getCategoryIcon(component.categoryId || '', iconColor)}
      </div>
    )
  }

  // Get category icon based on category id
  const getCategoryIcon = (categoryId: string, colorClass: string) => {
    const size = 28
    switch (categoryId) {
      case 'cpu':
        return <Cpu size={size} className={colorClass} />
      case 'gpu':
        return <Monitor size={size} className={colorClass} />
      case 'ram':
        return <HardDrive size={size} className={colorClass} />
      case 'motherboard':
        return <Server size={size} className={colorClass} />
      case 'psu':
        return <Zap size={size} className={colorClass} />
      case 'cooling':
        return <Fan size={size} className={colorClass} />
      case 'case':
        return <Box size={size} className={colorClass} />
      case 'storage':
        return <HardDrive size={size} className={colorClass} />
      default:
        return <Box size={size} className={colorClass} />
    }
  }

  // Hide networking and sound cards components
  if (component.categoryId === 'networking' || component.categoryId === 'sound-cards') {
    return null;
  }

  return (
    <div 
      className={`rounded-lg p-2 transition-all cursor-pointer ${
        theme === 'dark'
          ? 'bg-stone-900 border border-neutral-800 hover:border-brand-red-500/30'
          : 'bg-white border border-neutral-200 hover:border-brand-blue-500/30'
      }`}
      onClick={() => onSelect(component)}
    >
      <div className="flex items-center w-full">
        <div className="flex-shrink-0 mr-4">
          {getComponentImage()}
        </div>
        <div className="flex-grow">
          <h3 className={`font-medium ${
            theme === 'dark' ? 'text-white' : 'text-neutral-900'
          }`}>
            {component.name}
          </h3>
          <p className={`text-xs mt-1.5 flex flex-wrap gap-x-2 ${
            theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
          }`}>
            {Object.entries(component.specifications || {}).map(([key, value]) => (
              <span key={key}>
                {t(`configurator.specs.${key}`, { defaultMessage: key })}: {String(value)}
              </span>
            ))}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className={`text-lg font-bold ${
            theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
          }`}>
            €{formatPrice(component.price)}
          </div>
          <div className="flex items-center mt-2 justify-end space-x-2">
            <button 
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'text-neutral-400 hover:text-white hover:bg-stone-800'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                // Compare functionality would go here
              }}
            >
              {t('buttons.compare')}
            </button>
            <button
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                isSelected 
                  ? theme === 'dark'
                    ? 'bg-brand-red-500/20 text-brand-red-400 border border-brand-red-500/30' 
                    : 'bg-brand-blue-500/20 text-brand-blue-600 border border-brand-blue-500/30'
                  : theme === 'dark'
                    ? 'bg-brand-red-500 text-white hover:bg-brand-red-600'
                    : 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(component)
              }}
            >
              {isSelected ? t('buttons.selected') : t('buttons.select')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComponentCard
