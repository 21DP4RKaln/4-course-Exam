'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { ShoppingCart, Heart, Share2, Check, Copy } from 'lucide-react'

interface ProductActionsProps {
  productId: string
  productType: string
  price: number
  discountPrice?: number | null
  stock: number
  onAddToCart: () => void
}

export default function ProductActions({
  productId,
  productType,
  price,
  discountPrice,
  stock,
  onAddToCart
}: ProductActionsProps) {
  const t = useTranslations('product')
  const tShare = useTranslations('nav')
  const { isAuthenticated } = useAuth()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [isSharing, setIsSharing] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  const inWishlist = isInWishlist(productId, productType)

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) return

    if (inWishlist) {
      await removeFromWishlist(productId, productType)
    } else {
      await addToWishlist(productId, productType)
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const url = window.location.href
      
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: t('shareText'),
          url: url
        })
      } else {
        await navigator.clipboard.writeText(url)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline mb-4">
        {discountPrice ? (
          <>
            <span className="product-price-display">
              €{discountPrice.toFixed(2)}
            </span>
            <span className="product-price-original">
              €{price.toFixed(2)}
            </span>
            <span className="product-discount-badge">
              {t('saveAmount', { amount: (price - (discountPrice || 0)).toFixed(2) })}
            </span>
          </>
        ) : (
          <span className="product-price-display">
            €{price.toFixed(2)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onAddToCart}
          disabled={stock === 0}
          className="btn btn-primary"
        >
          <ShoppingCart size={18} className="mr-2" />
          {stock === 0 ? t('outOfStock') : t('addToCart')}
        </button>
        
        <button
          onClick={handleWishlistToggle}
          disabled={!isAuthenticated}
          className={`wishlist-button ${
            inWishlist ? 'wishlist-button-active' : 'wishlist-button-inactive'
          }`}
        >
          <Heart 
            size={18} 
            className={`mr-2 ${inWishlist ? 'fill-current' : ''}`} 
          />
          {inWishlist ? t('removeFromWishlist') : t('addToWishlist')}
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={handleShare}
          disabled={isSharing}
          className={`action-button ${
            shareSuccess ? 'text-green-600 dark:text-green-400' : ''
          }`}
        >
          {shareSuccess ? (
            <>
              <Check size={18} className="mr-1" />
              <span className="text-sm">{t('urlCopied')}</span>
            </>
          ) : (
            <>
              <Share2 size={18} className="mr-1" />
              <span className="text-sm">{t('share')}</span>
            </>
          )}
        </button>
        
        {isAuthenticated && (
          <button className="action-button text-xs">
            {t('reportIssue')}
          </button>
        )}
      </div>
    </div>
  )
}