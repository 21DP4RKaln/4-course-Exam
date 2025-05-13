'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { Check, ArrowLeft, Package, Truck, CreditCard, Mail } from 'lucide-react'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'

export default function OrderConfirmationPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const params = useParams()
  const locale = pathname.split('/')[1]
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Order Not Found
        </h1>
        <Link
          href={`/${locale}/dashboard`}
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-stone-950 shadow-md rounded-lg p-8 text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Order Successful!
        </h1>
        
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Thank you for your order! Your payment has been received and we're processing your order.
        </p>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-md inline-block">
          <p className="text-gray-600 dark:text-gray-400">
            Order Number:
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            #{orderId}
          </p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Mail className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Confirmation Email
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sent to your email
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Package className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Processing
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              1-2 business days
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Truck className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Shipping
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your order
            </p>
          </div>
        </div>
        
        <div className="mt-8 space-x-4">
          <Link 
            href={`/${locale}/orders/${orderId}`}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-block"
          >
            View Order Details
          </Link>
          
          <Link 
            href={`/${locale}`}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}