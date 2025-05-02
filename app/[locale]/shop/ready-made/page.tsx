'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Info, Cpu, ArrowLeft } from 'lucide-react'
import ProductCard from '@/app/components/Shop/ProductCard'
import AdvancedFilter from '@/app/components/Shop/AdvancedFilter'

interface PC {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: Record<string, string>;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stock: number;
}

// Helper function to extract unique options from PCs
function extractOptions(pcs: PC[], specKey: string) {
  const options = new Set<string>()
  
  pcs.forEach(pc => {
    if (pc.specs && pc.specs[specKey]) {
      options.add(pc.specs[specKey])
    }
  })
  
  return Array.from(options).map(value => ({
    id: value,
    name: value
  }))
}

export default function ReadyMadePCsPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]
  
  const [pcs, setPcs] = useState<PC[]>([])
  const [filteredPCs, setFilteredPCs] = useState<PC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    category: [],
    cpu: [],
    gpu: [],
    ram: [],
    storage: []
  })
  const [sortOption, setSortOption] = useState('price-asc')

  // Fetch PCs data
  useEffect(() => {
    const fetchPCs = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/shop/product?category=pc')
        
        if (!response.ok) {
          throw new Error('Failed to load products')
        }
        
        const data = await response.json()
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
  
  // Extract filter options from PC data
  const categoryOptions = useMemo(() => {
    const categories = new Set<string>()
    pcs.forEach(pc => categories.add(pc.category))
    return Array.from(categories).map(cat => ({ id: cat, name: cat }))
  }, [pcs])
  
  const cpuOptions = useMemo(() => extractOptions(pcs, 'cpu'), [pcs])
  const gpuOptions = useMemo(() => extractOptions(pcs, 'gpu'), [pcs])
  const ramOptions = useMemo(() => extractOptions(pcs, 'ram'), [pcs])
  const storageOptions = useMemo(() => extractOptions(pcs, 'storage'), [pcs])
  
  // Apply filters and sorting
  useEffect(() => {
    if (pcs.length === 0) return
    
    let result = [...pcs]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(pc => 
        pc.name.toLowerCase().includes(query) || 
        pc.description.toLowerCase().includes(query) ||
        Object.entries(pc.specs).some(([key, value]) => 
          value.toString().toLowerCase().includes(query)
        )
      )
    }
    
    // Apply category filter
    if (activeFilters.category && activeFilters.category.length > 0) {
      result = result.filter(pc => activeFilters.category.includes(pc.category))
    }
    
    // Apply component filters
    ['cpu', 'gpu', 'ram', 'storage'].forEach(filterType => {
      if (activeFilters[filterType] && activeFilters[filterType].length > 0) {
        result = result.filter(pc => 
          pc.specs && 
          pc.specs[filterType] && 
          activeFilters[filterType].includes(pc.specs[filterType])
        )
      }
    })
    
    // Apply sorting
    switch (sortOption) {
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
  }, [pcs, searchQuery, activeFilters, sortOption])

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
      {/* Back button and title */}
      <div className="mb-6">
        <Link 
          href={`/${locale}`}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          {t('nav.readyMade')}
        </h1>
        
        <Link
          href={`/${locale}/configurator`}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
        >
          <Cpu size={18} className="mr-2" /> 
          Make Your Own PC
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters - 1/4 width on large screens */}
        <div className="lg:col-span-1">
          <AdvancedFilter
            onFilterChange={setActiveFilters}
            onSearchChange={setSearchQuery}
            onSortChange={setSortOption}
            categories={categoryOptions}
            cpuOptions={cpuOptions}
            gpuOptions={gpuOptions}
            ramOptions={ramOptions}
            storageOptions={storageOptions}
          />
        </div>
        
        {/* Product grid - 3/4 width on large screens */}
        <div className="lg:col-span-3">
          {filteredPCs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <Info size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Products Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find any PCs matching your current filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPCs.map((pc) => (
                <ProductCard
                  key={pc.id}
                  id={pc.id}
                  name={pc.name}
                  price={pc.price}
                  discountPrice={pc.discountPrice}
                  imageUrl={pc.imageUrl}
                  category={pc.category}
                  type="configuration"
                  stock={pc.stock}
                  specs={pc.specs}
                  showRating={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* CTA for custom PC */}
      <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-red-900/30 dark:to-gray-900 rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Can't Find The Perfect PC?
        </h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Build your own custom configuration with our PC Builder tool. Select from our wide range of components and create a PC that perfectly suits your needs.
        </p>
        <Link
          href={`/${locale}/configurator`}
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          <Cpu size={20} className="mr-2" />
          Build Your Own PC
        </Link>
      </div>
    </div>
  )
}