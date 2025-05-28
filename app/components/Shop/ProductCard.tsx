'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { useCart } from '@/app/contexts/CartContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { ShoppingCart, Star, ChevronDown, ChevronUp, Heart, Tag, Info } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  price: number
  discountPrice?: number | null
  imageUrl?: string | null
  category: string
  type: 'configuration' | 'component' | 'peripheral'
  stock: number
  rating?: number
  ratingCount?: number
  specs?: Record<string, string>
  linkPrefix?: string
  showRating?: boolean
  isNew?: boolean
  isFeatured?: boolean
}

export default function ProductCard({
  id,
  name,
  price,
  discountPrice,
  imageUrl,
  category,
  type,
  stock,
  rating = 0,
  ratingCount = 0,
  specs = {},
  linkPrefix,
  showRating = false,
  isNew = false,
  isFeatured = false
}: ProductCardProps) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const t = useTranslations()
  const { theme } = useTheme()
  const [showSpecs, setShowSpecs] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const router = useRouter()

  const defaultImageUrl = '/images/product-placeholder.svg'

  const isProductInWishlist = isInWishlist(id, type.toUpperCase())

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`)
      return
    }

    if (isProductInWishlist) {
      await removeFromWishlist(id, type.toUpperCase())
    } else {
      await addToWishlist(id, type.toUpperCase())
    }
  }

  const getProductLink = () => {
    if (linkPrefix) {
      return `${linkPrefix}/${id}`
    }
    
    if (type === 'configuration') {
      return `/${locale}/shop/product/${id}`
    } else if (type === 'component') {
      return `/${locale}/components/${category.toLowerCase()}/${id}`
    } else if (type === 'peripheral') {
      return `/${locale}/peripherals/${id}`
    }
     
    return `/${locale}/shop/product/${id}`
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      id,
      type,
      name,
      price: discountPrice || price,
      imageUrl: imageUrl || ''
    })
  }

  const toggleSpecs = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSpecs(!showSpecs)
  }

  const getDiscountPercentage = () => {
    if (!discountPrice || !price) return null
    const discount = Math.round(((price - discountPrice) / price) * 100)
    return discount > 0 ? discount : null
  }

  const discountPercentage = getDiscountPercentage()
  return (
    <Link 
      href={getProductLink()}      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-dark-card border border-stone-950 hover:border-brand-red-800'
          : 'bg-white border border-neutral-100 hover:border-brand-blue-200'
      } shadow-soft hover:shadow-medium flex flex-col h-[500px]`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges (New, Discount, Featured) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
        {isNew && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' 
              ? 'bg-green-900/40 text-green-400 border border-green-800' 
              : 'bg-green-50 text-green-700 border border-green-100'
          }`}>
            {t('shop.product.newBadge')}
          </span>
        )}
        
        {discountPercentage && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' 
              ? 'bg-brand-red-900/40 text-brand-red-400 border border-brand-red-800' 
              : 'bg-brand-blue-50 text-brand-blue-700 border border-brand-blue-100'
          }`}>
            <Tag size={12} className="mr-1" />
            {t('shop.product.offBadge', { percentage: discountPercentage })}
          </span>
        )}
        
        {isFeatured && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' 
              ? 'bg-amber-900/40 text-amber-400 border border-amber-800' 
              : 'bg-amber-50 text-amber-700 border border-amber-100'
          }`}>
            {t('shop.product.featuredBadge')}
          </span>
        )}
      </div>
      
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden">
        <Image 
          src={(imageUrl || defaultImageUrl).trim()} 
          alt={name}
          width={300}
          height={300}
          className={`w-full h-full object-contain transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
        
        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-black/40 text-white border border-stone-950' 
              : 'bg-white/40 text-neutral-900 border border-neutral-200'
          }`}>
            {t(`shop.categories.${category.toLowerCase()}`)}
          </span>
        </div>
        
        {/* Stock indicator */}
        <div className="absolute bottom-3 right-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            stock <= 0 
              ? (theme === 'dark' 
                  ? 'bg-red-900/40 text-red-400 border border-red-800' 
                  : 'bg-red-50 text-red-700 border border-red-100')
              : stock <= 3 
                ? (theme === 'dark' 
                    ? 'bg-amber-900/40 text-amber-400 border border-amber-800' 
                    : 'bg-amber-50 text-amber-700 border border-amber-100')
                : (theme === 'dark' 
                    ? 'bg-green-900/40 text-green-400 border border-green-800' 
                    : 'bg-green-50 text-green-700 border border-green-100')
          }`}>            {stock <= 0 ? t('product.outOfStock') : 
            stock <= 3 ? t('product.onlyLeft', { count: stock }) : t('product.inStock')}
          </span>
        </div>
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } bg-black/30 backdrop-blur-xs`}>
          <button
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`p-3 rounded-full transition-colors ${
              theme === 'dark'
                ? 'bg-brand-red-600 hover:bg-brand-red-700 text-white disabled:bg-neutral-700'
                : 'bg-brand-blue-600 hover:bg-brand-blue-700 text-white disabled:bg-neutral-300'
            } disabled:cursor-not-allowed`}
            aria-label={t('shop.product.addToCart')}
          >
            <ShoppingCart size={18} />
          </button>
          
          <button
            onClick={handleWishlistToggle}
            className={`p-3 rounded-full transition-colors ${
              isProductInWishlist
                ? theme === 'dark'
                  ? 'bg-brand-red-600 text-white hover:bg-brand-red-700'
                  : 'bg-brand-blue-600 text-white hover:bg-brand-blue-700'
                : theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-white hover:bg-neutral-100 text-stone-950'
            } backdrop-blur-sm`}
            aria-label={isProductInWishlist ? t('shop.product.removeFromWishlist') : t('shop.product.addToWishlist')}
          >
            <Heart size={18} fill={isProductInWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>      
      <div className="p-4 flex flex-col flex-grow">
        {/* Rating display */}
        {showRating && rating > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  size={14} 
                  className={i < Math.floor(rating) 
                    ? (theme === 'dark' ? "text-amber-400 fill-amber-400" : "text-amber-500 fill-amber-500")
                    : "text-neutral-300 dark:text-neutral-600"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
              ({ratingCount})
            </span>
          </div>
        )}
        
        {/* Product info section */}
        <div className="flex flex-col h-full">
          {/* Title */}
          <h3 className={`font-semibold mb-2 text-lg line-clamp-2 group-hover:${
            theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
          } transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-neutral-900'
          }`}>
            {name}
          </h3>
          
          {/* Price section */}
          <div className="flex items-center mb-4 mt-auto">
            {discountPrice ? (
              <div className="flex items-center">
                <span className={`font-bold text-xl ${
                  theme === 'dark' ? 'text-white' : 'text-neutral-900'
                }`}>
                  €{discountPrice.toFixed(2)}
                </span>
                <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400 line-through">
                  €{price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className={`font-bold text-xl ${
                theme === 'dark' ? 'text-white' : 'text-neutral-900'
              }`}>
                €{(price || 0).toFixed(2)}
              </span>
            )}
          </div>
            {/* Specs button */}
          {Object.keys(specs).length > 0 && (
            <div className="mt-auto">
              <button
                onClick={toggleSpecs}
                className={`w-full flex items-center justify-center py-2 px-4 rounded-lg transition-all ${
                  theme === 'dark' 
                    ? `${showSpecs ? 'bg-red-600 hover:bg-red-700' : 'bg-stone-950 hover:bg-neutral-700'} text-white border ${showSpecs ? 'border-red-500' : 'border-neutral-700'}` 
                    : `${showSpecs ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-stone-950'} border ${showSpecs ? 'border-blue-500' : 'border-neutral-200'}`
                }`}
              >
                <Info size={16} className="mr-2" />
                {showSpecs ? t('buttons.hideSpecs') : t('buttons.viewSpecs')}
                {showSpecs ? (
                  <ChevronUp size={16} className="ml-2" />
                ) : (
                  <ChevronDown size={16} className="ml-2" />
                )}
              </button>
            </div>
          )}
        </div>
          {/* Expandable specs section */}        {showSpecs && Object.keys(specs).length > 0 && (
          <div className={`mt-3 p-4 rounded-lg mb-1 text-xs space-y-2 overflow-y-auto max-h-[200px] scrollbar-thin ${
            theme === 'dark' ? 'bg-neutral-900 border border-stone-950' : 'bg-neutral-50 border border-neutral-200'
          }`}>
            <div className="grid grid-cols-1 gap-y-2">
              {/* Group important specs first */}
              {['brand', 'manufacturer', 'model'].some(key => specs[key]) && (
                <div className={`flex items-start ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  <span className="font-medium mr-1 min-w-20 capitalize">Brand:</span> 
                  <span className="font-bold">{specs['brand'] || specs['manufacturer'] || specs['model']}</span>
                </div>
              )}
              
              {/* Show important specs based on product type */}
              {Object.entries(specs)
                .filter(([key]) => !['brand', 'manufacturer', 'model'].includes(key.toLowerCase()))
                .map(([key, value]) => (
                  <div key={key} className={`flex items-start ${
                    theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
                  }`}>
                    <span className="font-medium mr-1 min-w-20 capitalize">{key}:</span> 
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}