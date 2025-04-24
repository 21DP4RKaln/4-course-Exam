'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Cpu, Monitor, HardDrive, Layers, Fan, Zap, Server } from 'lucide-react'
import ComponentFilterPanel from '@/app/components/Configurator/ComponentFilterPanel'

interface Component {
  id: string
  name: string
  price: number
  description: string
  imageUrl?: string
  specifications?: Record<string, string>
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
}

export default function ConfiguratorPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component | undefined>>({})
  const [configName, setConfigName] = useState('')
  const [currentComponents, setCurrentComponents] = useState<Component[]>([])
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(false)
  const [componentCategories, setComponentCategories] = useState<Category[]>([])
  const [isLoadingComponents, setIsLoadingComponents] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/components')
        if (!response.ok) throw new Error('Failed to fetch component categories')
        
        const data = await response.json()

        const categoriesMap = new Map()
        
        data.categories.forEach((cat: any) => {
          if (!categoriesMap.has(cat.name.toLowerCase())) {
            let icon
            
            switch(cat.name.toLowerCase()) {
              case 'cpu': icon = <Cpu size={20} />; break;
              case 'motherboard': icon = <Server size={20} />; break;
              case 'gpu': icon = <Monitor size={20} />; break;
              case 'ram': icon = <HardDrive size={20} />; break;
              case 'storage': icon = <HardDrive size={20} />; break;
              case 'case': icon = <Layers size={20} />; break;
              case 'cooling': icon = <Fan size={20} />; break;
              case 'psu': icon = <Zap size={20} />; break;
              default: icon = <Cpu size={20} />;
            }
            
            categoriesMap.set(cat.name.toLowerCase(), {
              id: cat.name.toLowerCase(),
              name: cat.name,
              icon
            })
          }
        })

        const uniqueCategories = Array.from(categoriesMap.values())
        
        setComponentCategories(uniqueCategories)
  
        if (!activeCategory && uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0].id)
        }
        
      } catch (error) {
        console.error('Error fetching component categories:', error)
      }
    }
    
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!activeCategory) return
    
    const fetchComponents = async () => {
      setIsLoadingComponents(true)
      try {
        const response = await fetch(`/api/components?category=${activeCategory}`)
        if (!response.ok) throw new Error('Failed to fetch components')
        
        const data = await response.json()
        setCurrentComponents(data.components || [])
      } catch (error) {
        console.error('Error fetching components:', error)
      } finally {
        setIsLoadingComponents(false)
      }
    }
    
    fetchComponents()

    setSearchQuery('')
    setActiveFilters([])
  }, [activeCategory])

  const extractWattage = useCallback((name: string): number => {
    const match = name.match(/(\d+)\s*w/i)
    if (match && match[1]) {
      return parseInt(match[1], 10)
    }
    return 0
  }, [])

  useEffect(() => {
    if (currentComponents.length === 0) return
    
    let result = [...currentComponents]
 
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(component => 
        component.name.toLowerCase().includes(query) || 
        (component.description && component.description.toLowerCase().includes(query))
      )
    }

    if (activeFilters.length > 0) {
      result = result.filter(component => {
        const componentNameLower = component.name.toLowerCase()
        const componentDescription = (component.description || '').toLowerCase()
        const specs = component.specifications || {}
        
        return activeFilters.some(filter => {
          switch (activeCategory) {
            case 'cpu':
              switch (filter) {
                case 'intel-core-i9': return componentNameLower.includes('i9') || componentNameLower.includes('intel core i9')
                case 'intel-core-i7': return componentNameLower.includes('i7') || componentNameLower.includes('intel core i7')
                case 'intel-core-i5': return componentNameLower.includes('i5') || componentNameLower.includes('intel core i5')
                case 'intel-core-i3': return componentNameLower.includes('i3') || componentNameLower.includes('intel core i3')
                case 'amd-ryzen-9': return componentNameLower.includes('ryzen 9')
                case 'amd-ryzen-7': return componentNameLower.includes('ryzen 7')
                case 'amd-ryzen-5': return componentNameLower.includes('ryzen 5')
                case 'amd-ryzen-3': return componentNameLower.includes('ryzen 3')
                default: return false
              }
              
            case 'gpu':
              switch (filter) {
                case 'nvidia-rtx-40': return componentNameLower.includes('rtx 40') || componentNameLower.includes('rtx40')
                case 'nvidia-rtx-30': return componentNameLower.includes('rtx 30') || componentNameLower.includes('rtx30')
                case 'nvidia-gtx-16': return componentNameLower.includes('gtx 16') || componentNameLower.includes('gtx16')
                case 'amd-rx-7000': return componentNameLower.includes('rx 7') || componentNameLower.includes('radeon rx 7')
                case 'amd-rx-6000': return componentNameLower.includes('rx 6') || componentNameLower.includes('radeon rx 6')
                case 'intel-arc': return componentNameLower.includes('intel arc') || componentNameLower.includes('arc')
                default: return false
              }
                
            case 'case':
              switch (filter) {
                case 'atx': 
                  return (componentNameLower.includes('atx') && !componentNameLower.includes('micro') && !componentNameLower.includes('m-atx')) ||
                         componentDescription.includes('atx') ||
                         (specs.motherboardSupport && specs.motherboardSupport.includes('ATX'))
                case 'micro-atx': 
                  return componentNameLower.includes('micro-atx') || 
                         componentNameLower.includes('matx') || 
                         componentNameLower.includes('m-atx') ||
                         (specs.motherboardSupport && specs.motherboardSupport.includes('M-ATX'))
                case 'mini-itx': 
                  return componentNameLower.includes('mini-itx') || 
                         componentNameLower.includes('itx') ||
                         (specs.motherboardSupport && specs.motherboardSupport.includes('ITX'))
                case 'full-tower': 
                  return componentNameLower.includes('full tower') || 
                         componentDescription.includes('full tower') ||
                         (specs.type && specs.type.includes('Full Tower'))
                case 'mid-tower': 
                  return componentNameLower.includes('mid-tower') || 
                         componentNameLower.includes('mid tower') || 
                         componentDescription.includes('mid tower') ||
                         (specs.type && specs.type.includes('Mid Tower'))
                default: return false
              }
                
            case 'cooling':
              switch (filter) {
                case 'air': 
                  return componentNameLower.includes('air cooler') || 
                         (specs.type && specs.type.includes('Air Cooler'))
                case 'aio': 
                  return componentNameLower.includes('aio') || 
                         componentNameLower.includes('liquid cooler') ||
                         (specs.type && specs.type.includes('AIO Liquid Cooler'))
                case 'custom-loop': 
                  return componentNameLower.includes('custom loop') || 
                         componentNameLower.includes('custom water') ||
                         (specs.type && specs.type.includes('Custom Loop'))
                case '240mm': 
                  return componentNameLower.includes('240mm') || 
                         (specs.radiatorSize && specs.radiatorSize.includes('240mm'))
                case '360mm': 
                  return componentNameLower.includes('360mm') || 
                         (specs.radiatorSize && specs.radiatorSize.includes('360mm'))
                default: return false
              }
                
            case 'motherboard':
              switch (filter) {
                case 'atx': 
                  return componentNameLower.includes('atx') && 
                         !componentNameLower.includes('micro') && 
                         !componentNameLower.includes('m-atx')
                case 'micro-atx': 
                  return componentNameLower.includes('micro-atx') || 
                         componentNameLower.includes('matx') || 
                         componentNameLower.includes('m-atx')
                case 'mini-itx': 
                  return componentNameLower.includes('mini-itx') || 
                         componentNameLower.includes('itx')
                default: return false
              }
                
            case 'psu':
              switch (filter) {
                case '1000w+': return extractWattage(componentNameLower) >= 1000
                case '850w-999w': return extractWattage(componentNameLower) >= 850 && extractWattage(componentNameLower) < 1000
                case '750w-849w': return extractWattage(componentNameLower) >= 750 && extractWattage(componentNameLower) < 850
                case '650w-749w': return extractWattage(componentNameLower) >= 650 && extractWattage(componentNameLower) < 750
                case 'below-650w': return extractWattage(componentNameLower) < 650
                default: return false
              }
                
            default:
              return componentNameLower.includes(filter) || componentDescription.includes(filter)
          }
        })
      })
    }
    
    setFilteredComponents(result)
  }, [currentComponents, searchQuery, activeFilters, activeCategory, extractWattage])

  const totalPrice = useMemo(() => {
    return Object.values(selectedComponents).reduce(
      (sum, component) => sum + (component?.price || 0),
      0
    )
  }, [selectedComponents])

  const handleSelectComponent = useCallback((component: Component) => {
    setSelectedComponents(current => ({
      ...current,
      [activeCategory]: component
    }))
  }, [activeCategory])

  const handleSaveConfiguration = useCallback(async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`)
      return
    }

    const configNameToUse = configName.trim() || "My Configuration"
    setConfigName(configNameToUse)

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      alert('Configuration saved as draft!')
    } catch (error) {
      console.error('Error saving configuration:', error)
    } finally {
      setLoading(false)
    }
  }, [configName, isAuthenticated, router, locale])

  const handleSubmitConfiguration = useCallback(async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`)
      return
    }

    const configNameToUse = configName.trim() || "My Configuration"
    setConfigName(configNameToUse)

    const requiredCategories = componentCategories
      .filter(cat => ['cpu', 'motherboard', 'ram', 'storage', 'psu'].includes(cat.id))
      .map(cat => cat.id)
    
    const missingComponents = requiredCategories.filter(cat => !selectedComponents[cat])

    if (missingComponents.length > 0) {
      alert(`Please select the following components: ${missingComponents.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      alert('Configuration submitted for review!')
    } catch (error) {
      console.error('Error submitting configuration:', error)
    } finally {
      setLoading(false)
    }
  }, [configName, isAuthenticated, router, locale, componentCategories, selectedComponents])

  const handleFilterChange = useCallback((filters: string[]) => {
    setActiveFilters(filters)
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Custom PC Configurator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Category selection - Left column */}
        <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-medium text-white mb-4">
            Select a component category
          </h2>
          
          <ul className="space-y-2">
            {componentCategories.map(category => (
              <li key={category.id}>
                <button
                  className={`w-full flex items-center px-3 py-2 rounded ${
                    activeCategory === category.id
                      ? 'bg-gray-800 text-red-500'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="mr-3">{category.icon}</span>
                  <span>{category.name}</span>
                  {selectedComponents[category.id] && (
                    <span className="ml-auto text-green-500">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Component selection - Middle column */}
        <div className="lg:col-span-6 bg-gray-900 rounded-lg p-4">
          {/* Component Filter Panel */}
          <ComponentFilterPanel 
            category={activeCategory}
            onFilterChange={handleFilterChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
          
          <h2 className="text-lg font-medium text-white mb-4">
            Select a component
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isLoadingComponents ? (
              <div className="col-span-2 py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : filteredComponents.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-gray-400">
                {searchQuery || activeFilters.length > 0 
                  ? "No components match your filters. Try adjusting your search or filters."
                  : "No components available in this category."}
              </div>
            ) : (
              filteredComponents.map((component) => (
                <div 
                  key={component.id}
                  className={`border rounded-lg p-3 cursor-pointer ${
                    selectedComponents[activeCategory]?.id === component.id 
                      ? 'border-red-500 bg-gray-800' 
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                  onClick={() => handleSelectComponent(component)}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center mr-3">
                      <span className="text-gray-500 text-xs">{activeCategory}</span>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-medium text-white">
                        {component.name}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {component.description || 'No description available'}
                      </p>
                    </div>
                    
                    <div className="ml-3 text-right">
                      <p className="font-bold text-white">
                        €{component.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected components - Right column */}
        <div className="lg:col-span-4 bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-medium text-white mb-4">
            Selected Components
          </h2>
          
          <div className="space-y-3">
            {Object.entries(selectedComponents)
              .filter(([_, component]) => component !== undefined)
              .map(([categoryId, component]) => {
                const category = componentCategories.find(cat => cat.id === categoryId);
                return (
                  <div 
                    key={categoryId}
                    className="border border-gray-700 rounded p-3"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center mr-3">
                        {category?.icon}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white">
                            {category?.name || categoryId}
                          </h3>
                          <button 
                            onClick={() => setActiveCategory(categoryId)}
                            className="ml-2 text-gray-400 hover:text-red-500"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-sm text-gray-400">
                          {component!.name}
                        </p>
                        <div className="mt-1 text-right">
                          <span className="font-bold text-white">
                            €{component!.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
            {/* Empty slots */}
            {componentCategories
              .filter(category => !selectedComponents[category.id])
              .map(category => (
                <div 
                  key={category.id}
                  className="border border-dashed border-gray-700 rounded-lg p-3 hover:border-gray-500 cursor-pointer"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center mr-3">
                      {category.icon}
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-medium text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 italic">
                        Click to select a {category.name.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Configuration details section - Moved to right column */}
          <div className="mt-6 border-t border-gray-700 pt-4">
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm mb-4"
              placeholder="Configuration name"
            />
            
            <div className="mb-4">
              <p className="text-sm text-gray-400">Total Price:</p>
              <p className="text-2xl font-bold text-white">
                €{totalPrice.toFixed(2)}
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => alert('Added to cart!')}
                disabled={totalPrice === 0}
                className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              
              <button
                onClick={handleSaveConfiguration}
                disabled={loading}
                className="w-full py-2 px-4 bg-gray-800 text-white border border-gray-700 rounded hover:bg-gray-700 text-sm"
              >
                Save as draft
              </button>
              
              <button
                onClick={handleSubmitConfiguration}
                disabled={loading}
                className="w-full py-2 px-4 bg-gray-800 text-white border border-gray-700 rounded hover:bg-gray-700 text-sm"
              >
                {loading ? 'Processing...' : 'Submit configuration'}
              </button>
              
              <button
                onClick={() => {
                  if (totalPrice === 0) {
                    alert('Please select at least one component before generating a PDF');
                    return;
                  }
                  alert('Generating PDF with configuration details...');
                }}
                disabled={totalPrice === 0}
                className="w-full py-2 px-4 bg-gray-800 text-white border border-gray-700 rounded hover:bg-gray-700 text-sm flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}