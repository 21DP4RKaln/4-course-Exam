'use client'

import { useState } from 'react'
import { X, Send, ImagePlus, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Configuration {
  id: string
  name: string
  description?: string
  totalPrice: number
  components: Array<{
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }>
}

interface ConfigPublishFormProps {
  configuration: Configuration
  onClose: () => void
  onPublished: () => void
}

export function ConfigPublishForm({ configuration, onClose, onPublished }: ConfigPublishFormProps) {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: configuration.name,
    description: configuration.description || '',
    category: '',
    markup: 10, // Default 10% markup
    image: null as File | null,
    imagePreview: ''
  })

  const categories = [
    { value: 'gaming', label: 'Gaming PC' },
    { value: 'workstation', label: 'Workstation' },
    { value: 'office', label: 'Office PC' },
    { value: 'budget', label: 'Budget PC' }
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        markupPercentage: formData.markup,
        totalPrice: configuration.totalPrice * (1 + formData.markup / 100)
      }

      const response = await fetch(`/api/staff/configurations/${configuration.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to publish configuration')
      }

      // If we have an image, upload it separately
      if (formData.image) {
        const imageFormData = new FormData()
        imageFormData.append('image', formData.image)

        await fetch(`/api/staff/configurations/${configuration.id}/image`, {
          method: 'POST',
          body: imageFormData
        })
      }

      onPublished()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const finalPrice = configuration.totalPrice * (1 + formData.markup / 100)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-white">Publish Configuration to Shop</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shop Display Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description for Shop
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Describe this PC configuration for potential customers..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Markup Percentage
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={formData.markup}
                onChange={(e) => setFormData(prev => ({ ...prev, markup: Number(e.target.value) }))}
                min="0"
                max="100"
                className="w-32 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-gray-500 dark:text-gray-400">%</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Base price: €{configuration.totalPrice.toFixed(2)} → Final price: €{finalPrice.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Image (optional)
            </label>
            <div className="mt-2">
              {formData.imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img 
                    src={formData.imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <ImagePlus size={40} className="text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Component Summary */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Components Included
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2">
              {configuration.components.map((component) => (
                <div key={component.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {component.name} ({component.category})
                  </span>
                  <span className="font-medium dark:text-white">
                    €{component.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.category}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            {loading ? 'Publishing...' : 'Publish to Shop'}
          </button>
        </div>
      </div>
    </div>
  )
}