'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ComponentCard from './ComponentCard'
import { useTheme } from '@/app/contexts/ThemeContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './customScrollbar.css'

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const componentsPerPage = 7
  
  // Reset page when category or components change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, components?.length])
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
  }
  
  // Pagination calculations
  const totalPages = Math.ceil(componentArray.length / componentsPerPage)
  const indexOfLastComponent = currentPage * componentsPerPage
  const indexOfFirstComponent = indexOfLastComponent - componentsPerPage
  const currentComponents = componentArray.slice(indexOfFirstComponent, indexOfLastComponent)
    const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }
  
  return (
    <div className="w-full px-2 sm:px-4 pb-4">
      <div 
        className={`space-y-6 overflow-y-auto w-full pr-1 ${
          theme === 'dark' 
            ? 'custom-scrollbar-dark' 
            : 'custom-scrollbar-light'
        }`}
      >
        {currentComponents.map(component => (
          <div key={component.id} className="w-full min-w-0">
            <ComponentCard
              component={component}
              isSelected={selectedComponents[activeCategory]?.id === component.id}
              onSelect={onSelectComponent}
            />
          </div>
        ))}
      </div>
        {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2" role="navigation" aria-label="Component pagination">
          <button 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-full ${
              theme === 'dark' 
                ? 'text-neutral-400 hover:bg-stone-800 disabled:text-neutral-700' 
                : 'text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-300'
            } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              theme === 'dark' ? 'focus:ring-brand-red-500' : 'focus:ring-brand-blue-500'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className={`text-sm ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`} aria-live="polite">
            {t('pagination.pageOf', { current: currentPage, total: totalPages, defaultMessage: `Page ${currentPage} of ${totalPages}` })}
          </span>
          
          <button 
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full ${
              theme === 'dark' 
                ? 'text-neutral-400 hover:bg-stone-800 disabled:text-neutral-700' 
                : 'text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-300'
            } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              theme === 'dark' ? 'focus:ring-brand-red-500' : 'focus:ring-brand-blue-500'
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ComponentSelectionGrid
