'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCart } from '@/app/contexts/CartContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { ShoppingCart, Heart, ChevronRight, Trophy, Flame, PlusCircle, ArrowRight } from 'lucide-react'

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
  
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

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
      imageUrl: config.imageUrl || ''
    })
  }

  const getDiscountPercentage = (price: number, discountPrice?: number | null) => {
    if (!discountPrice || discountPrice >= price) return null
    return Math.round(((price - discountPrice) / price) * 100)
  }

  if (loading) {
    return (
      <section className={`py-24 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('nav.Popular')}
            </h2>
            <div className={`h-6 w-24 animate-pulse rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`rounded-2xl animate-pulse overflow-hidden ${
                  theme === 'dark' ? 'bg-dark-card' : 'bg-white'
                } shadow-soft`}
              >
                <div className={`h-48 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <div className="p-4 space-y-3">
                  <div className={`h-6 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                  <div className={`h-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                  <div className="flex justify-between items-center">
                    <div className={`h-6 w-20 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    <div className="flex space-x-2">
                      <div className={`h-8 w-8 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                      <div className={`h-8 w-8 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
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
            <span>{t('button.view')}</span>
            <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {configurations.map((config) => {
            const discountPercentage = getDiscountPercentage(config.price, config.discountPrice);
            const isHovered = hoveredItem === config.id;
            
            return (
              <Link 
                key={config.id}
                href={`/${locale}/shop/product/${config.id}`}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-dark-card border border-gray-800 hover:border-brand-red-800'
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
                      Top Pick
                    </span>
                  )}
                  
                  {config.isPopular && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' 
                        ? 'bg-brand-red-900/40 text-brand-red-400 border border-brand-red-800' 
                        : 'bg-brand-red-50 text-brand-red-700 border border-brand-red-100'
                    }`}>
                      <Flame size={12} className="mr-1" />
                      Popular
                    </span>
                  )}
                  
                  {discountPercentage && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' 
                        ? 'bg-green-900/40 text-green-400 border border-green-800' 
                        : 'bg-green-50 text-green-700 border border-green-100'
                    }`}>
                      {discountPercentage}% Off
                    </span>
                  )}
                </div>
                
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  {config.imageUrl ? (
                    <Image 
                      src={config.imageUrl} 
                      alt={config.name}
                      width={300}
                      height={300}
                      className={`w-full h-full object-contain transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <span className={`${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        PC Configuration
                      </span>
                    </div>
                  )}
                  
                  {/* Category badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      theme === 'dark' 
                        ? 'bg-black/40 text-white border border-gray-800' 
                        : 'bg-white/40 text-gray-900 border border-gray-200'
                    }`}>
                      PC Configuration
                    </span>
                  </div>
                  
                  {/* Hover overlay */}
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
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                    
                    <button
                      className={`p-3 rounded-full transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-white hover:bg-gray-100 text-gray-800'
                      } backdrop-blur-sm`}
                      aria-label="Add to wishlist"
                    >
                      <Heart size={18} />
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
                    
                    <button 
                      onClick={(e) => handleAddToCart(config, e)}
                      className={`p-2 rounded-full transition-colors ${
                        theme === 'dark'
                          ? 'bg-brand-red-600 hover:bg-brand-red-700 text-white'
                          : 'bg-brand-blue-600 hover:bg-brand-blue-700 text-white'
                      }`}
                    >
                      <PlusCircle size={18} />
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        
        {/* "Build Your Own" CTA Card */}
        <div className={`mt-16 rounded-2xl overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-dark-card to-black border border-gray-800' 
            : 'bg-gradient-to-r from-white to-gray-50 border border-gray-100'
        } shadow-medium`}>
          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
              theme === 'dark' 
                ? 'bg-brand-red-900/30'
                : 'bg-brand-blue-50'
            }`}>
              <PlusCircle className={`h-8 w-8 ${
                theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
              }`} />
            </div>
            
            <h3 className={`text-2xl font-bold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Build Your Custom PC
            </h3>
            
            <p className={`max-w-2xl mb-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Create a PC that perfectly matches your needs. Choose every component and build the system of your dreams.
            </p>
            
            <Link
              href={`/${locale}/configurator`}
              className={`inline-flex items-center px-6 py-3 rounded-xl text-white font-medium transition-all ${
                theme === 'dark' 
                  ? 'bg-brand-red-600 hover:bg-brand-red-700 shadow hover:shadow-xl hover:shadow-brand-red-600/20' 
                  : 'bg-brand-blue-600 hover:bg-brand-blue-700 shadow hover:shadow-xl hover:shadow-brand-blue-600/20'
              }`}
            >
              Start Building
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}