'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  Cpu,
  Tag,
  DollarSign,
  Package,
  Calendar,
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react'

export default function ComponentDetailPage() {
  const params = useParams()
  const componentId = params.id as string
  
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [component, setComponent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, user?.role])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return

    const fetchComponent = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/components/${componentId}`)
        
        if (!response.ok) {
          throw new Error(response.status === 404 
            ? 'Component not found' 
            : 'Failed to fetch component details')
        }
        
        const data = await response.json()
        setComponent(data)
      } catch (error) {
        console.error('Error fetching component:', error)
        setError('Failed to load component details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchComponent()
  }, [componentId, isAuthenticated, user?.role])
 
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null
  }
 
  if (error || !component) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Component Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The component you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link 
            href={`/${locale}/admin`}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Admin Panel
          </Link>
        </div>
      </div>
    )
  }
 
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale, { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    }).format(date)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this component? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/admin/components/${componentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete component');

      router.push(`/${locale}/admin`);
    } catch (error) {
      console.error('Error deleting component:', error);
      alert('Failed to delete component. Please try again.');
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {component.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {component.category}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Link
                href={`/${locale}/admin/components/edit/${componentId}`}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Link>
              
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Component Details
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Cpu size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium text-gray-900 dark:text-white">{component.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <DollarSign size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">€{component.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Package size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Stock</p>
                      <p className="font-medium text-gray-900 dark:text-white">{component.stock} units</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(component.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-full">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {component.description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Specifications if available */}
          {component.specifications && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Specifications
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(component.specifications).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-start">
                    <Tag size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key.replace('_', ' ')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{value.toString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}