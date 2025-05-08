'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Edit } from 'lucide-react'

interface Component {
  id: string
  name: string
  description: string
  category: { name: string }
  price: number
  stock: number
  sku: string
  imageUrl: string
  specifications: Record<string, string>
  createdAt: string
  updatedAt: string
}

export default function ViewComponentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  
  const [component, setComponent] = useState<Component | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComponent()
  }, [params.id])

  const fetchComponent = async () => {
    try {
      const response = await fetch(`/api/admin/components/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setComponent(data)
      }
    } catch (error) {
      console.error('Error fetching component:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!component) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Component not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Component Details
          </h1>
        </div>
        <button
          onClick={() => router.push(`/${locale}/admin/components/${component.id}/edit`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Component
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="text-gray-900 dark:text-white">{component.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">SKU</dt>
                <dd className="text-gray-900 dark:text-white">{component.sku}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Category</dt>
                <dd className="text-gray-900 dark:text-white">{component.category.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Price</dt>
                <dd className="text-gray-900 dark:text-white">€{component.price.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Stock</dt>
                <dd className="text-gray-900 dark:text-white">{component.stock}</dd>
              </div>
            </dl>
          </div>

          <div>
            {component.imageUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Image</h3>
                <img
                  src={component.imageUrl?.trim()}
                  alt={component.name}
                  className="w-full max-w-sm rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {component.description && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300">{component.description}</p>
          </div>
        )}

        {component.specifications && Object.keys(component.specifications).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Specifications</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(component.specifications).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">{key}</dt>
                  <dd className="text-gray-900 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="text-gray-900 dark:text-white">
                {new Date(component.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Last Updated</dt>
              <dd className="text-gray-900 dark:text-white">
                {new Date(component.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}