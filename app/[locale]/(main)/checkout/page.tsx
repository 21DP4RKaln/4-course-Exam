'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/app/contexts/CartContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { 
  CreditCard, 
  Truck, 
  Check,
  MapPin,
  Phone,
  Mail,
  User,
  Tag,
  AlertCircle,
  Loader2
} from 'lucide-react'
import AnimatedButton from '@/app/components/ui/animated-button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { calculateShipping, ShippingRate } from '@/lib/utils/shipping'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  paymentMethod: z.enum(['card', 'courier_cash', 'postal_cash']),
  shippingMethod: z.enum(['courier', 'post']),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

function CheckoutForm() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const stripe = useStripe()
  const elements = useElements()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      fullName: user?.name || '',
      paymentMethod: 'card',
      shippingMethod: 'courier',
    }
  })

  const watchedFields = watch(['city', 'address', 'postalCode', 'country'])
  
  useEffect(() => {
    const [city, address, postalCode, country] = watchedFields
    if (city && address && postalCode && country) {
      const rates = calculateShipping({ city, address, postalCode, country })
      setShippingRates(rates)
     
      if (rates.length > 0) {
        const preferredMethod = watch('shippingMethod')
        const defaultRate = preferredMethod === 'courier' 
          ? rates.find(r => r.method === 'COURIER') || rates[0]
          : rates.find(r => r.method === 'POST') || rates[0]
        setSelectedShipping(defaultRate)
      }
    }
  }, watchedFields)
 
  const handleApplyPromo = async () => {
    if (!promoCode) return
    
    setPromoLoading(true)
    setPromoError(null)
    
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          cartItems: items,
          subtotal: totalPrice,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setPromoError(data.error?.message || 'Invalid promo code')
        setAppliedPromo(null)
        return
      }
      
      setAppliedPromo(data)
    } catch (error) {
      setPromoError('Failed to apply promo code')
      setAppliedPromo(null)
    } finally {
      setPromoLoading(false)
    }
  }

  const removePromo = () => {
    setPromoCode('')
    setAppliedPromo(null)
    setPromoError(null)
  }
  
  const subtotal = totalPrice
  const discount = appliedPromo?.discount || 0
  const shippingCost = selectedShipping?.rate || 0
  const taxRate = 0.21
  const taxAmount = (subtotal - discount) * taxRate
  const finalTotal = subtotal - discount + shippingCost + taxAmount

  const onSubmit = async (data: CheckoutFormData) => {
    if (!selectedShipping) {
      setPaymentError('Please select a shipping method')
      return
    }

    setIsSubmitting(true)
    setPaymentError(null)

    try {
      if (data.paymentMethod === 'card') {
        if (!stripe || !elements) {
          throw new Error('Stripe not initialized')
        }
      
        const paymentIntentResponse = await fetch('/api/checkout/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalTotal }),
        })

        const { clientSecret } = await paymentIntentResponse.json()
        
        const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: data.fullName,
              email: data.email,
              phone: data.phone,
              address: {
                line1: data.address,
                city: data.city,
                postal_code: data.postalCode,
                country: data.country,
              },
            },
          },
        })

        if (stripeError) {
          throw new Error(stripeError.message)
        }
      }
    
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
          },
          paymentMethod: data.paymentMethod,
          shippingMethod: selectedShipping.method,
          promoCode: appliedPromo?.code,
          subtotal,
          discount,
          shippingCost,
          taxAmount,
          total: finalTotal,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const order = await orderResponse.json()
      clearCart()
      router.push(`/${locale}/order-confirmation/${order.id}`)
    } catch (error: any) {
      setPaymentError(error.message || 'Payment failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Shipping Information */}
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <MapPin size={20} className="mr-2" />
          Shipping Address
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
                className="form-input pl-10"
              />
            </div>
            {errors.fullName && (
              <p className="form-error">{errors.fullName.message}</p>
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
                className="form-input pl-10"
              />
            </div>
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
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
                className="form-input pl-10"
              />
            </div>
            {errors.phone && (
              <p className="form-error">{errors.phone.message}</p>
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
              className="form-input"
            />
            {errors.address && (
              <p className="form-error">{errors.address.message}</p>
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
              className="form-input"
            />
            {errors.city && (
              <p className="form-error">{errors.city.message}</p>
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
              className="form-input"
            />
            {errors.postalCode && (
              <p className="form-error">{errors.postalCode.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="country" className="form-label">
              Country
            </label>
            <select
              id="country"
              {...register('country')}
              className="form-input"
            >
              <option value="">Select a country</option>
              <option value="Latvia">Latvia</option>
              <option value="Estonia">Estonia</option>
              <option value="Lithuania">Lithuania</option>
              <option value="Finland">Finland</option>
              <option value="Sweden">Sweden</option>
              <option value="Germany">Germany</option>
              <option value="Poland">Poland</option>
            </select>
            {errors.country && (
              <p className="form-error">{errors.country.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Methods */}
      {shippingRates.length > 0 && (
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Truck size={20} className="mr-2" />
            Shipping Method
          </h2>
          
          <div className="space-y-4">
            {shippingRates.map((rate) => (
              <div
                key={rate.method}
                className={`relative border rounded-lg p-4 cursor-pointer ${
                  selectedShipping?.method === rate.method
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => {
                  setSelectedShipping(rate)
                  setValue('shippingMethod', rate.method.toLowerCase() as 'courier' | 'post')
                }}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    checked={selectedShipping?.method === rate.method}
                    onChange={() => {}}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {rate.method === 'COURIER' ? 'Courier Delivery' : 'Postal Service'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Estimated delivery: {rate.estimatedDays} business days
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      €{rate.rate === 0 ? 'Free' : rate.rate.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promo Code */}
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Tag size={20} className="mr-2" />
          Promo Code
        </h2>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="form-input uppercase"
              disabled={!!appliedPromo}
            />
          </div>
          {appliedPromo ? (
            <button
              type="button"
              onClick={removePromo}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={!promoCode || promoLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {promoLoading ? <Loader2 size={18} className="animate-spin" /> : 'Apply'}
            </button>
          )}
        </div>
        
        {promoError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {promoError}
          </p>
        )}
        
        {appliedPromo && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
            <Check size={16} className="mr-1" />
            {appliedPromo.description} - {appliedPromo.percentage}% off
          </p>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <CreditCard size={20} className="mr-2" />
          Payment Method
        </h2>
        
        <div className="space-y-4">
          <div 
            className={`relative border rounded-lg p-4 cursor-pointer ${
              watch('paymentMethod') === 'card'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => setValue('paymentMethod', 'card')}
          >
            <div className="flex items-start">
              <input
                type="radio"
                value="card"
                {...register('paymentMethod')}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Credit/Debit Card
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pay securely with your card
                </div>
              </div>
            </div>
            
            {watch('paymentMethod') === 'card' && (
              <div className="mt-4 pl-6">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#374151',
                        '::placeholder': {
                          color: '#9CA3AF',
                        },
                      },
                      invalid: {
                        color: '#EF4444',
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
          
          {selectedShipping?.method === 'COURIER' && (
            <div 
              className={`relative border rounded-lg p-4 cursor-pointer ${
                watch('paymentMethod') === 'courier_cash'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onClick={() => setValue('paymentMethod', 'courier_cash')}
            >
              <div className="flex items-start">
                <input
                  type="radio"
                  value="courier_cash"
                  {...register('paymentMethod')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Cash on Delivery (Courier)
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pay with cash when the courier delivers
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {selectedShipping?.method === 'POST' && (
            <div 
              className={`relative border rounded-lg p-4 cursor-pointer ${
                watch('paymentMethod') === 'postal_cash'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onClick={() => setValue('paymentMethod', 'postal_cash')}
            >
              <div className="flex items-start">
                <input
                  type="radio"
                  value="postal_cash"
                  {...register('paymentMethod')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Cash on Delivery (Postal)
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pay with cash at the post office
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 sticky top-24">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Order Summary
        </h2>
        
        <div className="space-y-4">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          
          {appliedPromo && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount ({appliedPromo.code})</span>
              <span>-€{discount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Shipping</span>
            <span>
              {selectedShipping 
                ? (selectedShipping.rate === 0 ? 'Free' : `€${selectedShipping.rate.toFixed(2)}`)
                : 'Calculated at checkout'
              }
            </span>
          </div>
          
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Tax (21%)</span>
            <span>€{taxAmount.toFixed(2)}</span>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
              <span>Total</span>
              <span>€{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {paymentError && (
          <p className="mt-4 text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {paymentError}
          </p>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !selectedShipping}
          className="w-full mt-6 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Place Order - €${finalTotal.toFixed(2)}`
          )}
        </button>
        
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          By placing your order, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const { items, totalPrice } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/cart`)
    }
  }, [items.length, router, locale])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">        <Link href={`/${locale}/cart`}>
          <AnimatedButton 
            title="Back to Cart"
            direction="left"
            className="text-gray-600 dark:text-gray-400" 
          />
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Checkout
      </h1>

      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  )
}