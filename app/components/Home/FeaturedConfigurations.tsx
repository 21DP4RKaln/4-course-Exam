'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCart } from '@/app/contexts/CartContext'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { ShoppingCart, Heart, ChevronRight, Trophy, Flame, ArrowRight, Tag } from 'lucide-react'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'

interface Configuration {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number | null
  imageUrl: string | null
  viewCount?: number
  isPopular?: boolean
}

export default function FeaturedConfigurations() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const { addItem } = useCart()
  const { theme } = useTheme()
  const { isAuthenticated } = useAuth()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const defaultImageUrl = '/images/Default-image.png'

  useEffect(() => {
    const fetchConfigurations = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/configurations/popular?limit=4')
        
        if (!response.ok) {
          throw new Error('Failed to fetch popular configurations')
        }
        
        const data = await response.json()
        setConfigurations(data)
      } catch (error) {
        console.error('Error fetching popular configurations:', error)
        setError('Failed to load configurations')
      } finally {
        setLoading(false)
      }
    }
    
    fetchConfigurations()
  }, [])

  const handleAddToCart = (config: Configuration, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    addItem({
      id: config.id,
      type: 'configuration',
      name: config.name,
      price: config.discountPrice || config.price,
      imageUrl: config.imageUrl || defaultImageUrl
    })
  }

  const handleWishlistToggle = async (config: Configuration, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!isAuthenticated) {
      window.location.href = `/${locale}/auth/login`
      return
    }

    const inWishlist = isInWishlist(config.id, 'CONFIGURATION')
    if (inWishlist) {
      await removeFromWishlist(config.id, 'CONFIGURATION')
    } else {
      await addToWishlist(config.id, 'CONFIGURATION')
    }
  }

  const getDiscountPercentage = (price: number, discountPrice?: number | null) => {
    if (!discountPrice || discountPrice >= price) return null
    return Math.round(((price - discountPrice) / price) * 100)
  }

  if (loading) {
    return (
      <section className={`py-24 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-stone-950 rounded-lg p-4">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error && configurations.length === 0) {
    return null
  }

  return (
    <section className={`py-24 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('nav.Popular')}
          </h2>
          <Link
            href={`/${locale}/shop/ready-made`}
            className={`flex items-center text-sm font-medium ${
              theme === 'dark' 
                ? 'text-brand-red-400 hover:text-brand-red-300' 
                : 'text-brand-blue-600 hover:text-brand-blue-500'
            } transition-colors group`}
          >
            <span>{t('buttons.viewAll')}</span> 
            <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {configurations.map((config) => {
            const discountPercentage = getDiscountPercentage(config.price, config.discountPrice);
            const isHovered = hoveredItem === config.id;
            const inWishlist = isInWishlist(config.id, 'CONFIGURATION');
            
            return (
              <Link 
                key={config.id}
                href={`/${locale}/shop/product/${config.id}`}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-dark-card border border-stone-950 hover:border-brand-red-800'
                    : 'bg-white border border-gray-100 hover:border-brand-blue-200'
                } shadow-soft hover:shadow-medium`}
                onMouseEnter={() => setHoveredItem(config.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
                  {configurations.indexOf(config) === 0 && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' 
                        ? 'bg-amber-900/40 text-amber-400 border border-amber-800' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      <Trophy size={12} className="mr-1" />
                      {t('nav.topPick')}
                    </span>
                  )}
                  
                  {config.isPopular && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' 
                        ? 'bg-brand-red-900/40 text-brand-red-400 border border-brand-red-800' 
                        : 'bg-brand-blue-50 text-brand-blue-700 border border-brand-blue-100'
                    }`}>
                      <Flame size={12} className="mr-1" />
                      {t('nav.popular')}
                    </span>
                  )}
                  
                  {discountPercentage && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' 
                        ? 'bg-green-900/40 text-green-400 border border-green-800' 
                        : 'bg-green-50 text-green-700 border border-green-100'
                    }`}>
                      <Tag size={12} className="mr-1" />
                      {t('nav.discount', { percent: discountPercentage })}
                    </span>
                  )}
                </div>
                
                {/* Product image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image 
                    src={(config.imageUrl || defaultImageUrl).trim()} 
                    alt={config.name}
                    width={300}
                    height={300}
                    className={`w-full h-full object-contain transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
                  />
                  
                  {/* Action buttons overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  } bg-black/30 backdrop-blur-xs`}>
                    <button
                      onClick={(e) => handleAddToCart(config, e)}
                      className={`p-3 rounded-full transition-colors ${
                        theme === 'dark'
                          ? 'bg-brand-red-600 hover:bg-brand-red-700 text-white'
                          : 'bg-brand-blue-600 hover:bg-brand-blue-700 text-white'
                      }`}
                      aria-label={t('buttons.addToCart')}
                    >
                      <ShoppingCart size={18} />
                    </button>
                    
                    <button
                      onClick={(e) => handleWishlistToggle(config, e)}
                      className={`p-3 rounded-full transition-colors ${
                        inWishlist
                          ? theme === 'dark'
                            ? 'bg-brand-red-600 text-white hover:bg-brand-red-700'
                            : 'bg-brand-blue-600 text-white hover:bg-brand-blue-700'
                          : theme === 'dark'
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-white hover:bg-gray-100 text-stone-950'
                      } backdrop-blur-sm`}
                      aria-label={t('buttons.addToWishlist')}
                    >
                      <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className={`font-medium mb-2 line-clamp-2 group-hover:${
                    theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
                  } transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {config.name}
                  </h3>
                  
                  <p className={`text-sm line-clamp-2 mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {config.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      {config.discountPrice ? (
                        <div className="flex items-center">
                          <span className={`font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            €{config.discountPrice.toFixed(2)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                            €{config.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className={`font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          €{config.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}