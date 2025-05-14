'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/app/contexts/CartContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft } from 'lucide-react'

export default function CartPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoMessage, setPromoMessage] = useState('')

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity)
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }
    
    console.log('Starting promo code validation...')
    setPromoError('')
    setPromoMessage('')
    
    const requestData = {
      code: promoCode.trim(),
      total: totalPrice
    }
    console.log('Sending request data:', requestData)
    
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      // Log the full response for debugging
      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
        // Try to get the response text first
      const responseText = await response.text()
      console.log('Raw response text:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
        console.log('Parsed response data:', data)
      } catch (e) {
        console.error('Failed to parse response as JSON:', e)
        setPromoError('Server returned invalid response')
        setPromoDiscount(0)
        return
      }

      if (!response.ok) {
        const errorMessage = data?.error || 'Failed to validate promo code'
        console.error('Promo code error:', errorMessage)
        setPromoError(errorMessage)
        setPromoDiscount(0)
        return
      }

      if (!data.valid) {
        setPromoError('Invalid promo code')
        setPromoDiscount(0)
        return
      }

      setPromoError('')
      setPromoDiscount(data.discount || 0)

      if (data.discountPercentage) {
        const successMessage = `${promoCode.toUpperCase()} - ${data.discountPercentage}% off applied`
        setPromoMessage(successMessage)
        console.log('Success:', successMessage)
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Failed to validate promo code. Please try again.')
      setPromoDiscount(0)
    }
  }

  const finalTotal = totalPrice - promoDiscount

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    setIsProcessing(true)
  
    setTimeout(() => {
      const checkoutUrl = new URL(`/${locale}/checkout`, window.location.origin)
      if (promoDiscount > 0 && promoCode) {
        checkoutUrl.searchParams.set('promo', promoCode)
      }
      router.push(checkoutUrl.pathname + checkoutUrl.search)
      setIsProcessing(false)
    }, 1000)
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">        <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-800 hover:border-brand-blue-200 dark:hover:border-brand-red-800 transition-all duration-300">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('cart.empty')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your shopping cart is empty. Add some items to continue shopping.
          </p>
          <Link href={`/${locale}/`} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <ChevronLeft className="inline-block mr-2" size={20} />
            {t('cart.continueShoping')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="w-full max-w-7xl">            <div className="bg-white dark:bg-stone-950 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-brand-blue-200 dark:hover:border-brand-red-800 transition-all duration-300">
              <div className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Left Column - Cart Items */}
                  <div className="lg:col-span-8">
                    <div className="p-8">
                      <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                          Shopping Cart
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                          {items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </p>
                      </div>

                      <hr className="my-6 border-gray-200 dark:border-gray-700" />

                      {items.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex items-center py-6">
                            {/* Item Image */}
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                              <Image
                                src={item.imageUrl || '/images/Default-image.png'}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 80px, 96px"
                                priority
                              />
                            </div>
                            
                            {/* Item Details */}
                            <div className="ml-6 flex-1">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {item.type === 'component' ? 'Component' : 'PC Configuration'}
                              </p>
                              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </h3>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center mx-4">
                              <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              >
                                <Minus size={16} />
                              </button>

                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                className="w-16 mx-2 text-center border border-gray-300 dark:border-gray-600 rounded-md py-1 text-gray-900 dark:text-white bg-white dark:bg-stone-950"
                                min="0"
                              />

                              <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              >
                                <Plus size={16} />
                              </button>
                            </div>                            {/* Remove Button */}
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="ml-4 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          {index < items.length - 1 && <hr className="my-6 border-gray-200 dark:border-gray-700" />}
                        </div>
                      ))}

                      <hr className="my-6 border-gray-200 dark:border-gray-700" />

                      <div className="pt-8">
                        <Link 
                          href={`/${locale}/`} 
                          className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                          <ChevronLeft className="mr-2" size={20} />
                          Back to shop
                        </Link>
                      </div>
                    </div>
                  </div>                  {/* Right Column - Order Summary */}
                  <div className="lg:col-span-4 bg-gray-50 dark:bg-stone-900 border-l border-gray-200 dark:border-gray-800">
                    <div className="p-8">
                      <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
                        Summary
                      </h2>

                      <hr className="my-6 border-gray-200 dark:border-gray-700" />

                      <div className="flex justify-between mb-4">
                        <h5 className="text-sm text-gray-600 dark:text-gray-400">
                          Subtotal
                        </h5>
                        <h5 className="text-gray-900 dark:text-white">€ {totalPrice.toFixed(2)}</h5>
                      </div>

                      {promoDiscount > 0 && (
                        <div className="flex justify-between mb-4">
                          <h5 className="text-sm text-green-600 dark:text-green-400">
                            Promo Discount
                          </h5>
                          <h5 className="text-green-600 dark:text-green-400">-€ {promoDiscount.toFixed(2)}</h5>
                        </div>
                      )}

                      <hr className="my-6 border-gray-200 dark:border-gray-700" />

                      <div className="flex justify-between mb-8">
                        <h5 className="text-sm uppercase font-medium text-gray-900 dark:text-white">
                          Total price
                        </h5>
                        <h5 className="text-lg font-bold text-gray-900 dark:text-white">€ {finalTotal.toFixed(2)}</h5>
                      </div>

                      <div className="mb-8">
                        <input
                          type="text"
                          placeholder="Enter your code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="w-full p-3 rounded-md bg-white dark:bg-stone-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white uppercase"
                          style={{ textTransform: 'uppercase' }}
                        />
                        {promoError && <p className="text-red-500 text-sm mt-2">{promoError}</p>}
                        <button
                          onClick={validatePromoCode}
                          className="mt-4 w-full py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                        >
                          Apply Promo Code
                        </button>
                      </div>

                      <hr className="my-6 border-gray-200 dark:border-gray-700" />

                      <button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full py-4 bg-gray-900 dark:bg-gray-800 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          'Checkout'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}