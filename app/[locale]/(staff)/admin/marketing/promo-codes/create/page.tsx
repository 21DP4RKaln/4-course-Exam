'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  ArrowLeft,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  type: 'CONFIGURATION' | 'COMPONENT' | 'PERIPHERAL'
}

export default function CreatePromoCodePage() {
  const t = useTranslations()
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercentage: '',
    maxDiscountAmount: '',
    minOrderValue: '',
    isActive: true,
    maxUsage: '1000',
    scope: 'ALL' as 'ALL' | 'SPECIFIC_PRODUCTS',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  })

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    // Fetch products for specific product scope
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products/all')
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/marketing/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          discountPercentage: parseInt(formData.discountPercentage),
          maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
          minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
          maxUsage: parseInt(formData.maxUsage),
          expiresAt: new Date(formData.expiresAt).toISOString(),
          products: formData.scope === 'SPECIFIC_PRODUCTS' ? selectedProducts : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create promo code')
      }

      router.push(`/${usePathname().split('/')[1]}/admin/marketing/promo-codes`)
    } catch (error) {
      console.error('Error creating promo code:', error)
      setError(error instanceof Error ? error.message : 'Failed to create promo code')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement
      setFormData(prev => ({ ...prev, [name]: target.checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/${usePathname().split('/')[1]}/admin/marketing/promo-codes`}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Promo Codes
        </Link>
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Promo Code
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error creating promo code
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Promo Code *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g., SUMMER20"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This is the code customers will enter at checkout
              </p>
            </div>

            <div>
              <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Percentage *
              </label>
              <input
                type="number"
                id="discountPercentage"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                required
                min="1"
                max="100"
                placeholder="e.g., 20"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Percentage discount (1-100)
              </p>
            </div>

            <div>
              <label htmlFor="maxDiscountAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Discount Amount (Optional)
              </label>
              <input
                type="number"
                id="maxDiscountAmount"
                name="maxDiscountAmount"
                value={formData.maxDiscountAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="e.g., 50"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Maximum discount amount in EUR
              </p>
            </div>

            <div>
              <label htmlFor="minOrderValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Order Value (Optional)
              </label>
              <input
                type="number"
                id="minOrderValue"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Minimum order value required to use this code
              </p>
            </div>

            <div>
              <label htmlFor="maxUsage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Usage *
              </label>
              <input
                type="number"
                id="maxUsage"
                name="maxUsage"
                value={formData.maxUsage}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="e.g., 1000"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                How many times this code can be used
              </p>
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiration Date *
              </label>
              <input
                type="date"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                When this promo code expires
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g., Summer sale discount for all products"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Internal description for this promo code
            </p>
          </div>

          <div>
            <label htmlFor="scope" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Applies To *
            </label>
            <select
              id="scope"
              name="scope"
              value={formData.scope}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="ALL">All Products</option>
              <option value="SPECIFIC_PRODUCTS">Specific Products</option>
            </select>
          </div>

          {formData.scope === 'SPECIFIC_PRODUCTS' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Products
              </label>
              <div className="border rounded-md dark:border-gray-600 max-h-64 overflow-y-auto">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelection(product.id)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-white">
                      {product.name} - €{product.price} ({product.type})
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select products this promo code applies to
              </p>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href={`/${usePathname().split('/')[1]}/admin/marketing/promo-codes`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Promo Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}