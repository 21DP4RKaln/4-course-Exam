'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/app/contexts/ThemeContext'
import { useCart } from '@/app/contexts/CartContext'
import { ShoppingCart, Star, ChevronDown, ChevronUp, PlusCircle, Heart, Tag } from 'lucide-react'

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
  const { theme } = useTheme()
  const [showSpecs, setShowSpecs] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCart()

  const getProductLink = () => {
    if (linkPrefix) {
      return `${linkPrefix}/${id}`
    }
    
    if (type === 'configuration') {
      return `/${locale}/shop/product/${id}`
    } else if (type === 'component') {
      return `/${locale}/components/${category.toLowerCase()}/${id}`
    } else if (type === 'peripheral') {
      return `/${locale}/peripherals/${category.toLowerCase()}/${id}`
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
      href={getProductLink()}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-dark-card border border-gray-800 hover:border-brand-red-800'
          : 'bg-white border border-gray-100 hover:border-brand-blue-200'
      } shadow-soft hover:shadow-medium`}
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
            New
          </span>
        )}
        
        {discountPercentage && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' 
              ? 'bg-brand-red-900/40 text-brand-red-400 border border-brand-red-800' 
              : 'bg-brand-red-50 text-brand-red-700 border border-brand-red-100'
          }`}>
            <Tag size={12} className="mr-1" />
            {discountPercentage}% Off
          </span>
        )}
        
        {isFeatured && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' 
              ? 'bg-amber-900/40 text-amber-400 border border-amber-800' 
              : 'bg-amber-50 text-amber-700 border border-amber-100'
          }`}>
            Featured
          </span>
        )}
      </div>
      
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name}
            width={300}
            height={300}
            className={`w-full h-full object-contain transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {category}
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
            {category}
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
          }`}>
            {stock <= 0 ? 'Out of stock' : 
            stock <= 3 ? `Only ${stock} left` : 'In Stock'}
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
                ? 'bg-brand-red-600 hover:bg-brand-red-700 text-white disabled:bg-gray-700'
                : 'bg-brand-blue-600 hover:bg-brand-blue-700 text-white disabled:bg-gray-300'
            } disabled:cursor-not-allowed`}
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
        {/* Rating display - only show if showRating is true */}
        {showRating && rating > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  size={14} 
                  className={i < Math.floor(rating) 
                    ? (theme === 'dark' ? "text-amber-400 fill-amber-400" : "text-amber-500 fill-amber-500")
                    : "text-gray-300 dark:text-gray-600"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({ratingCount})
            </span>
          </div>
        )}
        
        {/* Title */}
        <h3 className={`font-medium mb-1 line-clamp-2 group-hover:${
          theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
        } transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {name}
        </h3>
        
        {/* Specs button */}
        {Object.keys(specs).length > 0 && (
          <button
            onClick={toggleSpecs}
            className={`text-sm mb-2 flex items-center ${
              theme === 'dark' ? 'text-brand-red-400 hover:text-brand-red-300' : 'text-brand-blue-600 hover:text-brand-blue-500'
            }`}
          >
            {showSpecs ? (
              <>Hide Specs <ChevronUp size={14} className="ml-1" /></>
            ) : (
              <>Specs <ChevronDown size={14} className="ml-1" /></>
            )}
          </button>
        )}
        
        {/* Expandable specs section */}
        {showSpecs && Object.keys(specs).length > 0 && (
          <div className={`p-3 rounded-lg mb-3 text-xs space-y-1 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            {/* Group important specs first */}
            {['brand', 'manufacturer', 'model'].some(key => specs[key]) && (
              <div className={`flex items-start ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <span className="font-medium mr-1 capitalize">Brand:</span> 
                <span className="truncate">{specs['brand'] || specs['manufacturer'] || specs['model']}</span>
              </div>
            )}
            
            {/* Show important specs based on product type */}
            {type === 'component' && category?.toLowerCase().includes('cpu') && specs['cores'] && (
              <div className={`flex items-start ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <span className="font-medium mr-1 capitalize">Cores:</span> 
                <span className="truncate">{specs['cores']}</span>
              </div>
            )}
            
            {type === 'peripheral' && category?.toLowerCase().includes('mice') && specs['sensor'] && (
              <div className={`flex items-start ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <span className="font-medium mr-1 capitalize">Sensor:</span> 
                <span className="truncate">{specs['sensor']}</span>
              </div>
            )}
            
            {/* Show a few more important specs */}
            {Object.entries(specs)
              .filter(([key]) => !['brand', 'manufacturer', 'model'].includes(key))
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className={`flex items-start ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span className="font-medium mr-1 capitalize">{key}:</span> 
                  <span className="truncate">{value}</span>
                </div>
              ))}
          </div>
        )}
        
        {/* Price section */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {discountPrice ? (
              <div className="flex items-center">
                <span className={`font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  €{discountPrice.toFixed(2)}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                  €{price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className={`font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                €{(price || 0).toFixed(2)}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark'
                ? 'bg-brand-red-600 hover:bg-brand-red-700 text-white disabled:bg-gray-700'
                : 'bg-brand-blue-600 hover:bg-brand-blue-700 text-white disabled:bg-gray-300'
            } disabled:cursor-not-allowed`}
          >
            <PlusCircle size={18} />
          </button>
        </div>
      </div>
    </Link>
  )
}