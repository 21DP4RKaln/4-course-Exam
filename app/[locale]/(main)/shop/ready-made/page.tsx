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
import { useTheme } from '@/app/contexts/ThemeContext'
import styled from 'styled-components';
import AnimatedButton from '@/app/components/ui/animated-button'
import styles from './Advanced.module.css'

interface PC {
  id: string;
  name: string;
  category: string;
  description: string;
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
      Object.entries(pc.specs).forEach(([key, value]) => {
        if (validKeys.includes(key.toLowerCase()) && value) {
          const parts = value.split(/[,;]/).map(part => part.trim())
          parts.forEach(part => {
            if (part) options.add(part)
          })
        }
      })
    }
  })
  
  return Array.from(options)
    .filter(value => value)
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
  const { theme } = useTheme()
  
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

  const maxPrice = useMemo(() => {
    if (pcs.length === 0) return 5000
    return Math.max(...pcs.map(pc => pc.price))
  }, [pcs])

  const minPrice = useMemo(() => {
    if (pcs.length === 0) return 0
    return Math.min(...pcs.map(pc => pc.price))
  }, [pcs])

  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ 
    min: 0, 
    max: 5000 
  })

  useEffect(() => {
    if (pcs.length > 0) {
      setPriceRange({ min: minPrice, max: maxPrice })
    }
  }, [pcs, minPrice, maxPrice])

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

    // Apply price filter
    result = result.filter(pc => pc.price >= priceRange.min && pc.price <= priceRange.max)

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
  
          for (const key of Object.keys(pc.specs)) {
            if (validKeys.some(validKey => key.toLowerCase().includes(validKey))) {
              specValue = pc.specs[key].toLowerCase()
            }
          }
          
          return selectedValues.some(filter => 
            specValue.includes(filter.toLowerCase())
          )
        })
      }
    })
    
    // Apply price range filter
    result = result.filter(pc => pc.price >= priceRange.min && pc.price <= priceRange.max)
    
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
  }, [pcs, searchQuery, activeFilters, sortOption, priceRange])

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
      {/* Back button */}
      <div className="mb-3 flex justify-start">
        <AnimatedButton
          href={`/${locale}`}
          title={t('buttons.backToHome')}
          direction="left"
          className="text-gray-600 dark:text-gray-200"
        />
      </div>

      {/* Header Section */}
      <div className="mb-8 flex justify-end">
        <StyledWrapper>
          <Link href={`/${locale}/configurator`} className="button">
            <span className="fold" />
            <div className="points_wrapper">
              {Array.from({ length: 10 }).map((_, i) => (
                <i className="point" key={i} />
              ))}
            </div>
            <span className="inner">
              <Cpu className="icon" />
              {t('buttons.buildYourOwn')}
              <ArrowLeft className="icon transform rotate-180" />
            </span>
          </Link>
        </StyledWrapper>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-4 -translate-x-40 transition-transform duration-200">
            <div className="bg-blue-100/80 dark:bg-red-900/60 backdrop-blur-sm rounded-2xl border border-blue-200 dark:border-red-700/50 shadow-md">
              <AdvancedFilter
                className={styles.select}
                onFilterChange={setActiveFilters}
                onSearchChange={setSearchQuery}
                onSortChange={setSortOption}
                onPriceRangeChange={(min, max) => setPriceRange({ min, max })}
                maxPrice={maxPrice}
                minPrice={minPrice}
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
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 -translate-x-20 min-w-0">
          {filteredPCs.length === 0 ? (
            <div className="bg-white/95 dark:bg-red-900/20 backdrop-blur-sm rounded-2xl p-8 text-center border border-blue-400/50 dark:border-red-900/30 shadow-lg">
              <Info size={48} className="mx-auto text-blue-500 dark:text-red-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('shop.noProducts')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('shop.tryDifferentFilters')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredPCs.map((pc) => (
                <div key={pc.id} className="h-full flex">
                  <ProductCard
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* CTA for custom PC */}
      <div className="mt-12 relative overflow-hidden rounded-2xl">
        <div className={`absolute inset-0 
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-red-900/30' 
            : 'bg-gradient-to-r from-gray-100 via-gray-50 to-blue-100/30'
          }`}
        />
      </div>
    </div>
  )
}

const StyledWrapper = styled.div`
  .button {
    --h-button: 48px;
    --w-button: 102px;
    --round: 0.75rem;
    cursor: pointer;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.25s ease;
    background: linear-gradient(121deg, #d40b11, #5e44c7, #179aeb);
    border-radius: var(--round);
    border: none;
    outline: none;
    padding: 12px 24px;
    white-space: nowrap;
    max-width: 100%;
  }
  .button::before,
  .button::after {
    content: "";
    position: absolute;
    inset: var(--space);
    transition: all 0.5s ease-in-out;
    border-radius: calc(var(--round) - var(--space));
    z-index: 0;
  }
  .button::before {
    --space: 1px;
    background: linear-gradient(
      177.95deg,
      rgba(255, 255, 255, 0.19) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  }
  .button::after {
    --space: 2px;
    background: transparent;
      linear-gradient(0deg, #7a5af8, #7a5af8);
  }
  .button:active {
    transform: scale(0.95);
  }

  .points_wrapper {
    overflow: hidden;
    width: 100%;
    height: 100%;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }

  .points_wrapper .point {
    bottom: -10px;
    position: absolute;
    animation: floating-points infinite ease-in-out;
    pointer-events: none;
    width: 2px;
    height: 2px;
    background-color: #fff;
    border-radius: 9999px;
  }
  @keyframes floating-points {
    0% {
      transform: translateY(0);
    }
    85% {
      opacity: 0;
    }
    100% {
      transform: translateY(-55px);
      opacity: 0;
    }
  }
  .points_wrapper .point:nth-child(1) {
    left: 10%;
    opacity: 1;
    animation-duration: 2.35s;
    animation-delay: 0.2s;
  }
  .points_wrapper .point:nth-child(2) {
    left: 30%;
    opacity: 0.7;
    animation-duration: 2.5s;
    animation-delay: 0.5s;
  }
  .points_wrapper .point:nth-child(3) {
    left: 25%;
    opacity: 8;
    animation-duration: 2.2s;
    animation-delay: 0.1s;
  }
  .points_wrapper .point:nth-child(4) {
    left: 44%;
    opacity: 0.6;
    animation-duration: 2.05s;
  }
  .points_wrapper .point:nth-child(5) {
    left: 50%;
    opacity: 1;
    animation-duration: 1.9s;
  }
  .points_wrapper .point:nth-child(6) {
    left: 75%;
    opacity: 0.5;
    animation-duration: 1.5s;
    animation-delay: 1.5s;
  }
  .points_wrapper .point:nth-child(7) {
    left: 88%;
    opacity: 0.9;
    animation-duration: 2.2s;
    animation-delay: 0.2s;
  }
  .points_wrapper .point:nth-child(8) {
    left: 58%;
    opacity: 0.8;
    animation-duration: 2.25s;
    animation-delay: 0.2s;
  }
  .points_wrapper .point:nth-child(9) {
    left: 98%;
    opacity: 0.6;
    animation-duration: 2.6s;
    animation-delay: 0.1s;
  }
  .points_wrapper .point:nth-child(10) {
    left: 65%;
    opacity: 1;
    animation-duration: 2.5s;
    animation-delay: 0.2s;
  }
  .inner {
    z-index: 2;
    gap: 8px;
    position: relative;
    width: 100%;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    transition: color 0.2s ease-in-out;
  }

  .inner svg.icon {
    width: 18px;
    height: 18px;
    transition: fill 0.1s linear;
  }

  .button:focus svg.icon {
    fill: white;
  }
  .button:hover svg.icon {
    fill: transparent;
    animation:
      dasharray 1s linear forwards,
      filled forwards 0.95s;
  }
  @keyframes dasharray {
    from {
      stroke-dasharray: 0 0 0 0;
    }
    to {
      stroke-dasharray: 68 68 0 0;
    }
  }
  @keyframes filled {
    to {
      fill: white;
    }
  }
`;