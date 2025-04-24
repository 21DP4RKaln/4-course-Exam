'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  User,
  Calendar,
  Cpu,
  Check,
  Layers,
  HardDrive,
  Monitor,
  Zap,
  Server,
  Fan,
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react'

export default function ConfigurationDetailPage() {
  const params = useParams()
  const configId = params.id as string
  
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { user: currentUser, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [configuration, setConfiguration] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!isAuthenticated || currentUser?.role !== 'ADMIN')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, currentUser?.role])

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
        
        const data = await response.json()
        setConfiguration(data)
      } catch (error) {
        console.error('Error fetching configuration:', error)
        setError('Failed to load configuration details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchConfiguration()
  }, [configId, isAuthenticated, currentUser?.role])
  
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
    return null
  }

  if (error || !configuration) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Configuration Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The configuration you're looking for doesn't exist or you don't have permission to view it.
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }
 
  const getComponentIcon = (category: string) => {
    const lowerCaseCategory = category.toLowerCase()
    
    if (lowerCaseCategory.includes('cpu')) return <Cpu size={18} className="text-red-500" />
    if (lowerCaseCategory.includes('gpu') || lowerCaseCategory.includes('graphics')) return <Monitor size={18} className="text-purple-500" />
    if (lowerCaseCategory.includes('motherboard')) return <Server size={18} className="text-amber-500" />
    if (lowerCaseCategory.includes('memory') || lowerCaseCategory.includes('ram')) return <HardDrive size={18} className="text-green-500" />
    if (lowerCaseCategory.includes('storage')) return <HardDrive size={18} className="text-indigo-500" />
    if (lowerCaseCategory.includes('power') || lowerCaseCategory.includes('psu')) return <Zap size={18} className="text-yellow-500" />
    if (lowerCaseCategory.includes('case')) return <Layers size={18} className="text-red-500" />
    if (lowerCaseCategory.includes('cooling')) return <Fan size={18} className="text-cyan-500" />
    
    return <Cpu size={18} className="text-gray-500" />
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/admin/configurations/${configId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete configuration');

      router.push(`/${locale}/admin`);
    } catch (error) {
      console.error('Error deleting configuration:', error);
      alert('Failed to delete configuration. Please try again.');
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Configuration Summary Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <Cpu size={32} className="text-red-600 dark:text-red-400" />
                </div>
                
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
                  {configuration.name}
                </h1>
                
                <div className="inline-flex px-3 py-1 rounded-full text-sm font-medium mb-4 mt-2 ${getStatusColor(configuration.status)}">
                  {configuration.status}
                </div>
                
                <div className="w-full text-sm text-gray-600 dark:text-gray-400 space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span>Created by:</span>
                    <span className="font-medium text-gray-900 dark:text-white flex items-center">
                      <User size={14} className="mr-1" />
                      {configuration.userName || 'Anonymous'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Created on:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(configuration.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Is template:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {configuration.isTemplate ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Is public:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {configuration.isPublic ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Total price:</span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      €{configuration.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Link
                    href={`/${locale}/admin/configurations/edit/${configId}`}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center justify-center"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Configuration Components */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Components
              </h2>
              
              {configuration.components && configuration.components.length > 0 ? (
                <div className="space-y-4">
                  {configuration.components.map((component: any) => (
                    <div 
                      key={component.id}
                      className="flex items-start border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
                    >
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center mr-3">
                        {getComponentIcon(component.category)}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {component.category}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {component.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              €{(component.price * component.quantity).toFixed(2)}
                            </p>
                            {component.quantity > 1 && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                €{component.price.toFixed(2)} × {component.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  This configuration has no components.
                </p>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    €{configuration.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Configuration Description */}
          {configuration.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {configuration.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}