'use client'

import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { UserOrder } from '@/lib/services/dashboardService'

interface OrdersTabProps {
  orders: UserOrder[]
  loading: boolean
  error: string | null
  onRetry: () => void
  getStatusColor: (status: string) => string
  formatDate: (date: string) => string
  locale: string
}

export default function OrdersTab({
  orders,
  loading,
  error,
  onRetry,
  getStatusColor,
  formatDate,
  locale
}: OrdersTabProps) {
  const t = useTranslations()
  const router = useRouter()

  if (loading) {
    return (      <motion.div 
        className="flex justify-center items-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-red-500 mr-3"></div>
        <span className="text-neutral-600 dark:text-neutral-400">{t('dashboard.loadingOrders')}</span>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div 
        className="text-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </motion.div>
    )
  }      if (orders.length === 0) {
    return (
      <motion.div 
        className="text-center py-12 bg-white dark:bg-neutral-950 rounded-xl shadow-lg border border-blue-100 dark:border-red-900/20 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Package size={48} className="mx-auto text-blue-500 dark:text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-neutral-950 dark:text-white mb-2">
          {t('dashboard.noOrders')}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          {t('dashboard.noOrdersMessage')}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >     

      <div className="overflow-x-auto bg-white dark:bg-neutral-950 rounded-xl shadow-lg border border-blue-100 dark:border-red-900/20">
        <table className="min-w-full divide-y divide-blue-100 dark:divide-red-900/20">          <thead className="bg-neutral-50 dark:bg-neutral-950">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('dashboard.orderId')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('dashboard.date')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('dashboard.configuration')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('dashboard.status')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('dashboard.total')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {orders.map((order) => (
              <motion.tr 
                key={order.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer"
                onClick={() => router.push(`/${locale}/orders/${order.id}`)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-950 dark:text-white">
                  #{order.id.substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-950 dark:text-white">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-950 dark:text-white">
                  {order.configurationName || 
                   (order.items && order.items.length > 0 ? 
                    `${order.items.length} product${order.items.length > 1 ? 's' : ''}` : '—')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-950 dark:text-white">
                  €{order.totalAmount.toFixed(2)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
