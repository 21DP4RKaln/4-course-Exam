import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { filters } from './filterConfigs'

interface Props {
  activeFilter: string | null
  onFilterChange: (filter: string | null) => void
  activeCategory: string
}

const QuickFilters: React.FC<Props> = ({ activeFilter, onFilterChange, activeCategory }) => {
  const t = useTranslations()
  const { theme } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastActiveFilter, setLastActiveFilter] = useState<string | null>(activeFilter)
  const containerRef = useRef<HTMLDivElement>(null)
  const MAX_VISIBLE_ITEMS = 6 

  // Get brand color based on filter ID
  const getBrandColor = useCallback((filterId: string | null) => {
    if (!filterId) return ''
    
    if (filterId.toLowerCase().includes('intel')) {
      return 'text-blue-500 hover:text-blue-400'
    }
    if (filterId.toLowerCase().includes('amd')) {
      return 'text-orange-500 hover:text-orange-400'
    }
    if (filterId.toLowerCase().includes('nvidia')) {
      return 'text-green-500 hover:text-green-400'
    }
    return theme === 'dark' ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-900'
  }, [theme])

  // Get brand underline color
  const getBrandUnderlineColor = useCallback((filterId: string | null) => {
    if (!filterId) return theme === 'dark' ? 'after:bg-red-500' : 'after:bg-blue-600'
    
    if (filterId.toLowerCase().includes('intel')) {
      return 'after:bg-blue-500'
    }
    if (filterId.toLowerCase().includes('amd')) {
      return 'after:bg-orange-500'
    }
    if (filterId.toLowerCase().includes('nvidia')) {
      return 'after:bg-green-500'
    }
    return theme === 'dark' ? 'after:bg-red-500' : 'after:bg-blue-600'
  }, [theme])

  // Iegūstam filtrus atkarībā no kategorijas
  const getFiltersByCategoryAndActiveCategory = useCallback(() => {
    if (!activeCategory) return []
    
    // Map category slugs to filter keys
    const slugMapping: Record<string, string> = {
      'processors': 'cpu',
      'graphics-cards': 'gpu',
      'motherboards': 'motherboard',
      'memory': 'memory',
      'storage': 'storage',
      'cases': 'case',
      'power-supplies': 'psu',
      'cooling': 'cooling',
      'services': 'services'
    }
    
    const key = slugMapping[activeCategory] || activeCategory
    const categoryFilters = filters[key] || []
      // Return all filters for the category
    return categoryFilters
  }, [activeCategory])
  
  const filtersToShow = getFiltersByCategoryAndActiveCategory()
  const allFilters = filtersToShow.length > 0 ? [{ id: null, name: t('common.all') || 'All' }, ...filtersToShow] : []
  const totalFilterCount = allFilters.length
  const maxIndex = Math.max(0, totalFilterCount - MAX_VISIBLE_ITEMS)

  // Atrodam aktīvā filtra indeksu visā filtru sarakstā
  const getActiveFilterIndex = useCallback(() => {
    return allFilters.findIndex(filter => {
      if (filter.id === null && activeFilter === null) return true;
      return filter.id === activeFilter;
    });
  }, [allFilters, activeFilter]);

  // Nodrošinam, ka aktīvais filtrs vienmēr ir redzams
  const ensureActiveFilterVisible = useCallback(() => {
    const activeFilterIndex = getActiveFilterIndex();
    
    if (activeFilterIndex === -1) return;
    
    // Ja aktīvais filtrs ir ārpus redzamās zonas, pielāgojam skatu
    if (activeFilterIndex < currentIndex) {
      setCurrentIndex(activeFilterIndex);
    } else if (activeFilterIndex >= currentIndex + MAX_VISIBLE_ITEMS) {
      setCurrentIndex(Math.min(maxIndex, activeFilterIndex - MAX_VISIBLE_ITEMS + 1));
    }
  }, [getActiveFilterIndex, currentIndex, maxIndex, MAX_VISIBLE_ITEMS]);

  // Ritināšanas funkcija ar drošības pārbaudēm
  const scrollSafe = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    }
  }, [maxIndex]);

  // Varam ritināt pa kreisi, ja nav sākumā
  const canScrollLeft = currentIndex > 0;
  // Varam ritināt pa labi, ja nav beigās
  const canScrollRight = currentIndex < maxIndex;

  // Redzamie filtri pašreizējā skatā
  const visibleFilters = allFilters.slice(currentIndex, currentIndex + MAX_VISIBLE_ITEMS);

  // Funkcija filtra maiņai
  const handleFilterChange = useCallback((filterId: string | null) => {
    setLastActiveFilter(filterId);
    onFilterChange(filterId);
  }, [onFilterChange]);

  // Kad mainās aktivais filtrs, pārliecinamies, ka tas ir redzams
  useEffect(() => {
    ensureActiveFilterVisible();
  }, [activeFilter, ensureActiveFilterVisible]);

  // Kad mainās aktīvais filtrs no ārpuses, atjauninām lokālo stāvokli
  useEffect(() => {
    if (activeFilter !== lastActiveFilter) {
      setLastActiveFilter(activeFilter);
    }
  }, [activeFilter]);

  // Kad mainās kategorija, atiestatām indeksu uz 0
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Ja nav filtru, ko parādīt, neko neatgriežam
  if (filtersToShow.length === 0) {
    return null;
  }

  return (
    <div className={`relative h-[45px] ${
      theme === 'dark' 
        ? 'bg-dark-card border border-dark-border' 
        : 'bg-white border border-neutral-200'
    } rounded-lg flex items-center overflow-hidden transition-colors duration-200`} ref={containerRef}>
      {canScrollLeft && (
        <button 
          onClick={() => scrollSafe('left')}
          className={`absolute left-0 top-0 bottom-0 w-8 flex justify-center items-center z-10 ${
            theme === 'dark' 
              ? 'bg-dark-card hover:bg-dark-surface' 
              : 'bg-white hover:bg-neutral-50'
          } rounded-l-lg transition-colors duration-200`}
          aria-label="Scroll left"
        >
          <ChevronLeft className={`w-4 h-4 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`} />
        </button>
      )}
      
      <div className="flex items-center justify-start overflow-hidden mx-8 w-full">
        {visibleFilters.map((filter, index) => {
          const isActive = filter.id === activeFilter || 
                         (filter.id === null && activeFilter === null);
          
          return (
            <button
              key={`${filter.id}-${index}`}
              className={`whitespace-nowrap flex-1 flex justify-center items-center text-sm font-medium h-[45px] relative transition-colors duration-200
                ${isActive 
                  ? `${getBrandColor(filter.id)} ${getBrandUnderlineColor(filter.id)} after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5` 
                  : getBrandColor(filter.id)
                }`}
              onClick={() => handleFilterChange(filter.id)}            >              {filter.name}
            </button>
          );
        })}
      </div>
      
      {canScrollRight && (
        <button 
          onClick={() => scrollSafe('right')}
          className={`absolute right-0 top-0 bottom-0 w-8 flex justify-center items-center z-10 ${
            theme === 'dark' 
              ? 'bg-dark-card hover:bg-dark-surface' 
              : 'bg-white hover:bg-neutral-50'
          } rounded-r-lg transition-colors duration-200`}
          aria-label="Scroll right"
        >
          <ChevronRight className={`w-4 h-4 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`} />
        </button>
      )}
    </div>
  )
}

export default QuickFilters