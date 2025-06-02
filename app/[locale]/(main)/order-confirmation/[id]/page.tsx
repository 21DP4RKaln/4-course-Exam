'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { Check, ArrowLeft, Package, Truck, CreditCard, Mail } from 'lucide-react'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'
import { useCart } from '@/app/contexts/CartContext'

export default function OrderConfirmationPage() {
  const t = useTranslations('orderConfirmation')
  const pathname = usePathname()
  const params = useParams()
  const locale = pathname.split('/')[1]
  const orderId = params.id as string
  const { clearCart } = useCart()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data)
          
          clearCart()
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, clearCart])

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
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          {t('notFoundTitle')}
        </h1>        <Link
          href={`/${locale}/dashboard`}
          className="px-6 py-3 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 inline-flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t('backToDashboard')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-stone-950 shadow-md rounded-lg p-8 text-center">        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-neutral-900 dark:text-white">
          {t('successTitle')}
        </h1>
        
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          {t('successMessage')}
        </p>
        
        <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-md inline-block">
          <p className="text-neutral-600 dark:text-neutral-400">
            {t('orderNumberLabel')}
          </p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">
            #{orderId}
          </p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-red-900/30">
              <Mail className="h-6 w-6 text-blue-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
              {t('confirmationEmailTitle')}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('confirmationEmailSubtitle')}
            </p>
          </div>
            <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-red-900/30">
              <Package className="h-6 w-6 text-blue-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
              {t('processingTitle')}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('processingSubtitle')}
            </p>
          </div>
            <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-red-900/30">
              <Truck className="h-6 w-6 text-blue-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
              {t('shippingTitle')}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('shippingSubtitle')}
            </p>
          </div>
        </div>
        
        <div className="mt-8 space-x-4">          <Link 
            href={`/${locale}/orders/${orderId}`}
            className="px-6 py-3 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 inline-block"
          >
            {t('viewOrderDetails')}
          </Link>
          
          <Link 
            href={`/${locale}`}
            className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 inline-block"
          >
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  )
}