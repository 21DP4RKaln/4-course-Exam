'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Info, Cpu, ArrowLeft } from 'lucide-react'
import ProductCard from '@/app/components/Shop/ProductCard'
import AdvancedFilter from '@/app/components/Shop/AdvancedFilter'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'

interface PC {
  id: string;
  name: string;
  category: string;  description: string;
  specs: Record<string, string>;
  price: number;
  imageUrl: string | null;
  stock: number;
}

const specMapping: Record<string, string[]> = {
  'cpu': ['cpu', 'processor', 'processors'],
  'gpu': ['gpu', 'graphics', 'graphicscard', 'graphics card', 'video card'],
  'ram': ['ram', 'memory', 'memories'],
  'storage': ['storage', 'storage', 'drive', 'disk', 'ssd', 'hdd'],
  'motherboard': ['motherboard', 'mb', 'mainboard', 'system board'],
  'psu': ['psu', 'powersupply', 'power supply', 'power'],
  'case': ['case', 'chassis', 'tower', 'enclosure'],
  'cooling': ['cooling', 'cooler', 'fan', 'radiator']
}

function getValidKeysForSpec(specKey: string): string[] {
  return specMapping[specKey.toLowerCase()] || [specKey.toLowerCase()]
}

function extractOptions(pcs: PC[], specKey: string) {
  const options = new Set<string>()
  const validKeys = getValidKeysForSpec(specKey)
  
  pcs.forEach(pc => {
    if (pc.specs) {
      // Go through each spec and check if its key matches any of our valid keys
      Object.entries(pc.specs).forEach(([key, value]) => {
        if (validKeys.includes(key.toLowerCase()) && value) {
          // Split in case the value contains multiple items (e.g., "2x 16GB RAM")
          const parts = value.split(/[,;]/).map(part => part.trim())
          parts.forEach(part => {
            if (part) options.add(part)
          })
        }
      })
    }
  })
  
  return Array.from(options)
    .filter(value => value) // Remove empty values
    .map(value => ({
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
  
  const initialFilters = {
    category: [],
    cpu: [],
    gpu: [],
    ram: [],
    storage: [],
    motherboard: [],
    psu: [],
    case: [],
    cooling: []
  }
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(initialFilters)
  const [sortOption, setSortOption] = useState('price-asc')

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

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>()
    pcs.forEach(pc => categories.add(pc.category))
    return Array.from(categories).map(cat => ({ id: cat, name: cat }))
  }, [pcs])
  const cpuOptions = useMemo(() => extractOptions(pcs, 'cpu'), [pcs])
  const gpuOptions = useMemo(() => extractOptions(pcs, 'gpu'), [pcs])
  const ramOptions = useMemo(() => extractOptions(pcs, 'ram'), [pcs])
  const storageOptions = useMemo(() => extractOptions(pcs, 'storage'), [pcs])
  const motherboardOptions = useMemo(() => extractOptions(pcs, 'motherboard'), [pcs])
  const psuOptions = useMemo(() => extractOptions(pcs, 'psu'), [pcs])
  const caseOptions = useMemo(() => extractOptions(pcs, 'case'), [pcs])
  const coolingOptions = useMemo(() => extractOptions(pcs, 'cooling'), [pcs])

  useEffect(() => {
    let result = [...pcs]
    
    // Apply text search
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

    // Apply category filters
    if (activeFilters.category && activeFilters.category.length > 0) {
      result = result.filter(pc => activeFilters.category.includes(pc.category))
    }

    // Apply component-specific filters
    Object.entries(activeFilters).forEach(([filterType, selectedValues]) => {
      if (filterType !== 'category' && selectedValues && selectedValues.length > 0) {
        result = result.filter(pc => {
          if (!pc.specs) return false
          
          const validKeys = getValidKeysForSpec(filterType)
          let specValue = ''
            // Check all specs that might match our filter type
          for (const key of Object.keys(pc.specs)) {
            // If this spec key matches any of our valid keys
            if (validKeys.some(validKey => key.toLowerCase().includes(validKey))) {
              specValue = pc.specs[key].toLowerCase()
              // Don't break here - we might have multiple matching specs
            }
          }
          
          return selectedValues.some(filter => 
            specValue.includes(filter.toLowerCase())
          )
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
    }
    
    setFilteredPCs(result)
  }, [pcs, searchQuery, activeFilters, sortOption])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
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
          {t('buttons.backToHome')}
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('nav.readyMade')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('shop.readyMade.description')}
          </p>
        </div>
        
        <Link
          href={`/${locale}/configurator`}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
        >
          <Cpu size={18} className="mr-2" /> 
          {t('buttons.buildYourOwn')}
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters - 1/4 width on large screens */}
        <div className="lg:col-span-1">          <AdvancedFilter
            onFilterChange={setActiveFilters}
            onSearchChange={setSearchQuery}
            onSortChange={setSortOption}
            categories={categoryOptions}
            cpuOptions={cpuOptions}
            gpuOptions={gpuOptions}
            ramOptions={ramOptions}
            storageOptions={storageOptions}
            motherboardOptions={motherboardOptions}
            psuOptions={psuOptions}
            caseOptions={caseOptions}
            coolingOptions={coolingOptions}
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
              {filteredPCs.map((pc) => (                <ProductCard
                  key={pc.id}
                  id={pc.id}
                  name={pc.name}
                  price={pc.price}
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