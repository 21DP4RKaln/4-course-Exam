'use client'

import { useState, useEffect } from 'react'
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
  params: { 
    slug: string;
  };
  type?: 'component' | 'peripheral';
}

export default function CategoryPage({ params, type = 'component' }: CategoryPageProps) {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]
  const categorySlug = params.slug

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
  
  // Determine API endpoint based on type
  const apiEndpoint = type === 'peripheral' ? 
    `/api/components?category=${categorySlug}&type=peripherals` : 
    `/api/components?category=${categorySlug}&type=components`;

  useEffect(() => {
    const fetchComponentsData = async () => {
      setLoading(true)
      try {
        const response = await fetch(apiEndpoint)
        
        if (!response.ok) {
          throw new Error(`Failed to load ${type}s data`)
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
          
          // Initialize expandedSections state with first few sections expanded
          const initialExpandedSections: Record<string, boolean> = {}
          
          // Create organized filter groups
          const groups = organizeFiltersIntoGroups(data.specifications)
          setFilterGroups(groups)
          
          // First 3 sections expanded by default
          groups.slice(0, 3).forEach(group => {
            initialExpandedSections[group.type] = true
          })
          
          setExpandedSections(initialExpandedSections)
          
          // Initialize selected filters object with all possible filter types
          const initialSelectedFilters: Record<string, string[]> = {}
          groups.forEach(group => {
            initialSelectedFilters[group.type] = []
          })
          setSelectedFilters(initialSelectedFilters)
        }
      } catch (err) {
        console.error(`Error fetching ${type}s:`, err)
        setError(`Failed to load ${type}s. Please try again later.`)
      } finally {
        setLoading(false)
      }
    }
    
    fetchComponentsData()
  }, [categorySlug, type, apiEndpoint])

  // Organize specifications into logical filter groups
  const organizeFiltersIntoGroups = (specs: Specification[]): FilterGroup[] => {
    const groups: FilterGroup[] = []
    const groupMappings: Record<string, string> = {
      // Common groupings for all component types
      'brand': 'Manufacturer',
      'manufacturer': 'Manufacturer',
      'model': 'Model',
      
      // CPUs
      'socket': 'Socket',
      'cores': 'Cores',
      'threads': 'Threads',
      'frequency': 'Frequency',
      'architecture': 'Architecture',
      
      // GPUs
      'memory': 'Memory',
      'memoryType': 'Memory Type',
      'interface': 'Interface',
      
      // Mice & Peripherals
      'sensor': 'Sensor',
      'dpi': 'DPI',
      'rgb': 'RGB',
      'connection': 'Connection',
      'wireless': 'Connection',
      'switches': 'Switches',
      'polling': 'Polling Rate',
      
      // RAM
      'capacity': 'Capacity',
      'speed': 'Speed',
      'cas': 'CAS Latency',
      
      // Add more mappings as needed
    }
    
    // Special category for General filters (catch-all)
    const generalGroup: FilterGroup = {
      title: 'General',
      type: 'general',
      options: []
    }
    
    // Special category for Manufacturer
    const manufacturerGroup: FilterGroup = {
      title: 'Manufacturer',
      type: 'manufacturer',
      options: []
    }
    
    // Create groups dictionary to easily access existing groups
    const groupMap: Record<string, FilterGroup> = {}
    
    specs.forEach(spec => {
      const specName = spec.name.toLowerCase()
      const specDisplayName = spec.displayName
      
      // Determine which group this spec belongs to
      let groupName = 'general' // Default fallback group
      
      if (specName.includes('brand') || specName.includes('manufacturer')) {
        groupName = 'manufacturer'
      } else {
        // Try to match with our mapping dictionary
        for (const [key, value] of Object.entries(groupMappings)) {
          if (specName.includes(key.toLowerCase())) {
            groupName = key
            break
          }
        }
      }
      
      // Get or create the group
      let group = groupMap[groupName]
      if (!group) {
        group = {
          title: groupMappings[groupName] || specDisplayName,
          type: groupName,
          options: []
        }
        groupMap[groupName] = group
      }
      
      // Add spec options to the group
      spec.values.forEach(value => {
        group.options.push({
          id: `${spec.name}=${value}`,
          name: value
        })
      })
    })
    
    // Add any manufacturer options to the manufacturer group
    if (manufacturerGroup.options.length > 0) {
      groups.push(manufacturerGroup)
    }
    
    // Add the rest of the groups (sorted alphabetically)
    const sortedGroups = Object.values(groupMap)
      .filter(g => g.type !== 'manufacturer' && g.type !== 'general' && g.options.length > 0)
      .sort((a, b) => a.title.localeCompare(b.title))
    
    // Add sorted groups
    groups.push(...sortedGroups)
    
    // Add general group at the end if it has options
    if (generalGroup.options.length > 0) {
      groups.push(generalGroup)
    }
    
    return groups
  }

  // Handle filter changes
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

  // Toggle filter section expansion
  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Apply filters and search
  useEffect(() => {
    if (components.length === 0) return
    
    let result = [...components]
    
    // Apply search filter
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
    
    // Apply specification filters
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
    
    // Apply sorting
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

  // Reset all filters
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
      <div className="max-w-7xl mx-auto flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
          Try Again
        </button>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link
            href={`/${locale}/${type}s`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to {type === 'peripheral' ? 'Peripherals' : 'Components'}
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {categoryName}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          {filteredComponents.length} {filteredComponents.length === 1 ? 'item' : 'items'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Filter size={18} className="mr-2" />
                Filters
              </h2>
              
              <button
                onClick={resetFilters}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Reset
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
                placeholder="Search products..."
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
            
            {/* Sort options */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Sort By
              </h3>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="stock-desc">Stock Availability</option>
              </select>
            </div>
            
            {/* Filter groups */}
            <div className="space-y-4">
              {filterGroups.map((group) => (
                <div key={group.type} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    onClick={() => toggleSection(group.type)}
                    className="flex items-center justify-between w-full text-left"
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
                            <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                              (selectedFilters[group.type] || []).includes(option.id)
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'border-gray-300 dark:border-gray-600'
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <Filter size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Products Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find any products matching your current criteria.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reset Filters
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