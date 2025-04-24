'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  User,
  Calendar,
  Mail,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Clock,
  Check,
  X,
  ArrowLeft,
  Edit,
  Cpu,
  AlertTriangle
} from 'lucide-react'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { user: currentUser, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!isAuthenticated || currentUser?.role !== 'ADMIN')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, currentUser?.role])

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'ADMIN') return

    const fetchOrder = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`)
        
        if (!response.ok) {
          throw new Error(response.status === 404 
            ? 'Order not found' 
            : 'Failed to fetch order details')
        }
        
        const data = await response.json()
        setOrder(data)
      } catch (error) {
        console.error('Error fetching order:', error)
        setError('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrder()
  }, [orderId, isAuthenticated, currentUser?.role])

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

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Order Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The order you're looking for doesn't exist or you don't have permission to view it.
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return <Check className="h-5 w-5 text-green-500" />
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-red-500" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-amber-500" />
      case 'CANCELLED':
        return <X className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'PROCESSING':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }
  
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
        {/* Order Summary Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">#{orderId}</p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <User size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.userName || 'Anonymous'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CreditCard size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.paymentMethod || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Address</p>
                    <p className="font-medium text-gray-900 dark:text-white whitespace-pre-line">
                      {order.shippingAddress || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Link
                    href={`/${locale}/admin/orders/edit/${orderId}`}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                  >
                    <Edit size={16} className="mr-2" />
                    Update Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Details & Items */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Order Items
              </h2>
              
              {order.items && order.items.length > 0 ? (
                <div className="space-y-6">
                  {order.items.map((item: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-start border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
                    >
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-4">
                        <Package size={24} className="text-gray-400" />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.type || 'Item'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              €{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              €{item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : order.configuration ? (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-4">
                      <Cpu size={24} className="text-gray-400" />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {order.configuration.name || 'Custom Configuration'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Custom PC Configuration
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            €{order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No items found for this order.
                </p>
              )}
            </div>
          </div>
          
          {/* Order Totals */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Order Total
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>€{(order.totalAmount / 1.21).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (21%)</span>
                  <span>€{(order.totalAmount - order.totalAmount / 1.21).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>€{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}