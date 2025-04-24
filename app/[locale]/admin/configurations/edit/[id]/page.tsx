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
  Cpu
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Define validation schema
const configurationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']),
  isTemplate: z.boolean(),
  isPublic: z.boolean()
})

type ConfigFormData = z.infer<typeof configurationSchema>

export default function EditConfigurationPage() {
  const params = useParams()
  const configId = params.id as string
  
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { user: currentUser, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'DRAFT',
      isTemplate: false,
      isPublic: false
    }
  })

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || currentUser?.role !== 'ADMIN')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, currentUser?.role])

  // Fetch configuration data
  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'ADMIN') return

    const fetchConfiguration = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/configurations/${configId}`)
        
        if (!response.ok) {
          throw new Error(response.status === 404 
            ? 'Configuration not found' 
            : 'Failed to fetch configuration details')
        }
        
        const configData = await response.json()
        
        // Set form values
        setValue('name', configData.name)
        setValue('description', configData.description || '')
        setValue('status', configData.status)
        setValue('isTemplate', configData.isTemplate)
        setValue('isPublic', configData.isPublic)
        
      } catch (error) {
        console.error('Error fetching configuration:', error)
        setError('Failed to load configuration details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchConfiguration()
  }, [configId, isAuthenticated, currentUser?.role, setValue])
  
  // Submit handler
  const onSubmit = async (data: ConfigFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/configurations/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update configuration')
      }
      
      router.push(`/${locale}/admin/configurations/view/${configId}`)
    } catch (error) {
      console.error('Error updating configuration:', error)
      setError('Failed to update configuration. Please try again.')
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
  if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
    return null
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/${locale}/admin/configurations/view/${configId}`}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Configuration Details
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Configuration
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
                Configuration Name
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
                  placeholder="Configuration name"
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
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Configuration description (optional)"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="isTemplate"
                  type="checkbox"
                  {...register('isTemplate')}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isTemplate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Is Template (will be displayed in the shop)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isPublic"
                  type="checkbox"
                  {...register('isPublic')}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Is Public (will be displayed as featured in the shop)
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Link
                href={`/${locale}/admin/configurations/view/${configId}`}
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