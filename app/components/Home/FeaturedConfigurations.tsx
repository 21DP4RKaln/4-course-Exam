'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/app/contexts/CartContext'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ShoppingCart, Heart, ChevronRight, Trophy, Flame } from 'lucide-react'
import { useTranslationWithFallback } from '@/app/i18n/translationUtils'

interface Configuration {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number | null
  imageUrl: string | null
  viewCount?: number
  isPopular?: boolean
  orderCount?: number
}

export default function FeaturedConfigurations() {  
  const t = useTranslations()
  const tSafe = useTranslationWithFallback()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const router = useRouter()
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { isAuthenticated, user } = useAuth()
  
  const { scrollY } = useScroll()
  const sectionOpacity = useTransform(scrollY, [300, 600], [0, 1])
  const sectionY = useTransform(scrollY, [300, 600], [100, 0])
  const cardsScale = useTransform(scrollY, [400, 700], [0.9, 1])
  
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchConfigurations = async () => {
      setLoading(true)
      try {        
        const response = await fetch('/api/configurations/popular?limit=4&sortBy=viewCount')
        if (!response.ok) {
          throw new Error('Failed to fetch popular configurations')
        }
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        const sortedConfigurations = Array.isArray(data) ? [...data].sort((a, b) => {
          if ((b.orderCount || 0) - (a.orderCount || 0) !== 0) {
            return (b.orderCount || 0) - (a.orderCount || 0);
          }
          return (b.viewCount || 0) - (a.viewCount || 0);
        }) : [];
        
        setConfigurations(sortedConfigurations)
      } catch (err) {
        console.error('Error fetching configurations:', err)
        setError('Failed to load configurations')
      } finally {
        setLoading(false)
      }
    }
    
    fetchConfigurations()
  }, [])
  const handleAddToCart = (config: Configuration) => {
    addItem({
      id: config.id,
      type: 'configuration',
      name: config.name,
      price: config.discountPrice || config.price,
      imageUrl: config.imageUrl || ''
    })
  }
    const handleToggleWishlist = (config: Configuration, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?returnUrl=${encodeURIComponent(pathname)}`)
      return
    }
    
    const isAlreadyInWishlist = isInWishlist(config.id, 'CONFIGURATION')
    
    try {
      if (isAlreadyInWishlist) {
        removeFromWishlist(config.id, 'CONFIGURATION')
      } else {
        addToWishlist(config.id, 'CONFIGURATION')
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error)
      if (String(error).includes('JWT') || String(error).includes('401')) {
        router.push(`/${locale}/auth/login?returnUrl=${encodeURIComponent(pathname)}`)
      }
    }
  }

  if (loading) {
    return (
      <section className="py-8 md:py-12 px-4 md:px-0">
        <div className="animate-pulse">
          <div className="h-8 md:h-10 w-36 md:w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-6 md:mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden">
                <div className="h-36 sm:h-40 md:h-48 bg-neutral-300 dark:bg-neutral-700 animate-pulse"></div>
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-5 md:h-6 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                  <div className="h-3 md:h-4 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="h-5 md:h-6 w-16 md:w-20 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                    <div className="flex space-x-1 sm:space-x-2">
                      <div className="h-7 w-7 md:h-8 md:w-8 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-pulse"></div>
                      <div className="h-7 w-7 md:h-8 md:w-8 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error && configurations.length === 0) {
    return (
      <section className="py-8 md:py-12 px-4 md:px-0">
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-4 md:p-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-3 md:mb-4">
            {t('error.loadingConfigs')}
          </h2>
          <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400">
            {error}
          </p>
        </div>
      </section>
    )
  }

  return (
    <motion.section 
      className="py-8 md:py-12 px-4 md:px-0"
      style={{ 
        opacity: sectionOpacity,
        y: sectionY
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >      <motion.div 
        className="flex items-center justify-between mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
          {t('nav.Popular')}
        </h2>        <Link
          href={`/${locale}/shop/ready-made`}
          className="flex items-center px-3 py-1.5 rounded-md bg-white dark:bg-stone-800 hover:bg-neutral-50 dark:hover:bg-stone-700 text-blue-600 dark:text-brand-red-400 shadow-sm border border-neutral-200 dark:border-stone-700 transition-colors text-sm md:text-base"
        >
          {t('buttons.view')} <ChevronRight size={16} className="ml-1" />
        </Link>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        style={{ scale: cardsScale }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, staggerChildren: 0.1 }}
      >
        {configurations.map((config, index) => (          <motion.div 
            key={config.id}
            className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Image or placeholder */}
            <Link href={`/${locale}/shop/product/${config.id}`}>
              <div className="h-40 sm:h-48 md:h-56 bg-gradient-to-b from-white to-neutral-50 dark:from-stone-900 dark:to-stone-950 relative overflow-hidden transition-all">
                <div className="absolute inset-0">
                  <img 
                    src={config.imageUrl || '/images/product-placeholder.svg'} 
                    alt={config.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    style={{
                      objectPosition: 'center',
                      filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.15))'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/images/product-placeholder.svg'
                    }}
                    loading="lazy"
                  />
                </div>
                
                {/* Always show "Popular" badge */}
                <div 
                  className="absolute top-2 left-2 bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 dark:from-red-600 dark:to-red-500 text-white px-2 py-1 rounded text-xs flex items-center shadow-md"
                  title={`${tSafe('nav.viewedTimes', 'Viewed ' + (config.viewCount || 0) + ' times', { count: config.viewCount || 0 })}`}
                >
                  <Flame size={12} className="mr-1" />
                  {tSafe('nav.popular', 'Popular')}
                </div>
                {/* Show "Top Pick" for the configuration with highest order count */}
                {config.orderCount && 
                  configurations.findIndex(c => 
                    c.orderCount && c.orderCount === Math.max(...configurations.filter(conf => conf.orderCount).map(conf => conf.orderCount || 0))
                  ) === configurations.indexOf(config) && (
                  <div 
                    className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500 text-white px-2 py-1 rounded text-xs flex items-center shadow-md"
                    title={`${t('nav.orderedTimes', { count: config.orderCount })}`}
                  >
                    <Trophy size={12} className="mr-1" />
                    {t('nav.topPick')}
                  </div>
                )}
              </div>
            </Link>
              <div className="p-3 sm:p-4">
              <Link href={`/${locale}/shop/product/${config.id}`}>                <h3 className="font-semibold text-sm md:text-base text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-brand-red-400 transition-colors line-clamp-1">
                  {config.name}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {config.description}
              </p>
                <div className="mt-3 md:mt-4 flex items-center justify-between">
                <div>                  {config.discountPrice ? (
                    <div className="flex flex-col">
                      <span className="text-base md:text-lg font-bold text-blue-600 dark:text-brand-red-400">
                        €{config.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-xs md:text-sm text-neutral-500 line-through">
                        €{config.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base md:text-lg font-bold text-blue-600 dark:text-white">
                      €{config.price.toFixed(2)}
                    </span>
                  )}
                </div>
                  <div className="flex space-x-1 sm:space-x-2">
                  <button 
                    onClick={() => handleAddToCart(config)}
                    className="p-1.5 sm:p-2 bg-blue-600 dark:bg-brand-red-500 hover:bg-blue-700 dark:hover:bg-brand-red-600 text-white rounded-full shadow-sm transform transition-transform hover:scale-110"
                    title={t('buttons.addToCart')}
                  >
                    <ShoppingCart size={14} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={(e) => handleToggleWishlist(config, e)}
                    className={`p-1.5 sm:p-2 rounded-full shadow-sm transform transition-transform hover:scale-110 ${
                      isInWishlist(config.id, 'CONFIGURATION') 
                      ? 'bg-blue-600 dark:bg-brand-red-500 text-white' 
                      : 'bg-white dark:bg-stone-800 hover:bg-neutral-100 dark:hover:bg-stone-700 text-blue-600 dark:text-neutral-300 border border-neutral-200 dark:border-stone-700'
                    }`}
                    title={isInWishlist(config.id, 'CONFIGURATION') 
                      ? t('buttons.removeFromWishlist') 
                      : t('buttons.addToWishlist')}
                  >
                    <Heart size={14} strokeWidth={2.5} className={isInWishlist(config.id, 'CONFIGURATION') ? 'fill-white' : ''} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}