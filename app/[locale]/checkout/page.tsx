'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/app/contexts/CartContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Check,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  paymentMethod: z.enum(['card', 'paypal', 'bank']),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOrderComplete, setIsOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      fullName: user?.name || '',
      paymentMethod: 'card',
    }
  })

  if (items.length === 0 && !isOrderComplete) {
    router.push(`/${locale}/cart`)
    return null
  }

  if (!isAuthenticated) {
    router.push(`/${locale}/auth/login?redirect=checkout`)
    return null
  }

  const selectedPaymentMethod = watch('paymentMethod')

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate a random order number
      const randomOrderId = Math.floor(10000 + Math.random() * 90000).toString()
      setOrderNumber(randomOrderId)

      clearCart()

      setIsOrderComplete(true)
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isOrderComplete) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
          </div>
          
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t('checkout.orderSuccess')}
          </h1>
          
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Thank you for your order! We've received your payment and will process your order shortly.
          </p>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-md inline-block">
            <p className="text-gray-600 dark:text-gray-400">
              Order Reference Number:
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              #{orderNumber}
            </p>
          </div>
          
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            A confirmation email has been sent to your email address.
          </p>
          
          <div className="mt-8 space-x-4">
            <Link 
              href={`/${locale}/dashboard`}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-block"
            >
              View My Orders
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

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('checkout.title')}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <MapPin size={20} className="mr-2" />
                {t('checkout.shippingAddress')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      {...register('fullName')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    {...register('address')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    {...register('city')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="form-label">
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    {...register('postalCode')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.postalCode.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <select
                    id="country"
                    {...register('country')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select a country</option>
                    <option value="LV">Latvia</option>
                    <option value="EE">Estonia</option>
                    <option value="LT">Lithuania</option>
                    <option value="FI">Finland</option>
                    <option value="SE">Sweden</option>
                    <option value="DE">Germany</option>
                    <option value="PL">Poland</option>
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <CreditCard size={20} className="mr-2" />
                {t('checkout.paymentMethod')}
              </h2>
              
              <div className="space-y-4">
                <div className="relative border border-gray-300 dark:border-gray-700 rounded-md p-4 flex cursor-pointer hover:border-red-500 dark:hover:border-red-400"
                     onClick={() => setValue('paymentMethod', 'card')}>
                  <input
                    type="radio"
                    id="card"
                    value="card"
                    {...register('paymentMethod')}
                    className="mr-3 h-5 w-5 accent-red-600"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="card" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                      Credit / Debit Card
                    </label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Visa, Mastercard, American Express
                    </span>
                    
                    {selectedPaymentMethod === 'card' && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="form-label">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="form-label">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="form-label">CVC</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="form-input"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative border border-gray-300 dark:border-gray-700 rounded-md p-4 flex cursor-pointer hover:border-red-500 dark:hover:border-red-400"
                     onClick={() => setValue('paymentMethod', 'paypal')}>
                  <input
                    type="radio"
                    id="paypal"
                    value="paypal"
                    {...register('paymentMethod')}
                    className="mr-3 h-5 w-5 accent-red-600"
                  />
                  <div>
                    <label htmlFor="paypal" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                      PayPal
                    </label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Pay using your PayPal account
                    </span>
                  </div>
                </div>
                
                <div className="relative border border-gray-300 dark:border-gray-700 rounded-md p-4 flex cursor-pointer hover:border-red-500 dark:hover:border-red-400"
                     onClick={() => setValue('paymentMethod', 'bank')}>
                  <input
                    type="radio"
                    id="bank"
                    value="bank"
                    {...register('paymentMethod')}
                    className="mr-3 h-5 w-5 accent-red-600"
                  />
                  <div>
                    <label htmlFor="bank" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                      Bank Transfer
                    </label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Pay directly from your bank account
                    </span>
                  </div>
                </div>
                
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paymentMethod.message}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('checkout.orderSummary')}
              </h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (21%)</span>
                  <span>€{(totalPrice * 0.21).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
                    <span>{t('cart.total')}</span>
                    <span>€{(totalPrice + totalPrice * 0.21).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {t('checkout.placeOrder')}
                    </>
                  )}
                </button>
                
                <Link 
                  href={`/${locale}/cart`}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Return to Cart
                </Link>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center justify-center mb-2">
                  <Truck size={16} className="mr-1" />
                  Free shipping on all orders
                </p>
                <p>Your order is eligible for free shipping. Delivery time is estimated to be 3-5 business days.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}