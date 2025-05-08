'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'

interface Component {
  id: string
  name: string
  category: string
  price: number
  quantity: number
}

interface Configuration {
  id: string
  name: string
  description: string
  status: string
  totalPrice: number
  components: Component[]
}

export default function EditConfigurationPage() {
  const router = useRouter()
  const params = useParams()
  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availableComponents, setAvailableComponents] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchConfiguration()
    fetchAvailableComponents()
  }, [params.id])

  const fetchConfiguration = async () => {
    try {
      const response = await fetch(`/api/specialist/configurations/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setConfiguration(data)
      }
    } catch (error) {
      console.error('Error fetching configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableComponents = async () => {
    try {
      const response = await fetch('/api/components')
      if (response.ok) {
        const data = await response.json()
        setAvailableComponents(data.components)
      }
    } catch (error) {
      console.error('Error fetching components:', error)
    }
  }

  const handleSave = async () => {
    if (!configuration) return

    setSaving(true)
    try {
      const response = await fetch(`/api/specialist/configurations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuration)
      })

      if (response.ok) {
        alert('Configuration saved successfully!')
        router.push(`/specialist/configurations/${params.id}`)
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const addComponent = (component: any) => {
    if (!configuration) return

    const existingComponent = configuration.components.find(c => c.id === component.id)
    
    if (existingComponent) {
      setConfiguration({
        ...configuration,
        components: configuration.components.map(c =>
          c.id === component.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      })
    } else {
      setConfiguration({
        ...configuration,
        components: [...configuration.components, { ...component, quantity: 1 }]
      })
    }
  }

  const removeComponent = (componentId: string) => {
    if (!configuration) return

    setConfiguration({
      ...configuration,
      components: configuration.components.filter(c => c.id !== componentId)
    })
  }

  const updateQuantity = (componentId: string, quantity: number) => {
    if (!configuration || quantity < 1) return

    setConfiguration({
      ...configuration,
      components: configuration.components.map(c =>
        c.id === componentId ? { ...c, quantity } : c
      )
    })
  }

  if (loading || !configuration) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const calculateTotalPrice = () => {
    return configuration.components.reduce((total, component) => 
      total + (component.price * component.quantity), 0
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={configuration.name}
                    onChange={(e) => setConfiguration({
                      ...configuration,
                      name: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows={4}
                    value={configuration.description}
                    onChange={(e) => setConfiguration({
                      ...configuration,
                      description: e.target.value
                    })}
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-3">Components</h4>
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50 dark:bg-gray-800">
                          <th className="px-4 py-2 text-left">Component</th>
                          <th className="px-4 py-2 text-center">Quantity</th>
                          <th className="px-4 py-2 text-right">Price</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {configuration.components.map((component) => (
                          <tr key={component.id} className="border-b">
                            <td className="px-4 py-2">{component.name}</td>
                            <td className="px-4 py-2 text-center">
                              <input
                                type="number"
                                min="1"
                                className="w-16 border rounded px-2 py-1 text-center"
                                value={component.quantity}
                                onChange={(e) => updateQuantity(component.id, parseInt(e.target.value))}
                              />
                            </td>
                            <td className="px-4 py-2 text-right">€{component.price}</td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeComponent(component.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <td colSpan={2} className="px-4 py-2 text-right font-medium">
                            Total:
                          </td>
                          <td className="px-4 py-2 text-right font-semibold">
                            €{calculateTotalPrice()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="cpu">CPU</option>
                  <option value="motherboard">Motherboard</option>
                  <option value="memory">Memory</option>
                  <option value="storage">Storage</option>
                  <option value="gpu">GPU</option>
                  <option value="case">Case</option>
                  <option value="psu">Power Supply</option>
                </select>

                <div className="space-y-2">
                  {availableComponents
                    .filter(c => !selectedCategory || c.category === selectedCategory)
                    .map((component) => (
                      <div
                        key={component.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div>
                          <div className="font-medium">{component.name}</div>
                          <div className="text-sm text-gray-500">€{component.price}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addComponent(component)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}