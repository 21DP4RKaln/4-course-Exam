'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Cpu,
  Package,
  DollarSign,
  FileText,
  Plus,
  Trash2
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const componentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
})

type ComponentFormData = z.infer<typeof componentSchema>

export default function EditComponentPage() {
  const params = useParams()
  const componentId = params.id as string
  
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [specifications, setSpecifications] = useState<{key: string, value: string}[]>([
    { key: '', value: '' }
  ])
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ComponentFormData>({
    resolver: zodResolver(componentSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
    }
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, user?.role])


  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const categoriesResponse = await fetch('/api/components')
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories)

        const componentResponse = await fetch(`/api/admin/components/${componentId}`)
        
        if (!componentResponse.ok) {
          throw new Error(componentResponse.status === 404 
            ? 'Component not found' 
            : 'Failed to fetch component details')
        }
        
        const componentData = await componentResponse.json()

        setValue('name', componentData.name)
        setValue('description', componentData.description || '')
        setValue('price', componentData.price)
        setValue('stock', componentData.stock)
        setValue('categoryId', componentData.categoryId)

        if (componentData.specifications && typeof componentData.specifications === 'object') {
          const specEntries = Object.entries(componentData.specifications).map(
            ([key, value]) => ({ key, value: String(value) })
          )
          
          if (specEntries.length > 0) {
            setSpecifications(specEntries)
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load component details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [componentId, isAuthenticated, user?.role, setValue])

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }])
  }
  
  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updatedSpecs = [...specifications]
    updatedSpecs[index][field] = value
    setSpecifications(updatedSpecs)
  }
  
  const removeSpecification = (index: number) => {
    const updatedSpecs = specifications.filter((_, i) => i !== index)
    setSpecifications(updatedSpecs)
  }

  const onSubmit = async (data: ComponentFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const filteredSpecs = specifications.filter(spec => 
        spec.key.trim() !== '' && spec.value.trim() !== ''
      )

      const specificationsObject = filteredSpecs.reduce((acc, spec) => {
        acc[spec.key.trim()] = spec.value.trim()
        return acc
      }, {} as Record<string, string>)
      
      const response = await fetch(`/api/admin/components/${componentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          specifications: specificationsObject
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update component')
      }
      
      router.push(`/${locale}/admin/components/view/${componentId}`)
    } catch (error) {
      console.error('Error updating component:', error)
      setError('Failed to update component. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle loading state
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }
  
  // Auth check
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/${locale}/admin`}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Admin Panel
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Component
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start">
              <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Cpu size={18} className="text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Component name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText size={18} className="text-gray-400" />
                </div>
                <textarea
                  id="description"
                  rows={3}
                  {...register('description')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Component description"
                ></textarea>
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (€)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="stock"
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stock.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="categoryId"
                {...register('categoryId')}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoryId.message}</p>
              )}
            </div>
            
            {/* Specifications section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specifications
                </label>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <Plus size={16} className="mr-1" />
                  Add Specification
                </button>
              </div>
              
              <div className="space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        placeholder="Name (e.g. Core Count)"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        placeholder="Value (e.g. 8)"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="h-full px-3 py-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Link
                href={`/${locale}/admin/components/view/${componentId}`}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}