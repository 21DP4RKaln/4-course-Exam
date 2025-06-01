'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Cpu, Monitor, HardDrive, Server, Zap, Fan, Box } from 'lucide-react'
import { useTheme } from '@/app/contexts/ThemeContext'
// import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Component } from './types'

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
        <div className={`${bgColor} h-16 w-16 rounded-lg overflow-hidden flex items-center justify-center`}>
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
      <div className={`${bgColor} h-16 w-16 rounded-lg flex items-center justify-center`}>
        {getCategoryIcon(component.categoryId || '', iconColor)}
      </div>
    )
  }

  // Get category icon based on category id
  const getCategoryIcon = (categoryId: string, colorClass: string) => {
    const size = 36
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
      className={`rounded-lg p-4 transition-all cursor-pointer ${
        theme === 'dark'
          ? 'bg-stone-900 border border-neutral-800 hover:border-brand-red-500/30'
          : 'bg-white border border-neutral-200 hover:border-brand-blue-500/30'
      } hover:shadow-md focus:outline-none focus:ring-2 ${
        theme === 'dark' 
          ? 'focus:ring-brand-red-500/50' 
          : 'focus:ring-brand-blue-500/50'
      }`}
      onClick={() => onSelect(component)}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(component);
        }
      }}
    >
      <div className="flex flex-col sm:flex-row items-center w-full">
        <div className="flex-shrink-0 mr-0 sm:mr-4 mb-3 sm:mb-0">
          {getComponentImage()}
        </div>
        <div className="flex-grow text-center sm:text-left">
          <h3 className={`font-medium text-lg ${
            theme === 'dark' ? 'text-white' : 'text-neutral-900'
          }`}>
            {component.name}
          </h3>
          <p className={`text-sm mt-2 flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-1 ${
            theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
          }`}>
            {Object.entries(component.specifications || {}).map(([key, value]) => (
              <span key={key}>
                {t(`configurator.specs.${key}`, { defaultMessage: key })}: {String(value)}
              </span>
            ))}
          </p>
        </div>        <div className="flex-shrink-0 text-center sm:text-right mt-3 sm:mt-0">
          <div className="flex flex-col items-center sm:items-end">
            {component.discountPrice && component.discountPrice < component.price ? (
              <>
                <div className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
                }`}>
                  €{formatPrice(component.discountPrice)}
                </div>
                <div className={`text-base line-through ${
                  theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'
                }`}>
                  €{formatPrice(component.price)}
                </div>
              </>
            ) : (
              <div className={`text-xl font-bold ${
                theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
              }`}>
                €{formatPrice(component.price)}
              </div>
            )}
            {component.stock !== undefined && component.stock <= 5 && (
              <div className={`text-sm mt-1 ${
                component.stock === 0 
                  ? 'text-red-500' 
                  : theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`} aria-live="polite">
                {component.stock === 0 ? t('outOfStock') : `${component.stock} ${t('inStock')}`}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center mt-3 justify-center sm:justify-end gap-3">
            <button 
              className={`text-sm px-3 py-1.5 rounded-md transition-colors w-full sm:w-auto ${
                theme === 'dark'
                  ? 'text-neutral-400 hover:text-white hover:bg-stone-800'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              } focus:outline-none focus:ring-1 ${
                theme === 'dark' ? 'focus:ring-brand-red-400' : 'focus:ring-brand-blue-400'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                // Compare functionality would go here
              }}
            >
              {t('buttons.compare')}
            </button>
            <button
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all w-full sm:w-auto ${
                isSelected 
                  ? theme === 'dark'
                    ? 'bg-brand-red-500/20 text-brand-red-400 border border-brand-red-500/30' 
                    : 'bg-brand-blue-500/20 text-brand-blue-600 border border-brand-blue-500/30'
                  : theme === 'dark'
                    ? 'bg-brand-red-500 text-white hover:bg-brand-red-600'
                    : 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
              } ${component.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none focus:ring-2 ${
                theme === 'dark' ? 'focus:ring-brand-red-500' : 'focus:ring-brand-blue-500'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                if (component.stock !== 0) {
                  onSelect(component)
                }
              }}
              disabled={component.stock === 0}
              aria-disabled={component.stock === 0}
            >
              {component.stock === 0 ? t('buttons.outOfStock') : isSelected ? t('buttons.selected') : t('buttons.select')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComponentCard
