'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/app/contexts/CartContext'
import Link from 'next/link'
import { 
  ShoppingCart, 
  Heart, 
  Filter, 
  ChevronDown, 
  Cpu, 
  Monitor, 
  HardDrive, 
  Zap,
  Search,
  X,
  Info,
  AlertTriangle
} from 'lucide-react'
import { getReadyMadePCs, type PC } from '@/lib/services/shopService'

const pcCategories = [
  { id: 'gaming', name: 'Gaming PCs' },
  { id: 'workstation', name: 'Workstations' },
  { id: 'office', name: 'Office PCs' },
  { id: 'budget', name: 'Budget PCs' },
]

interface FilterState {
  category: string;
  priceRange: [number, number];
  sort: string;
  search: string;
}

export default function ReadyMadePCsPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const { addItem } = useCart()
  const locale = pathname.split('/')[1]
  
  const [pcs, setPcs] = useState<PC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 5000],
    sort: 'featured',
    search: ''
  })
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [filteredPCs, setFilteredPCs] = useState<PC[]>([])
  const [hoveredPC, setHoveredPC] = useState<string | null>(null)
  const [expandedSpecs, setExpandedSpecs] = useState<string | null>(null)
  
  // Fetch PCs from the API
  useEffect(() => {
    const fetchPCs = async () => {
      setLoading(true)
      try {
        const data = await getReadyMadePCs()
        setPcs(data)
      } catch (err) {
        console.error('Error fetching ready-made PCs:', err)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPCs()
  }, [])
  
  // Apply filters
  useEffect(() => {
    if (pcs.length === 0) return
    
    let result = [...pcs]
    
    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter(pc => pc.category === filters.category)
    }
    
    // Filter by price range
    result = result.filter(pc => {
      const price = pc.discountPrice || pc.price
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(pc => 
        pc.name.toLowerCase().includes(searchTerm) || 
        pc.description.toLowerCase().includes(searchTerm) ||
        Object.values(pc.specs).some(spec => 
          typeof spec === 'string' && spec.toLowerCase().includes(searchTerm)
        )
      )
    }
    
    // Sort results
    switch (filters.sort) {
      case 'featured':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
      case 'price-asc':
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price))
        break
      case 'price-desc':
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price))
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
    }
    
    setFilteredPCs(result)
  }, [filters, pcs])
  
  const toggleSpecs = (id: string) => {
    if (expandedSpecs === id) {
      setExpandedSpecs(null)
    } else {
      setExpandedSpecs(id)
    }
  }
  
  const handleAddToCart = (pc: PC) => {
    addItem({
      id: pc.id,
      type: 'configuration',
      name: pc.name,
      price: pc.discountPrice || pc.price,
      imageUrl: pc.imageUrl || ''
    })
  }
  
  const resetFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 5000],
      sort: 'featured',
      search: ''
    })
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }
  
  // Handle error state
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
      <div className="flex flex-wrap items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          {t('nav.readyMade')}
        </h1>
        
        {/* Search bar - desktop */}
        <div className="hidden md:flex w-full md:w-auto">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search PCs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({...filters, search: ''})}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Search bar - mobile */}
      <div className="md:hidden mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            placeholder="Search PCs..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({...filters, search: ''})}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main content area with sidebar and product grid */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter sidebar - desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
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
            
            {/* Category filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Category
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="all"
                    type="radio"
                    checked={filters.category === 'all'}
                    onChange={() => setFilters({...filters, category: 'all'})}
                    className="h-4 w-4 text-red-600 accent-red-600"
                  />
                  <label htmlFor="all" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    All Categories
                  </label>
                </div>
                
                {pcCategories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input
                      id={category.id}
                      type="radio"
                      checked={filters.category === category.id}
                      onChange={() => setFilters({...filters, category: category.id})}
                      className="h-4 w-4 text-red-600 accent-red-600"
                    />
                    <label htmlFor={category.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price range filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Price Range
              </h3>
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-full">
                  <label className="sr-only">Minimum Price</label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: [parseInt(e.target.value), filters.priceRange[1]]
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-full">
                  <label className="sr-only">Maximum Price</label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  €{filters.priceRange[0]}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  €{filters.priceRange[1]}
                </span>
              </div>
            </div>
            
            {/* Sort options */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Sort By
              </h3>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({...filters, sort: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Mobile filter button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <Filter size={18} className="mr-2" />
            Filters
            <ChevronDown size={18} className="ml-2" />
          </button>
        </div>
        
        {/* Mobile filter panel */}
        {isMobileFilterOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h2>
              <button
                onClick={resetFilters}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Reset
              </button>
            </div>
            
            {/* Mobile filters content - simplified version */}
            <div className="space-y-6">
              {/* Category filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Category
                </h3>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Categories</option>
                  {pcCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Sort By
                </h3>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({...filters, sort: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
              
              {/* Price range filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Price Range: €{filters.priceRange[0]} - €{filters.priceRange[1]}
                </h3>
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">€0</span>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">€5000</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Apply
              </button>
            </div>
          </div>
        )}
        
        {/* Main product grid */}
        <div className="flex-1">
          {filteredPCs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <Info size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No PCs Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find any PCs matching your current filters.
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
              {filteredPCs.map((pc) => (
                <div 
                  key={pc.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  onMouseEnter={() => setHoveredPC(pc.id)}
                  onMouseLeave={() => setHoveredPC(null)}
                >
                  {/* PC image (placeholder) */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">
                      PC Image
                    </span>
                    
                    {/* Featured badge */}
                    {pc.featured && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                    
                    {/* Stock indicator */}
                    <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                      pc.stock <= 3 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {pc.stock <= 3 ? `Only ${pc.stock} left` : 'In Stock'}
                    </span>
                    
                    {/* Quick action buttons */}
                    {hoveredPC === pc.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddToCart(pc)}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                            aria-label="Add to cart"
                          >
                            <ShoppingCart size={20} />
                          </button>
                          <button
                            className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100"
                            aria-label="Add to wishlist"
                          >
                            <Heart size={20} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {pc.name}
                      </h3>
                      <button
                        onClick={() => toggleSpecs(pc.id)}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm"
                      >
                        Specs
                      </button>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                      {pc.description}
                    </p>
                    
                    {/* Expanded specs */}
                    {expandedSpecs === pc.id && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md mb-3">
                        <ul className="text-sm space-y-1">
                          <li className="flex items-center">
                            <Cpu size={14} className="text-gray-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {pc.specs.cpu}
                            </span>
                          </li>
                          <li className="flex items-center">
                            <Monitor size={14} className="text-gray-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {pc.specs.gpu}
                            </span>
                          </li>
                          <li className="flex items-center">
                            <HardDrive size={14} className="text-gray-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {pc.specs.ram} / {pc.specs.storage}
                            </span>
                          </li>
                          <li className="flex items-center">
                            <Zap size={14} className="text-gray-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {pc.specs.psu}
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-end justify-between">
                      <div>
                        {pc.discountPrice ? (
                          <div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              €{pc.discountPrice.toFixed(2)}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                              €{pc.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            €{pc.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link 
                          href={`/${locale}/shop/product/${pc.id}`}
                          className="p-2 text-gray-700 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleAddToCart(pc)}
                          className="p-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          <ShoppingCart size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}