'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { Heart, Trash2, ShoppingCart, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function WishlistTab() {
  const t = useTranslations()
  const dashboardT = useTranslations('dashboard')
  const productT = useTranslations('product')
  const { items, removeFromWishlist, loading } = useWishlist()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const getProductUrl = (item: any) => {
    if (item.productType === 'CONFIGURATION') {
      return `/${locale}/product/${item.productId}`
    } else if (item.productType === 'COMPONENT') {
      return `/${locale}/components/${item.productId}`
    } else {
      return `/${locale}/peripherals/${item.productId}`
    }
  }

  const handleRemove = async (productId: string, productType: string) => {
    await removeFromWishlist(productId, productType)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <Heart size={20} className="mr-2" />
        {dashboardT('wishlist')}
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red-500"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8 text-center">
          <Heart size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {dashboardT('emptyWishlist')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {dashboardT('emptyWishlistMessage')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden">
              <Link href={getProductUrl(item)}>
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="h-full w-full object-contain" 
                    />
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.productType}
                    </span>
                  )}
                </div>
              </Link>
              
              <div className="p-4">
                <Link href={getProductUrl(item)}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-brand-red-600 dark:hover:text-brand-red-400">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    €{item.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.productType}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(getProductUrl(item))}
                    className="flex-1 flex items-center justify-center py-2 px-4 bg-brand-red-600 text-white rounded-md hover:bg-brand-red-700"
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    {productT('viewDetails')}
                  </button>
                  
                  <button
                    onClick={() => handleRemove(item.productId, item.productType)}
                    className="p-2 text-brand-red-500 hover:text-brand-red-700 dark:text-brand-red-400 dark:hover:text-brand-red-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}