'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Search, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Component {
  id: string
  name: string
  category: string
  price: number
  stock: number
  sku: string
}

export default function ComponentsPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchComponents()
  }, [])

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/specialist/products/components')
      if (response.ok) {
        const data = await response.json()
        setComponents(data)
      }
    } catch (error) {
      console.error('Error fetching components:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComponents = components.filter(component => {
    if (selectedCategory && component.category !== selectedCategory) return false
    if (searchQuery && !component.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Components Inventory
        </h1>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search components..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-neutral-800 dark:border-neutral-700"
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
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-neutral-50 dark:bg-neutral-800">
                  <th className="px-6 py-3 text-left">Component</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">SKU</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-center">Stock</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.map((component) => (
                  <tr key={component.id} className="border-b">
                    <td className="px-6 py-4">{component.name}</td>
                    <td className="px-6 py-4 capitalize">{component.category}</td>
                    <td className="px-6 py-4">{component.sku}</td>
                    <td className="px-6 py-4 text-right">€{component.price}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        component.stock > 10 ? 'bg-green-100 text-green-800' :
                        component.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {component.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/${locale}/shop/product/${component.id}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}