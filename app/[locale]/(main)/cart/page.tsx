'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/app/contexts/CartContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react'
import AnimatedButton from '@/app/components/ui/animated-button'

export default function CartPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=checkout`)
      return
    }

    setIsProcessing(true)
  
    setTimeout(() => {
      router.push(`/${locale}/checkout`)
      setIsProcessing(false)
    }, 1000)
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-8">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('cart.empty')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your shopping cart is empty. Add some items to continue shopping.
          </p>          <Link href={`/${locale}/`}>
            <AnimatedButton 
              title={t('cart.continueShoping')}
              direction="left"
            />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex flex-col sm:flex-row">
                    {/* Item Image (placeholder) */}
                    <div className="w-full sm:w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {item.type === 'component' ? 'Component' : 'PC'}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.type === 'component' ? 'Component' : 'PC Configuration'}
                          </p>
                        </div>
                        
                        <div className="mt-3 sm:mt-0 text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            €{item.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1 text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
                        >
                          <Trash2 size={18} className="mr-1" />
                          <span className="text-sm">{t('cart.removeItem')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">                <Link href={`/${locale}/`}>
                  <AnimatedButton 
                    title={t('cart.continueShoping')}
                    direction="left"
                    className="text-red-600 dark:text-red-400" 
                  />
                </Link>
                
                <button 
                  onClick={() => clearCart()}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
                >
                  <Trash2 size={18} className="mr-1" />
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>€{(totalPrice * 0.21).toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
                  <span>{t('cart.total')}</span>
                  <span>€{(totalPrice + totalPrice * 0.21).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full mt-6 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} className="mr-2" />
                  {t('cart.checkout')}
                </>
              )}
            </button>
            
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>We accept:</p>
              <div className="flex justify-center mt-2 space-x-3">
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}