'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Cpu, Monitor, Memory, HardDrive, Layers, Fan, Zap, Server, Save, Send } from 'lucide-react'
import ComponentSelectionPanel from '@/app/components/Configurator/ComponentSelectionPanel'
import ConfigurationSummary from '@/app/components/Configurator/ConfigurationSummary'
import SelectedComponentsList from '@/app/components/Configurator/SelectedComponentsList'

// Component categories
const componentCategories = [
  { id: 'cpu', name: 'CPU', icon: <Cpu size={24} /> },
  { id: 'motherboard', name: 'Motherboard', icon: <Server size={24} /> },
  { id: 'gpu', name: 'Graphics Card', icon: <Monitor size={24} /> },
  { id: 'ram', name: 'Memory', icon: <Memory size={24} /> },
  { id: 'storage', name: 'Storage', icon: <HardDrive size={24} /> },
  { id: 'case', name: 'Case', icon: <Layers size={24} /> },
  { id: 'cooling', name: 'Cooling', icon: <Fan size={24} /> },
  { id: 'psu', name: 'Power Supply', icon: <Zap size={24} /> },
]

// Mock components for development (will be fetched from API)
const mockComponents = {
  cpu: [
    { id: 'cpu1', name: 'Intel Core i9-14900K', price: 649.99, description: 'High-end gaming CPU, 24 cores' },
    { id: 'cpu2', name: 'AMD Ryzen 9 7950X', price: 599.99, description: '16 cores, 32 threads, 5.7GHz' },
    { id: 'cpu3', name: 'Intel Core i7-14700K', price: 449.99, description: '20 cores, high performance' },
    { id: 'cpu4', name: 'AMD Ryzen 7 7700X', price: 349.99, description: '8 cores, 16 threads, 5.4GHz' },
  ],
  motherboard: [
    { id: 'mb1', name: 'ASUS ROG Maximus Z790', price: 549.99, description: 'High-end Intel motherboard' },
    { id: 'mb2', name: 'MSI MPG X670E', price: 499.99, description: 'Top-tier AMD motherboard' },
    { id: 'mb3', name: 'Gigabyte Z790 AORUS', price: 349.99, description: 'Mid-range Intel motherboard' },
    { id: 'mb4', name: 'ASRock B650 Pro RS', price: 199.99, description: 'Budget AMD motherboard' },
  ],
  // Other component types would be populated similarly
}

export default function ConfiguratorPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [activeCategory, setActiveCategory] = useState('cpu')
  const [selectedComponents, setSelectedComponents] = useState<Record<string, any>>({})
  const [configName, setConfigName] = useState('')
  const [configDescription, setConfigDescription] = useState('')
  const [loading, setLoading] = useState(false)

  // Get components for active category
  const currentComponents = mockComponents[activeCategory as keyof typeof mockComponents] || []

  // Calculate total price
  const totalPrice = Object.values(selectedComponents).reduce(
    (sum, component) => sum + component.price,
    0
  )

  // Handle component selection
  const handleSelectComponent = (component: any) => {
    setSelectedComponents(current => ({
      ...current,
      [activeCategory]: component
    }))
  }

  // Handle saving configuration
  const handleSaveConfiguration = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push(`/${pathname.split('/')[1]}/auth/login`)
      return
    }

    if (!configName) {
      alert('Please enter a configuration name')
      return
    }

    setLoading(true)
    try {
      // This would be an API call to save the configuration
      console.log('Saving configuration:', {
        name: configName,
        description: configDescription,
        components: selectedComponents,
        totalPrice
      })
      
      // Mock successful save
      setTimeout(() => {
        alert('Configuration saved successfully!')
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error saving configuration:', error)
      setLoading(false)
    }
  }

  // Handle submitting configuration for review
  const handleSubmitConfiguration = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push(`/${pathname.split('/')[1]}/auth/login`)
      return
    }

    if (!configName) {
      alert('Please enter a configuration name')
      return
    }

    // Check if all required components are selected
    const requiredCategories = ['cpu', 'motherboard', 'ram', 'storage', 'psu']
    const missingComponents = requiredCategories.filter(cat => !selectedComponents[cat])

    if (missingComponents.length > 0) {
      alert(`Please select the following components: ${missingComponents.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      // This would be an API call to submit the configuration
      console.log('Submitting configuration for review:', {
        name: configName,
        description: configDescription,
        components: selectedComponents,
        totalPrice
      })
      
      // Mock successful submission
      setTimeout(() => {
        alert('Configuration submitted for review!')
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error submitting configuration:', error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('configurator.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Category sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('configurator.selectCategory')}
          </h2>
          
          <ul className="space-y-2">
            {componentCategories.map(category => (
              <li key={category.id}>
                <button
                  className={`w-full flex items-center px-4 py-2 rounded-md ${
                    activeCategory === category.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
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

        {/* Main content area */}
        <div className="md:col-span-3 space-y-6">
          {/* Component selection */}
          <ComponentSelectionPanel
            components={currentComponents}
            selectedComponent={selectedComponents[activeCategory]}
            onSelectComponent={handleSelectComponent}
            category={activeCategory}
          />

          {/* Selected components list */}
          <SelectedComponentsList
            components={selectedComponents}
            categories={componentCategories}
            onEdit={setActiveCategory}
          />

          {/* Configuration details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Configuration Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="configName" className="form-label">
                  {t('configurator.configName')}*
                </label>
                <input
                  id="configName"
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="form-input"
                  placeholder="Gaming PC, Workstation, etc."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="configDescription" className="form-label">
                  {t('configurator.configDescription')}
                </label>
                <textarea
                  id="configDescription"
                  value={configDescription}
                  onChange={(e) => setConfigDescription(e.target.value)}
                  className="form-input h-24"
                  placeholder="Describe your configuration..."
                />
              </div>
            </div>
          </div>

          {/* Summary and actions */}
          <ConfigurationSummary
            totalPrice={totalPrice}
            onSave={handleSaveConfiguration}
            onSubmit={handleSubmitConfiguration}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}