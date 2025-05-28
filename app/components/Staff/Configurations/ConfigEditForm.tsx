'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { 
  Save, 
  X, 
  Plus, 
  Minus, 
  AlertCircle,
  Package,
  ChevronDown,
  Search
} from 'lucide-react'
import Loading from '@/app/components/ui/Loading'

interface Component {
  id: string
  name: string
  category: string
  categoryId: string
  price: number
  stock: number
}

interface ConfigurationComponent {
  id: string
  name: string
  category: string
  categoryId: string
  price: number
  quantity: number
}

interface Configuration {
  id?: string
  name: string
  description?: string
  components: ConfigurationComponent[]
  totalPrice: number
  status?: string
}

interface ConfigEditFormProps {
  configuration?: Configuration
  onSave?: (data: Configuration) => void
  onCancel?: () => void
}

export function ConfigEditForm({ configuration, onSave, onCancel }: ConfigEditFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [availableComponents, setAvailableComponents] = useState<Component[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<Configuration>({
    name: configuration?.name || '',
    description: configuration?.description || '',
    components: configuration?.components || [],
    totalPrice: configuration?.totalPrice || 0
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchComponents(selectedCategory)
    }
  }, [selectedCategory])

  useEffect(() => {
    calculateTotalPrice()
  }, [formData.components])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/components?type=components')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchComponents = async (categorySlug: string) => {
    try {
      const response = await fetch(`/api/components?category=${categorySlug}`)
      if (!response.ok) throw new Error('Failed to fetch components')
      const data = await response.json()
      setAvailableComponents(data.components)
    } catch (error) {
      console.error('Error fetching components:', error)
    }
  }

  const calculateTotalPrice = () => {
    const total = formData.components.reduce((sum, component) => {
      return sum + (component.price * component.quantity)
    }, 0)
    setFormData(prev => ({ ...prev, totalPrice: total }))
  }

  const handleAddComponent = (component: Component) => {
    const existingIndex = formData.components.findIndex(c => c.id === component.id)
    
    if (existingIndex >= 0) {
      // Update quantity if component already exists
      const updatedComponents = [...formData.components]
      updatedComponents[existingIndex].quantity += 1
      setFormData(prev => ({ ...prev, components: updatedComponents }))
    } else {
      // Add new component
      const newComponent: ConfigurationComponent = {
        id: component.id,
        name: component.name,
        category: component.category,
        categoryId: component.categoryId,
        price: component.price,
        quantity: 1
      }
      setFormData(prev => ({ 
        ...prev, 
        components: [...prev.components, newComponent] 
      }))
    }
  }

  const handleRemoveComponent = (componentId: string) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== componentId)
    }))
  }

  const handleQuantityChange = (componentId: string, change: number) => {
    const updatedComponents = formData.components.map(component => {
      if (component.id === componentId) {
        const newQuantity = component.quantity + change
        return newQuantity > 0 ? { ...component, quantity: newQuantity } : component
      }
      return component
    })
    setFormData(prev => ({ ...prev, components: updatedComponents }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        components: formData.components.map(c => ({
          id: c.id,
          name: c.name,
          category: c.category,
          categoryId: c.categoryId,
          price: c.price,
          quantity: c.quantity
        })),
        totalPrice: formData.totalPrice
      }

      if (onSave) {
        await onSave(payload)
      } else {
        const url = configuration?.id 
          ? `/api/staff/configurations/${configuration.id}`
          : '/api/staff/configurations'
        
        const method = configuration?.id ? 'PATCH' : 'POST'

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to save configuration')
        }

        router.push(`/${user?.role.toLowerCase()}/configurations`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredComponents = availableComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    component.stock > 0
  )

  if (loading && !configuration) return <Loading />

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Configuration Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
            />
          </div>
        </div>
      </div>

      {/* Component Selection */}
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Components</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Components */}
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Available Components</h3>
            
            <div className="space-y-3 mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name} ({category.componentCount})
                  </option>
                ))}
              </select>
              
              {selectedCategory && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                  />
                </div>
              )}
            </div>
            
            <div className="border dark:border-neutral-700 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {filteredComponents.length > 0 ? (
                  filteredComponents.map(component => (
                    <div 
                      key={component.id} 
                      className="flex items-center justify-between p-3 border-b dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                    >
                      <div>
                        <div className="font-medium dark:text-white">{component.name}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          €{component.price.toFixed(2)} - Stock: {component.stock}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddComponent(component)}
                        className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                    {selectedCategory ? 'No components found' : 'Select a category'}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Selected Components */}
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Selected Components</h3>
            
            <div className="border dark:border-neutral-700 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {formData.components.length > 0 ? (
                  formData.components.map(component => (
                    <div 
                      key={component.id} 
                      className="flex items-center justify-between p-3 border-b dark:border-neutral-700"
                    >
                      <div className="flex-1">
                        <div className="font-medium dark:text-white">{component.name}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          €{component.price.toFixed(2)} × {component.quantity} = €{(component.price * component.quantity).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(component.id, -1)}
                          className="p-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                          disabled={component.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{component.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(component.id, 1)}
                          className="p-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(component.id)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                    No components selected
                  </div>
                )}
              </div>
              
              {formData.components.length > 0 && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 border-t dark:border-neutral-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark:text-white">Total Price:</span>
                    <span className="text-lg font-bold dark:text-white">€{formData.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || formData.components.length === 0}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  )
}