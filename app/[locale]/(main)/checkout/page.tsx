'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
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

// Inicializē Stripe maksājumu sistēmu
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm() {
  // Inicializē hooks un kontekstus
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  // Ref objekti animāciju pārvaldībai
  const formRef = useRef(null)
  const shippingRef = useRef(null)
  const paymentRef = useRef(null)
  
  // InView hooks animāciju aktivizēšanai
  const isFormInView = useInView(formRef, { once: false, margin: "-100px", amount: 0.2 })
  const isShippingInView = useInView(shippingRef, { once: false, margin: "-100px", amount: 0.2 })
  const isPaymentInView = useInView(paymentRef, { once: false, amount: 0.2 })

  // Animāciju konfigurācijas objekti
  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }
  
  const cardVariants = {
    initial: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" },
    hover: { 
      scale: 1.01, 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 } 
    }
  }
  
  const shippingMethodVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  }
  
  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.3 
      } 
    })
  }

  // State mainīgie formas pārvaldībai
  const [useStoredAddress, setUseStoredAddress] = useState(true)
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoCode, setPromoCode] = useState<string | null>(null)

  // Iegūst promo kodu no URL parametriem, ja tāds ir
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('promo')
    if (code) {
      setPromoCode(code)
      validatePromoCode(code)
    }
  }, [])

  // Validē promo kodu caur API
  const validatePromoCode = async (code: string) => {
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          total: totalPrice
        })
      })

      if (!response.ok) {
        console.error('Failed to validate promo code:', await response.text())
        setPromoDiscount(0)
        return
      }

      const data = await response.json()
      if (data.valid) {
        setPromoDiscount(data.discount || 0)
      } else {
        setPromoDiscount(0)
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoDiscount(0)
    }
  }

  // Formas validācijas shēma ar Zod
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

  // React Hook Form inicializācija
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

  // Aprēķina piegādes cenas, kad mainās adrese
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

  // Galvenā formas apstrādes funkcija
  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      setPaymentError('');

      // Pārbauda vai ir izvēlēts piegādes veids
      if (!selectedShipping) {
        setPaymentError(t('checkout.selectShippingMethod'));
        return;
      }

      // Pārbauda vai ir izvēlēts maksājuma veids
      if (!data.paymentMethod) {
        setPaymentError(t('checkout.selectPaymentMethod'));
        return;
      }

      const shippingRate = shippingRates.find(rate => rate.method === selectedShipping);      
      
      // Sagatavo pasūtījuma datus
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type,
          images: item.imageUrl ? [item.imageUrl] : []
        })),
        total: totalPrice + (shippingRate?.rate || 0) - promoDiscount,
        locale: locale, 
        shipping: {
          method: selectedShipping,
          rate: shippingRate?.rate || 0,
          address: {
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country
          }
        }
      };

      // Ja maksājums ar karti, izveido Stripe sesiju
      if (data.paymentMethod === 'card') {
        try {
          console.log('Creating Stripe session...');
          const sessionResponse = await fetch('/api/checkout/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...orderData,
              promoDiscount,
              promoCode
            })
          });

          if (!sessionResponse.ok) {
            const errorData = await sessionResponse.json();
            console.error('Session creation failed:', errorData);
            throw new Error(errorData.error || t('checkout.stripeError'));
          }

          const responseData = await sessionResponse.json();
          console.log('Session created successfully:', responseData);

          if (responseData.sessionUrl && /^https?:\/\//.test(responseData.sessionUrl)) {
            window.location.assign(responseData.sessionUrl);
          } else {
            console.error('Invalid session URL:', responseData.sessionUrl);
            throw new Error(t('checkout.stripeError'));
          }
        } catch (error) {
          console.error('Stripe session error:', error);
          setPaymentError(error instanceof Error ? error.message : t('checkout.stripeError'));
          return;
        }
      }      
      
      // Apstrādā skaidras naudas maksājumu
      console.log('Processing cash payment order...');
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          paymentMethod: data.paymentMethod,
          promoCode: promoCode,
          promoDiscount: promoDiscount,
          locale: locale 
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || t('checkout.orderError'));
      }

      // Saglabā adresi, ja lietotājs to vēlas
      if (isAuthenticated && data.saveAddress) {
        console.log('Saving address...');
        await fetch('/api/user/address', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country
          })
        });
      }

      // Pārvirza uz pasūtījuma apstiprinājuma lapu
      const { id } = await orderResponse.json();
      clearCart();
      router.push(`/${locale}/order-confirmation/${id}`);
    } catch (error: any) {
      console.error('Checkout error:', error);
      setPaymentError(error.message || t('checkout.generalError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Piegādes adreses sadaļa */}
      <motion.div 
        ref={formRef}
        initial="hidden"
        animate={isFormInView ? "visible" : "hidden"}
        variants={formVariants}
        whileHover="hover"
        className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6"
      >
        <motion.h2 
          className="text-xl font-semibold text-neutral-900 dark:text-white mb-6 flex items-center"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <MapPin size={20} className="mr-2" />
          {t('checkout.shippingAddress')}
        </motion.h2>

        {/* Saglabātās adreses izvēle autentificētiem lietotājiem */}
        {isAuthenticated && user?.shippingAddress && (
          <div className="mb-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`p-4 border rounded-lg ${useStoredAddress ? 'border-primary' : 'border-neutral-200 dark:border-neutral-700'} mb-4`}
            >
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
                  <div className="font-medium text-neutral-900 dark:text-white">{t('checkout.savedAddress')}</div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {user.shippingAddress}<br />
                    {user.shippingCity}, {user.shippingPostalCode}<br />
                    {user.shippingCountry}
                  </div>
                </div>
              </label>
            </motion.div>

            <motion.label 
              whileHover={{ scale: 1.02 }}
              className="flex items-start"
            >
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
              <div className="font-medium text-neutral-900 dark:text-white">
                {t('checkout.useNewAddress')}
              </div>
            </motion.label>
          </div>
        )}

        {/* Adreses ievades forma */}
        {(!isAuthenticated || !user?.shippingAddress || !useStoredAddress) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email lauks */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white 
                  focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                  placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </motion.div>

            {/* Telefona lauks */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('checkout.phone')}
              </label>
              <PhoneInput
                value={watch('phone') || ''}
                onChange={(value) => setValue('phone', value)}
                error={errors.phone?.message}
                placeholder="+371 12345678"
              />
            </motion.div>

            {/* Adreses lauks */}
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <label htmlFor="address" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('checkout.address')}
              </label>
              <input
                id="address"
                type="text"
                {...register('address')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white 
                  focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                  placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              {errors.address && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.address.message}</p>
              )}
            </motion.div>

            {/* Pilsētas lauks */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <label htmlFor="city" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('checkout.city')}
              </label>
              <input
                id="city"
                type="text"
                {...register('city')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white 
                  focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                  placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              {errors.city && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
              )}
            </motion.div>

            {/* Pasta koda lauks */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('checkout.postalCode')}
              </label>
              <input
                id="postalCode"
                type="text"
                {...register('postalCode')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white 
                  focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                  placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              {errors.postalCode && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.postalCode.message}</p>
              )}
            </motion.div>

            {/* Valsts izvēles lauks */}
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <label htmlFor="country" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('checkout.country')}
              </label>
              <select
                id="country"
                {...register('country')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 
                  border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white 
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
            </motion.div>

            {/* Adreses saglabāšanas izvēlne */}
            {isAuthenticated && (
              <motion.div 
                className="md:col-span-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('saveAddress')}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-primary 
                      focus:ring-primary dark:focus:ring-offset-stone-950"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {t('checkout.saveAddressForNextTime')}
                  </span>
                </label>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* Piegādes veida un maksājuma sadaļa */}
      <motion.div 
        ref={shippingRef}
        initial="hidden"
        animate={isShippingInView ? "visible" : "hidden"}
        variants={formVariants}
        whileHover="hover"
        className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6"
      >
        <motion.h3 
          className="text-lg font-medium text-neutral-900 dark:text-white mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {t('checkout.shippingMethod')}
        </motion.h3>
        
        {/* Piegādes veidu saraksts */}
        <div className="space-y-3 mb-6">
          {shippingRates.map((rate, index) => (
            <motion.label 
              key={rate.method} 
              className="flex items-center p-4 border rounded-lg hover:border-primary cursor-pointer"
              custom={index}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={rate.method}
                checked={selectedShipping === rate.method}
                onChange={() => {
                  setSelectedShipping(rate.method)
                  setValue('paymentMethod', 'card')
                }}
                className="w-4 h-4 text-primary mr-3"
              />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-white flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    {rate.method === 'COURIER' ? t('checkout.courier') : t('checkout.post')}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {rate.estimatedDays} {t('checkout.days')}
                  </div>
                </div>
                <div className="font-medium text-neutral-900 dark:text-white">
                  {rate.rate === 0 ? t('checkout.free') : `€${rate.rate.toFixed(2)}`}
                </div>
              </div>
            </motion.label>
          ))}
        </div>

        {/* Maksājuma veidu izvēle */}
        {selectedShipping && (
          <motion.div 
            ref={paymentRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <motion.h3 
              className="text-lg font-medium text-neutral-900 dark:text-white mb-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {t('checkout.paymentMethods.title')}
            </motion.h3>
            <div className="space-y-3">
              {/* Karšu maksājums */}
              <motion.label 
                className="flex items-center p-4 border rounded-lg hover:border-primary cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <input
                  type="radio"
                  value="card"
                  {...register('paymentMethod')}
                  className="w-4 h-4 text-primary mr-3"
                />
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  <span className="text-neutral-700 dark:text-neutral-300">{t('checkout.paymentMethods.card')}</span>
                </div>
              </motion.label>
              
              {/* Skaidras naudas maksājums (tikai kurjeriem) */}
              {selectedShipping === 'COURIER' && (
                <motion.label 
                  className="flex items-center p-4 border rounded-lg hover:border-primary cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <input
                    type="radio"
                    value="cash"
                    {...register('paymentMethod')}
                    className="w-4 h-4 text-primary mr-3"
                  />
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    <span className="text-neutral-700 dark:text-neutral-300">{t('checkout.paymentMethods.cash')}</span>
                  </div>
                </motion.label>
              )}
            </div>
            {errors.paymentMethod && (
              <p className="mt-1.5 text-sm text-red-600">{errors.paymentMethod.message}</p>
            )}
          </motion.div>
        )}

        {/* Pasūtījuma kopsavilkums */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Starpsumma */}
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>{t('checkout.subtotal')} ({items.length} {t('checkout.items')})</span>
            <span>€{totalPrice.toFixed(2)}</span>
          </div>
          
          {/* Piegādes maksa */}
          {selectedShipping && (
            <motion.div 
              className="flex justify-between text-neutral-600 dark:text-neutral-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span>{t('checkout.shipping')}</span>
              <span>
                {shippingRates.find(rate => rate.method === selectedShipping)?.rate === 0 
                  ? t('checkout.free') 
                  : `€${shippingRates.find(rate => rate.method === selectedShipping)?.rate.toFixed(2)}`}
              </span>
            </motion.div>
          )}

          {/* Promo atlaide */}
          {promoDiscount > 0 && (
            <motion.div 
              className="flex justify-between text-green-600 dark:text-green-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span>{t('checkout.promoDiscount')}</span>
              <span>-€{promoDiscount.toFixed(2)}</span>
            </motion.div>
          )}
          
          {/* Kopējā summa */}
          <motion.div 
            className="border-t border-neutral-200 dark:border-neutral-700 pt-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex justify-between font-semibold text-lg text-neutral-900 dark:text-white">
              <span>{t('checkout.total')}</span>
              <span>€{(totalPrice + (selectedShipping ? (shippingRates.find(rate => rate.method === selectedShipping)?.rate || 0) : 0) - promoDiscount).toFixed(2)}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Kļūdu paziņojumi */}
        {paymentError && (
          <motion.p 
            className="mt-4 text-red-600 dark:text-red-400 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle size={16} className="mr-1" />
            {paymentError}
          </motion.p>
        )}
        
        {/* Pasūtījuma apstiprinājuma poga */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              {t('checkout.processing')}
            </>
          ) : (
            `${t('checkout.placeOrder')} - €${(totalPrice + (selectedShipping ? (shippingRates.find(rate => rate.method === selectedShipping)?.rate || 0) : 0) - promoDiscount).toFixed(2)}`
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  )
}

export default function CheckoutPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const { items } = useCart()
  
  const pageRef = useRef(null)
  const isInView = useInView(pageRef, { once: false, amount: 0.3 })
  const { scrollYProgress } = useScroll()
  
  const headerY = useTransform(scrollYProgress, [0, 0.3], [0, -20])
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/cart`)
    }
  }, [items.length, router, locale])

  if (items.length === 0) {
    return null
  }

  return (
    <motion.div
      ref={pageRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="max-w-6xl mx-auto"
    >
      <motion.div className="mb-6">
        <Link href={`/${locale}/cart`}>
          <AnimatedButton 
            title={t('buttons.backToCart')}
            direction="left"
            className="text-neutral-600 dark:text-neutral-400" 
          />
        </Link>
      </motion.div>
      
      <motion.h1
        style={{ y: headerY, opacity: headerOpacity }}
        className="text-3xl font-bold text-neutral-900 dark:text-white mb-8"
      >
        {t('checkout.title')}
      </motion.h1>

      <motion.div variants={itemVariants}>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </motion.div>
    </motion.div>
  )
}
