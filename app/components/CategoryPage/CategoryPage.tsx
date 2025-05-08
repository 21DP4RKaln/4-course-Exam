'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  AlertTriangle,
  ArrowLeft,
  Filter,
  Search,
  X,
  ChevronDown,
  Check,
  ShoppingCart,
  Star
} from 'lucide-react'
import ProductCard from '@/app/components/Shop/ProductCard'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'

interface Component {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  specifications: Record<string, string>;
  sku: string;
}

interface Specification {
  id: string;
  name: string;
  displayName: string;
  values: string[];
}

interface FilterOption {
  id: string;
  name: string;
}

interface FilterGroup {
  title: string;
  type: string;
  options: FilterOption[];
}

interface CategoryPageProps {
  params: Promise<{ 
    slug: string;
  }>;
  type?: 'component' | 'peripheral';
}

export default function CategoryPage({ params, type = 'component' }: CategoryPageProps) {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]
  const categorySlug = React.use(params).slug

  const [components, setComponents] = useState<Component[]>([])
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([])
  const [specifications, setSpecifications] = useState<Specification[]>([])
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [sortOption, setSortOption] = useState('price-asc')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([])
 
  const apiEndpoint = type === 'peripheral' ? 
    `/api/components?category=${categorySlug}&type=peripherals` : 
    `/api/components?category=${categorySlug}&type=components`;

  useEffect(() => {
    const fetchComponentsData = async () => {
      setLoading(true)
      try {
        const response = await fetch(apiEndpoint)
        
        if (!response.ok) {
          throw new Error(t('categoryPage.fetchError', { type }))
        }
        
        const data = await response.json()
        
        if (data.categories && data.categories.length > 0) {
          const category = data.categories.find((cat: any) => cat.slug === categorySlug)
          if (category) {
            setCategoryName(category.name)
          } else {
            setCategoryName(data.categories[0].name)
          }
        }
        
        if (data.components && Array.isArray(data.components)) {
          setComponents(data.components)
          setFilteredComponents(data.components)
        }
        
        if (data.specifications && Array.isArray(data.specifications)) {
          setSpecifications(data.specifications)
         
          const initialExpandedSections: Record<string, boolean> = {}
         
          const groups = organizeFiltersIntoGroups(data.specifications)
          setFilterGroups(groups)
          
          groups.slice(0, 3).forEach(group => {
            initialExpandedSections[group.type] = true
          })
          
          setExpandedSections(initialExpandedSections)
          
          const initialSelectedFilters: Record<string, string[]> = {}
          groups.forEach(group => {
            initialSelectedFilters[group.type] = []
          })
          setSelectedFilters(initialSelectedFilters)
        }
      } catch (err) {
        console.error(`Error fetching ${type}s:`, err)
        setError(t('categoryPage.fetchError', { type }))
      } finally {
        setLoading(false)
      }
    }
    
    fetchComponentsData()
  }, [categorySlug, type, apiEndpoint, t])
 
  const organizeFiltersIntoGroups = (specs: Specification[]): FilterGroup[] => {
    const groups: FilterGroup[] = []
    const groupMappings: Record<string, string> = {
      // Common groupings for all component types
      'brand': t('categoryPage.filterGroups.manufacturer'),
      'manufacturer': t('categoryPage.filterGroups.manufacturer'),
      'model': t('categoryPage.filterGroups.model'),
      
      // CPUs
      'socket': t('categoryPage.filterGroups.socket'),
      'cores': t('categoryPage.filterGroups.cores'),
      'threads': t('categoryPage.filterGroups.threads'),
      'frequency': t('categoryPage.filterGroups.frequency'),
      'architecture': t('categoryPage.filterGroups.architecture'),
      
      // GPUs
      'memory': t('categoryPage.filterGroups.memory'),
      'memoryType': t('categoryPage.filterGroups.memoryType'),
      'interface': t('categoryPage.filterGroups.interface'),
      
      // Mice & Peripherals
      'sensor': t('categoryPage.filterGroups.sensor'),
      'dpi': t('categoryPage.filterGroups.dpi'),
      'rgb': t('categoryPage.filterGroups.rgb'),
      'connection': t('categoryPage.filterGroups.connection'),
      'wireless': t('categoryPage.filterGroups.wireless'),
      'switches': t('categoryPage.filterGroups.switches'),
      'polling': t('categoryPage.filterGroups.polling'),
      
      // RAM
      'capacity': t('categoryPage.filterGroups.capacity'),
      'speed': t('categoryPage.filterGroups.speed'),
      'cas': t('categoryPage.filterGroups.cas'),
      
    }
  
    const generalGroup: FilterGroup = {
      title: t('categoryPage.filterGroups.general'),
      type: 'general',
      options: []
    }
 
    const manufacturerGroup: FilterGroup = {
      title: t('categoryPage.filterGroups.manufacturer'),
      type: 'manufacturer',
      options: []
    }
 
    const groupMap: Record<string, FilterGroup> = {}
    
    specs.forEach(spec => {
      const specName = spec.name.toLowerCase()
      const specDisplayName = spec.displayName

      let groupName = 'general' 
      
      if (specName.includes('brand') || specName.includes('manufacturer')) {
        groupName = 'manufacturer'
      } else {
        for (const [key, value] of Object.entries(groupMappings)) {
          if (specName.includes(key.toLowerCase())) {
            groupName = key
            break
          }
        }
      }
      
      let group = groupMap[groupName]
      if (!group) {
        group = {
          title: groupMappings[groupName] || specDisplayName,
          type: groupName,
          options: []
        }
        groupMap[groupName] = group
      }
    
      spec.values.forEach(value => {
        group.options.push({
          id: `${spec.name}=${value}`,
          name: value
        })
      })
    })
   
    if (manufacturerGroup.options.length > 0) {
      groups.push(manufacturerGroup)
    }
   
    const sortedGroups = Object.values(groupMap)
      .filter(g => g.type !== 'manufacturer' && g.type !== 'general' && g.options.length > 0)
      .sort((a, b) => a.title.localeCompare(b.title))
  
    groups.push(...sortedGroups)
   
    if (generalGroup.options.length > 0) {
      groups.push(generalGroup)
    }
    
    return groups
  }

  const handleFilterChange = (type: string, value: string) => {
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

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }
 
  useEffect(() => {
    if (components.length === 0) return
    
    let result = [...components]
   
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(component => 
        component.name.toLowerCase().includes(query) || 
        component.description.toLowerCase().includes(query) ||
        Object.entries(component.specifications).some(([key, value]) => 
          value.toLowerCase().includes(query)
        )
      )
    }
 
    Object.entries(selectedFilters).forEach(([type, filterValues]) => {
      if (filterValues.length > 0) {
        result = result.filter(component => {
          return filterValues.some(filter => {
            const [key, value] = filter.split('=')
            return component.specifications[key] === value
          })
        })
      }
    })
  
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'stock-desc':
        result.sort((a, b) => b.stock - a.stock)
        break
    }
    
    setFilteredComponents(result)
  }, [components, searchQuery, selectedFilters, sortOption])
  
  const resetFilters = () => {
    const initialSelectedFilters: Record<string, string[]> = {}
    filterGroups.forEach(group => {
      initialSelectedFilters[group.type] = []
    })
    setSelectedFilters(initialSelectedFilters)
    setSearchQuery('')
    setSortOption('price-asc')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-gray-50 dark:bg-gray-900">
        <Loading size="medium" />
      </div>
    )
  }
 
  if (error) {
    return (
      <div className="max-w-7xl mx-auto text-center py-16">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error}
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          {t('categoryPage.tryAgain')}
        </button>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link
            href={`/${locale}/${type}s`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t('categoryPage.backTo', { 
              type: type === 'peripheral' ? t('nav.peripherals') : t('nav.components') 
            })}
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {categoryName}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          {filteredComponents.length} {t(`categoryPage.${filteredComponents.length === 1 ? 'item' : 'items'}`)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Filter size={18} className="mr-2" />
                {t('categoryPage.filters')}
              </h2>
              
              <button
                onClick={resetFilters}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                {t('buttons.reset')}
              </button>
            </div>
            
            {/* Search bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('categoryPage.searchPlaceholder')}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all"
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
            
            {/* Sort options */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t('categoryPage.sortBy')}
              </h3>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all"
              >
                <option value="price-asc">{t('categoryPage.sortOptions.priceAsc')}</option>
                <option value="price-desc">{t('categoryPage.sortOptions.priceDesc')}</option>
                <option value="name-asc">{t('categoryPage.sortOptions.nameAsc')}</option>
                <option value="name-desc">{t('categoryPage.sortOptions.nameDesc')}</option>
                <option value="stock-desc">{t('categoryPage.sortOptions.stockDesc')}</option>
              </select>
            </div>
            
            {/* Filter groups */}
            <div className="space-y-4">
              {filterGroups.map((group) => (
                <div key={group.type} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    onClick={() => toggleSection(group.type)}
                    className="flex items-center justify-between w-full text-left hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {group.title}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`text-gray-500 transform transition-transform ${
                        expandedSections[group.type] ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  {expandedSections[group.type] && (
                    <div className="mt-2 ml-2 space-y-1 max-h-48 overflow-y-auto">
                      {group.options.map(option => (
                        <div key={option.id} className="flex items-center">
                          <label className="flex items-center cursor-pointer">
                            <div                   className={`w-4 h-4 mr-2 border rounded-sm flex items-center justify-center transition-all ${
                              (selectedFilters[group.type] || []).includes(option.id)
                                ? 'bg-red-600 border-red-600 text-white shadow-sm'
                                : 'border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-400'
                            }`}>
                              {(selectedFilters[group.type] || []).includes(option.id) && (
                                <Check size={12} />
                              )}
                            </div>
                            <span 
                              className="text-sm text-gray-700 dark:text-gray-300"
                              onClick={() => handleFilterChange(group.type, option.id)}
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
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="lg:col-span-3">
          {filteredComponents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <Filter size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('categoryPage.noProductsFound')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('categoryPage.noCriteriaMatch')}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                {t('categoryPage.resetFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComponents.map((component) => (
                <ProductCard
                  key={component.id}
                  id={component.id}
                  name={component.name}
                  price={component.price}
                  imageUrl={component.imageUrl}
                  category={component.categoryName}
                  type={type}
                  stock={component.stock}
                  specs={component.specifications}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}