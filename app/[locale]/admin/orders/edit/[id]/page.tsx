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
  Truck,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Define validation schema
const orderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']),
  shippingAddress: z.string().optional(),
  paymentMethod: z.string().optional()
})

type OrderFormData = z.infer<typeof orderSchema>

export default function EditOrderPage() {
  const params = useParams()
  const orderId = params.id as string
  
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { user: currentUser, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderUser, setOrderUser] = useState<{ name: string; email: string } | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      status: 'PENDING',
      shippingAddress: '',
      paymentMethod: ''
    }
  })

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || currentUser?.role !== 'ADMIN')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, currentUser?.role])

  // Fetch order data
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
        
        const orderData = await response.json()
        
        // Set form values
        setValue('status', orderData.status)
        setValue('shippingAddress', orderData.shippingAddress || '')
        setValue('paymentMethod', orderData.paymentMethod || '')
        
        // Save user information for display
        setOrderUser({
          name: orderData.userName || 'Anonymous',
          email: orderData.email || ''
        })
        
      } catch (error) {
        console.error('Error fetching order:', error)
        setError('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrder()
  }, [orderId, isAuthenticated, currentUser?.role, setValue])
  
  // Submit handler
  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update order')
      }
      
      router.push(`/${locale}/admin/orders/view/${orderId}`)
    } catch (error) {
      console.error('Error updating order:', error)
      setError('Failed to update order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return <CheckCircle size={20} className="text-green-500" />
      case 'PROCESSING':
        return <Clock size={20} className="text-blue-500" />
      case 'PENDING':
        return <Clock size={20} className="text-amber-500" />
      case 'CANCELLED':
        return <XCircle size={20} className="text-red-500" />
      default:
        return null
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
          href={`/${locale}/admin/orders/view/${orderId}`}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Order Details
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Order #{orderId}
          </h1>
          
          {/* Order user info */}
          {orderUser && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
              <p className="font-medium text-gray-900 dark:text-white">{orderUser.name}</p>
              {orderUser.email && <p className="text-sm text-gray-600 dark:text-gray-400">{orderUser.email}</p>}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start">
              <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order Status
              </label>
              <div className="relative">
                <select
                  id="status"
                  {...register('status')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {getStatusIcon(register('status').value as string) || <Clock size={20} className="text-gray-400" />}
                </div>
              </div>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shipping Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Truck size={18} className="text-gray-400" />
                </div>
                <textarea
                  id="shippingAddress"
                  rows={3}
                  {...register('shippingAddress')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter shipping address"
                ></textarea>
              </div>
              {errors.shippingAddress && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shippingAddress.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard size={18} className="text-gray-400" />
                </div>
                <input
                  id="paymentMethod"
                  type="text"
                  {...register('paymentMethod')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter payment method"
                />
              </div>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paymentMethod.message}</p>
              )}
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Link
                href={`/${locale}/admin/orders/view/${orderId}`}
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