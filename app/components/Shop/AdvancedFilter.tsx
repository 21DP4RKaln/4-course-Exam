'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  Filter, 
  ChevronDown, 
  Search,
  X, 
  Check
} from 'lucide-react'

interface FilterOption {
  id: string
  name: string
}

interface FilterGroup {
  key: string
  title: string
  icon?: React.ReactNode
  options: FilterOption[]
}

interface AdvancedFilterProps {
  onFilterChange: (filters: Record<string, string[]>) => void
  onSearchChange: (query: string) => void
  onSortChange: (sort: string) => void
  onPriceRangeChange: (min: number, max: number) => void
  maxPrice: number
  minPrice: number
  categories?: FilterOption[]
  cpuOptions?: FilterOption[]
  gpuOptions?: FilterOption[]
  ramOptions?: FilterOption[]
  storageOptions?: FilterOption[]
  motherboardOptions?: FilterOption[]
  psuOptions?: FilterOption[]
  caseOptions?: FilterOption[]
  coolingOptions?: FilterOption[]
  filterGroups?: FilterGroup[]
}

export default function AdvancedFilter({
  onFilterChange,
  onSearchChange,
  onSortChange,
  onPriceRangeChange,
  maxPrice,
  minPrice,
  categories = [],
  cpuOptions = [],
  gpuOptions = [],
  ramOptions = [],
  storageOptions = [],
  motherboardOptions = [],
  psuOptions = [],
  caseOptions = [],
  coolingOptions = [],
  filterGroups
}: AdvancedFilterProps) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const t = useTranslations()
  const { theme } = useTheme()

  // State for managing UI
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [sortOption, setSortOption] = useState('price-asc')

  // State for managing filter groups
  const [internalFilterGroups, setInternalFilterGroups] = useState<FilterGroup[]>([])
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  
  // State for managing price range
  const [currentPriceRange, setCurrentPriceRange] = useState({ 
    min: minPrice || 0, 
    max: maxPrice || 5000 
  })

  // Update price range only when component mounts or when min/max props change and current values are outside bounds
  useEffect(() => {
    if (currentPriceRange.min < minPrice || currentPriceRange.max > maxPrice) {
      setCurrentPriceRange({ min: minPrice, max: maxPrice })
      onPriceRangeChange(minPrice, maxPrice)
    }
  }, [minPrice, maxPrice, currentPriceRange.min, currentPriceRange.max])

  // Setup filter groups and initialize state
  useEffect(() => {
    if (filterGroups && filterGroups.length > 0) {
      setInternalFilterGroups(filterGroups)
    } else {
      const groups: FilterGroup[] = [
        { key: 'category', title: t('shop.filters.category'), options: categories },
        { key: 'cpu', title: t('shop.filters.processor'), options: cpuOptions },
        { key: 'gpu', title: t('shop.filters.graphicsCard'), options: gpuOptions },
        { key: 'ram', title: t('shop.filters.memory'), options: ramOptions },
        { key: 'storage', title: t('shop.filters.storage'), options: storageOptions },
        { key: 'motherboard', title: t('shop.filters.motherboard'), options: motherboardOptions },
        { key: 'psu', title: t('shop.filters.powerSupply'), options: psuOptions },
        { key: 'case', title: t('shop.filters.case'), options: caseOptions },
        { key: 'cooling', title: t('shop.filters.cooling'), options: coolingOptions }
      ].filter(group => group.options && group.options.length > 0)

      setInternalFilterGroups(groups)
    }
  }, [categories, cpuOptions, gpuOptions, ramOptions, storageOptions, 
      motherboardOptions, psuOptions, caseOptions, coolingOptions, t, filterGroups])

  // Initialize sections
  useEffect(() => {
    const initialExpandedSections: Record<string, boolean> = {}
    internalFilterGroups.forEach((group) => {
      initialExpandedSections[group.title] = false
    })
    initialExpandedSections['price'] = false
    setExpandedSections(initialExpandedSections)
  }, [internalFilterGroups])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleFilter = (key: string, value: string) => {
    setSelectedFilters(prev => {
      const current = [...(prev[key] || [])]
      const index = current.indexOf(value)
      
      if (index >= 0) {
        current.splice(index, 1)
      } else {
        current.push(value)
      }
      
      return {
        ...prev,
        [key]: current
      }
    })
  }

  const resetFilters = () => {
    const resetSelectedFilters: Record<string, string[]> = {}
    internalFilterGroups.forEach(group => {
      resetSelectedFilters[group.key] = []
    })
    
    setSelectedFilters(resetSelectedFilters)
    setSearchQuery('')
    setSortOption('price-asc')
    setCurrentPriceRange({ min: minPrice, max: maxPrice })
    onSortChange('price-asc')
    onPriceRangeChange(minPrice, maxPrice)
  }

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      const newMin = Math.min(Math.max(minPrice, value), currentPriceRange.max)
      if (newMin !== currentPriceRange.min) {
        setCurrentPriceRange(prev => {
          const newState = { ...prev, min: newMin }
          onPriceRangeChange(newState.min, newState.max)
          return newState
        })
      }
    } else {
      const newMax = Math.max(Math.min(maxPrice, value), currentPriceRange.min)
      if (newMax !== currentPriceRange.max) {
        setCurrentPriceRange(prev => {
          const newState = { ...prev, max: newMax }
          onPriceRangeChange(newState.min, newState.max)
          return newState
        })
      }
    }
  }

  const hasActiveFilters = () => {
    return Object.values(selectedFilters).some(arr => arr.length > 0) || 
           searchQuery !== '' || 
           sortOption !== 'price-asc' ||
           currentPriceRange.min > minPrice ||
           currentPriceRange.max < maxPrice
  }
  return (
    <div className="rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Search input */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchChange(e.target.value);
            }}
            placeholder={t('shop.filters.searchPlaceholder')}
            className="w-full pl-12 pr-12 py-3 bg-white/50 dark:bg-gray-900/50 border border-blue-200 dark:border-red-700/50 rounded-lg text-gray-900 dark:text-white text-base placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-red-500 focus:border-transparent transition duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                onSearchChange('')
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortOption}
          onChange={(e) => {
            setSortOption(e.target.value);
            onSortChange(e.target.value);
          }}
          className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-blue-400 dark:focus:ring-brand-red-500 transition duration-200 cursor-pointer appearance-none"
        >          <option className="bg-white dark:bg-stone-950 text-gray-900 dark:text-white" value="price-asc">{t('shop.filters.sortOptions.priceAsc')}</option>
          <option className="bg-white dark:bg-stone-950 text-gray-900 dark:text-white" value="price-desc">{t('shop.filters.sortOptions.priceDesc')}</option>
          <option className="bg-white dark:bg-stone-950 text-gray-900 dark:text-white" value="name-asc">{t('shop.filters.sortOptions.nameAsc')}</option>
          <option className="bg-white dark:bg-stone-950 text-gray-900 dark:text-white" value="name-desc">{t('shop.filters.sortOptions.nameDesc')}</option>
          <option className="bg-white dark:bg-stone-950 text-gray-900 dark:text-white" value="availability">{t('shop.filters.sortOptions.stockDesc')}</option>
        </select>

        {/* Filter content */}
        <div className={`${(!isOpen && 'hidden lg:block') || 'block'}`}>
          <div className="bg-transparent rounded-lg p-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Filter size={20} className="mr-2" />
                {t('buttons.filter')}
              </h3>
              {hasActiveFilters() && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-400 hover:text-red-300 hover:underline font-medium"
                >
                  {t('shop.filters.resetAll')}
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Price Range Filter */}
              <div className="border-t border-blue-200 dark:border-red-700/40 pt-4">
                <button
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white text-base">
                      {t('shop.filters.price')} 
                      <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                        (€{currentPriceRange.min} - €{currentPriceRange.max})
                      </span>
                    </span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transform transition-transform ${
                      expandedSections['price'] ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {expandedSections['price'] && (
                  <div className="mt-4">
                    <div className="space-y-5">
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price</label>
                          <input
                            type="number"
                            value={currentPriceRange.min}
                            onChange={(e) => handlePriceRangeChange('min', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white/50 dark:bg-stone-950/50 border dark:border-red-700/50 light:border-blue-300 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-red-500"
                            min={minPrice}
                            max={currentPriceRange.max}
                            step="1"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price</label>
                          <input
                            type="number"
                            value={currentPriceRange.max}
                            onChange={(e) => handlePriceRangeChange('max', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white/50 dark:bg-stone-950/50 border dark:border-red-700/50 light:border-blue-300 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-red-500"
                            min={currentPriceRange.min}
                            max={maxPrice}
                            step="1"
                          />
                        </div>
                      </div>
                      <div className="px-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Price</label>
                        <input
                          type="range"
                          value={currentPriceRange.min}
                          onChange={(e) => handlePriceRangeChange('min', Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-red-600"
                          min={minPrice}
                          max={maxPrice}
                          step="1"
                        />
                      </div>
                      <div className="px-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Price</label>
                        <input
                          type="range"
                          value={currentPriceRange.max}
                          onChange={(e) => handlePriceRangeChange('max', Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-red-600"
                          min={minPrice}
                          max={maxPrice}
                          step="1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Component Filters */}
              {internalFilterGroups.map((group) => (
                <div key={group.key} className="border-t border-blue-200 dark:border-red-700/40 pt-4">
                  <button
                    onClick={() => toggleSection(group.title)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center">
                      {group.icon}
                      <span className="font-medium text-gray-900 dark:text-white text-base">
                        {group.title}
                        {selectedFilters[group.key]?.length > 0 && (
                          <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-blue-100 dark:bg-red-900 text-blue-800 dark:text-red-300">
                            {selectedFilters[group.key].length}
                          </span>
                        )}
                      </span>
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`text-gray-500 transform transition-transform ${
                        expandedSections[group.title] ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {expandedSections[group.title] && (
                    <div className="mt-3 ml-2 space-y-2 max-h-56 overflow-y-auto pr-2">
                      {group.options.map(option => (
                        <div key={option.id} className="flex items-center">
                          <label className="flex items-center cursor-pointer w-full">
                            <div 
                              className={`w-5 h-5 mr-3 border rounded flex items-center justify-center transition-colors ${
                                (selectedFilters[group.key] || []).includes(option.id)
                                  ? theme === 'dark'
                                    ? 'bg-red-600 border-red-600 text-white'
                                    : 'bg-blue-600 border-blue-600 text-white'
                                  : theme === 'dark'
                                    ? 'border-gray-600 hover:border-red-500'
                                    : 'border-gray-400 hover:border-blue-500'
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFilter(group.key, option.id);
                              }}
                            >
                              {(selectedFilters[group.key] || []).includes(option.id) && (
                                <Check size={14} />
                              )}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                              {option.name}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
