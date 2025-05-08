'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  title: string
  icon?: React.ReactNode
  options: FilterOption[]
}

interface AdvancedFilterProps {
  onFilterChange: (filters: Record<string, string[]>) => void
  onSearchChange: (query: string) => void
  onSortChange: (sort: string) => void

  categories?: FilterOption[]
  cpuOptions?: FilterOption[]
  gpuOptions?: FilterOption[]
  ramOptions?: FilterOption[]
  storageOptions?: FilterOption[]

  filterGroups?: FilterGroup[]
}

export default function AdvancedFilter({
  onFilterChange,
  onSearchChange,
  onSortChange,
  categories = [],
  cpuOptions = [],
  gpuOptions = [],
  ramOptions = [],
  storageOptions = [],
  filterGroups
}: AdvancedFilterProps) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const t = useTranslations()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [sortOption, setSortOption] = useState('price-asc')

  const [internalFilterGroups, setInternalFilterGroups] = useState<FilterGroup[]>([])
  
  useEffect(() => {
    if (filterGroups && filterGroups.length > 0) {
      setInternalFilterGroups(filterGroups)
    } else {
      const groups: FilterGroup[] = []
      
      if (categories.length > 0) {
        groups.push({
          title: t('shop.filters.category'),
          options: categories
        })
      }
      
      if (cpuOptions.length > 0) {
        groups.push({
          title: t('shop.filters.processor'),
          options: cpuOptions
        })
      }
      
      if (gpuOptions.length > 0) {
        groups.push({
          title: t('shop.filters.graphicsCard'),
          options: gpuOptions
        })
      }
      
      if (ramOptions.length > 0) {
        groups.push({
          title: t('shop.filters.memory'),
          options: ramOptions
        })
      }
      
      if (storageOptions.length > 0) {
        groups.push({
          title: t('shop.filters.storage'),
          options: storageOptions
        })
      }
      
      setInternalFilterGroups(groups)
    }

    const initialExpandedSections: Record<string, boolean> = {}

    const groupsToExpand = filterGroups || [
      { title: t('shop.filters.category') },
      { title: t('shop.filters.processor') },
      { title: t('shop.filters.graphicsCard') }
    ]
    
    groupsToExpand.slice(0, 3).forEach((group, index) => {
      initialExpandedSections[group.title] = true
    })
    
    setExpandedSections(initialExpandedSections)

    const initialSelectedFilters: Record<string, string[]> = {}
    if (filterGroups) {
      filterGroups.forEach(group => {
        initialSelectedFilters[group.title] = []
      })
    } else {
      initialSelectedFilters[t('shop.filters.category')] = []
      initialSelectedFilters[t('shop.filters.processor')] = []
      initialSelectedFilters[t('shop.filters.graphicsCard')] = []
      initialSelectedFilters[t('shop.filters.memory')] = []
      initialSelectedFilters[t('shop.filters.storage')] = []
    }
    
    setSelectedFilters(initialSelectedFilters)
  }, [filterGroups, categories, cpuOptions, gpuOptions, ramOptions, storageOptions, t])

  useEffect(() => {
    onFilterChange(selectedFilters)
  }, [selectedFilters, onFilterChange])

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchQuery)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery, onSearchChange])
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  const toggleFilter = (type: string, value: string) => {
    setSelectedFilters(prev => {
      const current = [...(prev[type] || [])]
      const index = current.indexOf(value)
      
      if (index >= 0) {
        current.splice(index, 1)
      } else {
        current.push(value)
      }
      
      return {
        ...prev,
        [type]: current
      }
    })
  }
  
  const resetFilters = () => {
    const resetSelectedFilters: Record<string, string[]> = {}
    internalFilterGroups.forEach(group => {
      resetSelectedFilters[group.title] = []
    })
    
    setSelectedFilters(resetSelectedFilters)
    setSearchQuery('')
    setSortOption('price-asc')
    onSortChange('price-asc')
  }
  
  const hasActiveFilters = () => {
    return Object.values(selectedFilters).some(arr => arr.length > 0) || 
           searchQuery !== '' || 
           sortOption !== 'price-asc'
  }
  
  return (
    <div className="mb-6">
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <Filter size={18} className="mr-2" />
          {isOpen ? t('shop.filters.hideFilters') : t('shop.filters.showFilters')}
          <ChevronDown size={18} className={`ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Desktop search and sort bar */}
      <div className="hidden lg:flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('shop.filters.searchPlaceholder')}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="ml-4">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value)
              onSortChange(e.target.value)
            }}
            className="block px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="price-asc">{t('shop.filters.sortOptions.priceAsc')}</option>
            <option value="price-desc">{t('shop.filters.sortOptions.priceDesc')}</option>
            <option value="name-asc">{t('shop.filters.sortOptions.nameAsc')}</option>
            <option value="name-desc">{t('shop.filters.sortOptions.nameDesc')}</option>
            <option value="rating-desc">{t('shop.filters.sortOptions.ratingDesc')}</option>
          </select>
        </div>
      </div>
      
      {/* Mobile search and sort bar */}
      {isOpen && (
        <div className="lg:hidden mb-4 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('shop.filters.searchPlaceholder')}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value)
              onSortChange(e.target.value)
            }}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="price-asc">{t('shop.filters.sortOptions.priceAsc')}</option>
            <option value="price-desc">{t('shop.filters.sortOptions.priceDesc')}</option>
            <option value="name-asc">{t('shop.filters.sortOptions.nameAsc')}</option>
            <option value="name-desc">{t('shop.filters.sortOptions.nameDesc')}</option>
            <option value="rating-desc">{t('shop.filters.sortOptions.ratingDesc')}</option>
          </select>
        </div>
      )}
      
      {/* Main filter content - desktop always visible, mobile conditional */}
      <div className={`${(!isOpen && 'hidden lg:block') || 'block'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Filter size={18} className="mr-2" />
              {t('buttons.filter')}
            </h3>
            
            {hasActiveFilters() && (
              <button
              onClick={resetFilters}
              className="text-sm text-brand-blue-600 dark:text-brand-red-400 hover:underline"
              >
                {t('shop.filters.resetAll')}
              </button>
            )}
          </div>
          
          {/* Filter sections */}
          <div className="space-y-4">
            {internalFilterGroups.map((group) => (
              <div key={group.title} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => toggleSection(group.title)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center">
                    {group.icon}
                    <span className="font-medium text-gray-900 dark:text-white ml-2">
                      {group.title}
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
                  <div className="mt-2 ml-2 space-y-1 max-h-48 overflow-y-auto">
                    {group.options.map(option => (
                      <div key={option.id} className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                        <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                            (selectedFilters[group.title] || []).includes(option.id)
                              ? 'bg-brand-blue-600 dark:bg-brand-red-600 border-brand-blue-600 dark:border-brand-red-600 text-white'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {(selectedFilters[group.title] || []).includes(option.id) && (
                              <Check size={12} />
                            )}
                          </div>
                          <span 
                            className="text-sm text-gray-700 dark:text-gray-300"
                            onClick={() => toggleFilter(group.title, option.id)}
                          >
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
          
          {/* Mobile apply button */}
          <div className="mt-6 lg:hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 px-4 bg-brand-blue-600 dark:bg-brand-red-600 text-white rounded-md hover:bg-brand-blue-700 dark:hover:bg-brand-red-700"
            >
              {t('shop.filters.applyFilters')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}