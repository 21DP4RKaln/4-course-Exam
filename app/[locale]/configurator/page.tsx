'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Cpu, Monitor, HardDrive, Layers, Fan, Zap, Server } from 'lucide-react'
import ComponentSelectionPanel from '@/app/components/Configurator/ComponentSelectionPanel'
import SelectedComponentsList from '@/app/components/Configurator/SelectedComponents'

interface Component {
  id: string
  name: string
  price: number
  description: string
  imageUrl?: string
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
  
  const [activeCategory, setActiveCategory] = useState('cpu')
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component | undefined>>({})
  const [configName, setConfigName] = useState('')
  const [currentComponents, setCurrentComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(false)
  const [componentCategories, setComponentCategories] = useState<Category[]>([])
  const [isLoadingComponents, setIsLoadingComponents] = useState(false)

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

        if (uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0].id)
        }
        
      } catch (error) {
        console.error('Error fetching component categories:', error)
      }
    }
    
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchComponents = async () => {
      if (!activeCategory) return
      
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
  }, [activeCategory])

  const totalPrice = Object.values(selectedComponents).reduce(
    (sum, component) => sum + (component?.price || 0),
    0
  )

  const handleSelectComponent = (component: Component) => {
    setSelectedComponents(current => ({
      ...current,
      [activeCategory]: component
    }))
  }

  const handleSaveConfiguration = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`)
      return
    }

    if (!configName && configName.trim() === '') {
      setConfigName("My Configuration")
    }

    setLoading(true)
    try {
      setTimeout(() => {
        alert('Configuration saved as draft!')
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error saving configuration:', error)
      setLoading(false)
    }
  }

  const handleSubmitConfiguration = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`)
      return
    }

    if (!configName && configName.trim() === '') {
      setConfigName("My Configuration")
    }

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
      setTimeout(() => {
        alert('Configuration submitted for review!')
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error submitting configuration:', error)
      setLoading(false)
    }
  }

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
          <h2 className="text-lg font-medium text-white mb-4">
            Select a component
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isLoadingComponents ? (
              <div className="col-span-2 py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : currentComponents.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-gray-400">
                No components available in this category.
              </div>
            ) : (
              currentComponents.map((component) => (
                <div 
                  key={component.id}
                  className={`border rounded p-3 cursor-pointer ${
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
            configurator.selectedComponents
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
                  className="border border-dashed border-gray-700 rounded p-3 hover:border-gray-500 cursor-pointer"
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
              <p className="text-gray-400 text-sm">Total Price:</p>
              <p className="text-2xl font-bold text-white">
                €{totalPrice.toFixed(2)}
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => alert('Added to cart!')}
                disabled={totalPrice === 0}
                className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
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
                  // Here would be the actual PDF generation logic
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