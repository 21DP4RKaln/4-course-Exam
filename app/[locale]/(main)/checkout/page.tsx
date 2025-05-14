'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useCart } from '@/app/contexts/CartContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { calculateShipping, type ShippingRate } from '@/lib/utils/shipping'
import PhoneInput from '@/app/components/ui/PhoneInput'
import AnimatedButton from '@/app/components/ui/animated-button'
import {
  CreditCard,
  Truck,
  User,
  MapPin,
  AlertCircle,
  Loader2
} from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [useStoredAddress, setUseStoredAddress] = useState(true)
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const formSchema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
    phone: z.string().min(8, t('validation.invalidPhone')),
    address: z.string().min(1, t('validation.required')),
    city: z.string().min(1, t('validation.required')),
    postalCode: z.string().min(1, t('validation.required')),
    country: z.string().min(1, t('validation.required')),
    saveAddress: z.boolean().optional(),
    paymentMethod: z.enum(['card', 'cash'])
  })

  type CheckoutFormData = z.infer<typeof formSchema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.shippingAddress || '',
      city: user?.shippingCity || '',
      postalCode: user?.shippingPostalCode || '',
      country: user?.shippingCountry || '',
      saveAddress: false
    }
  })

  const formValues = watch()

  useEffect(() => {
    if (formValues.address && formValues.city && formValues.postalCode && formValues.country) {
      const rates = calculateShipping({
        address: formValues.address,
        city: formValues.city,
        postalCode: formValues.postalCode,
        country: formValues.country
      })
      setShippingRates(rates)
    }
  }, [formValues.address, formValues.city, formValues.postalCode, formValues.country])

  const onSubmit = async (data: CheckoutFormData) => {
    setPaymentError('')
    
    if (!selectedShipping) {
      setPaymentError(t('checkout.selectShippingMethod'))
      return
    }

    if (!data.paymentMethod) {
      setPaymentError(t('checkout.selectPaymentMethod'))
      return
    }

    try {
      setIsSubmitting(true)

      const shippingRate = shippingRates.find(rate => rate.method === selectedShipping)
      const order = {
        items,
        shippingAddress: {
          fullName: user?.name || 'Customer',
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country
        },
        paymentMethod: data.paymentMethod,
        shippingMethod: selectedShipping,
        promoCode: new URLSearchParams(window.location.search).get('promo') || undefined,
        subtotal: totalPrice,
        discount: 0, // TODO: Implement promo code discount
        shippingCost: shippingRate?.rate || 0,
        taxAmount: 0, // TODO: Implement tax calculation if needed
        total: totalPrice + (shippingRate?.rate || 0)
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || t('checkout.orderError'))
      }

      if (isAuthenticated && data.saveAddress) {
        await fetch('/api/user/address', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country
          })
        })
      }

      const orderData = await orderResponse.json()
      clearCart()
      router.push(`/${locale}/order-confirmation/${orderData.id}`)
    } catch (error: any) {
      console.error('Checkout error:', error)
      setPaymentError(error.message || t('checkout.generalError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <MapPin size={20} className="mr-2" />
          {t('checkout.shippingAddress')}
        </h2>

        {isAuthenticated && user?.shippingAddress && (
          <div className="mb-6">
            <div className={`p-4 border rounded-lg ${useStoredAddress ? 'border-primary' : 'border-gray-200 dark:border-gray-700'} mb-4`}>
              <label className="flex items-start">
                <input
                  type="radio"
                  checked={useStoredAddress}
                  onChange={() => {
                    setUseStoredAddress(true)
                    setValue('address', user.shippingAddress || '')
                    setValue('city', user.shippingCity || '')
                    setValue('postalCode', user.shippingPostalCode || '')
                    setValue('country', user.shippingCountry || '')
                  }}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{t('checkout.savedAddress')}</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {user.shippingAddress}<br />
                    {user.shippingCity}, {user.shippingPostalCode}<br />
                    {user.shippingCountry}
                  </div>
                </div>
              </label>
            </div>

            <label className="flex items-start">
              <input
                type="radio"
                checked={!useStoredAddress}
                onChange={() => {
                  setUseStoredAddress(false)
                  setValue('address', '')
                  setValue('city', '')
                  setValue('postalCode', '')
                  setValue('country', '')
                }}
                className="mt-1 mr-3"
              />
              <div className="font-medium text-gray-900 dark:text-white">
                {t('checkout.useNewAddress')}
              </div>
            </label>
          </div>
        )}

        {(!isAuthenticated || !user?.shippingAddress || !useStoredAddress) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white 
                  focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                  placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('checkout.phone')}
              </label>
              <PhoneInput
                value={watch('phone') || ''}
                onChange={(value) => setValue('phone', value)}
                error={errors.phone?.message}
                placeholder="+371 12345678"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('checkout.address')}
              </label>
              <input
                id="address"
                type="text"
                {...register('address')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white 
                  focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                  placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {errors.address && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('checkout.city')}
              </label>
              <input
                id="city"
                type="text"
                {...register('city')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white 
                  focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                  placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {errors.city && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('checkout.postalCode')}
              </label>
              <input
                id="postalCode"
                type="text"
                {...register('postalCode')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white 
                  focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                  placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {errors.postalCode && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.postalCode.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('checkout.country')}
              </label>
              <select
                id="country"
                {...register('country')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white 
                  focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="">{t('checkout.selectCountry')}</option>
                <option value="Latvia">Latvia</option>
                <option value="Estonia">Estonia</option>
                <option value="Lithuania">Lithuania</option>
              </select>
              {errors.country && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.country.message}</p>
              )}
            </div>

            {isAuthenticated && (
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('saveAddress')}
                    className="rounded border-gray-300 dark:border-gray-700 text-primary 
                      focus:ring-primary dark:focus:ring-offset-stone-950"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('checkout.saveAddressForNextTime')}
                  </span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('checkout.shippingMethod')}
        </h3>
        
        <div className="space-y-3 mb-6">
          {shippingRates.map((rate) => (
            <label key={rate.method} className="flex items-center p-4 border rounded-lg hover:border-primary cursor-pointer">
              <input
                type="radio"
                name="shippingMethod"
                value={rate.method}
                checked={selectedShipping === rate.method}
                onChange={() => {                  setSelectedShipping(rate.method)
                  // Reset payment method when changing shipping
                  setValue('paymentMethod', 'card')
                }}
                className="w-4 h-4 text-primary mr-3"
              />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    {rate.method === 'COURIER' ? t('checkout.courier') : t('checkout.post')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {rate.estimatedDays} {t('checkout.days')}
                  </div>
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {rate.rate === 0 ? t('checkout.free') : `€${rate.rate.toFixed(2)}`}
                </div>
              </div>
            </label>
          ))}
        </div>

        {selectedShipping && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('checkout.paymentMethods.title')}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg hover:border-primary cursor-pointer">
                <input
                  type="radio"
                  value="card"
                  {...register('paymentMethod')}
                  className="w-4 h-4 text-primary mr-3"
                />
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{t('checkout.paymentMethods.card')}</span>
                </div>
              </label>
              
              {selectedShipping === 'COURIER' && (
                <label className="flex items-center p-4 border rounded-lg hover:border-primary cursor-pointer">
                  <input
                    type="radio"
                    value="cash"
                    {...register('paymentMethod')}
                    className="w-4 h-4 text-primary mr-3"
                  />
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">{t('checkout.paymentMethods.cash')}</span>
                  </div>
                </label>
              )}
            </div>
            {errors.paymentMethod && (
              <p className="mt-1.5 text-sm text-red-600">{errors.paymentMethod.message}</p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>{t('checkout.subtotal')} ({items.length} {t('checkout.items')})</span>
            <span>€{totalPrice.toFixed(2)}</span>
          </div>
          
          {selectedShipping && (
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{t('checkout.shipping')}</span>
              <span>
                {shippingRates.find(rate => rate.method === selectedShipping)?.rate === 0 
                  ? t('checkout.free') 
                  : `€${shippingRates.find(rate => rate.method === selectedShipping)?.rate.toFixed(2)}`}
              </span>
            </div>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
              <span>{t('checkout.total')}</span>
              <span>€{(totalPrice + (selectedShipping ? (shippingRates.find(rate => rate.method === selectedShipping)?.rate || 0) : 0)).toFixed(2)}</span>
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
          disabled={isSubmitting}
          className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              {t('checkout.processing')}
            </>
          ) : (
            `${t('checkout.placeOrder')} - €${(totalPrice + (selectedShipping ? (shippingRates.find(rate => rate.method === selectedShipping)?.rate || 0) : 0)).toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const { items } = useCart()

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
      <div className="mb-6">
        <Link href={`/${locale}/cart`}>
          <AnimatedButton 
            title={t('buttons.backToCart')}
            direction="left"
            className="text-gray-600 dark:text-gray-400" 
          />
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('checkout.title')}
      </h1>

      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  )
}
