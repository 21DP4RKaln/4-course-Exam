'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface WishlistItem {
  id: string
  productId: string
  productType: 'COMPONENT' | 'CONFIGURATION' | 'PERIPHERAL'
  name: string
  price: number
  imageUrl: string | null
  createdAt: string
}

interface WishlistContextType {
  items: WishlistItem[]
  isInWishlist: (productId: string, productType: string) => boolean
  addToWishlist: (productId: string, productType: string) => Promise<void>
  removeFromWishlist: (productId: string, productType: string) => Promise<void>
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    } else {
      setItems([])
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const isInWishlist = (productId: string, productType: string) => {
    return items.some(item => item.productId === productId && item.productType === productType)
  }

  const addToWishlist = async (productId: string, productType: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, productType }),
      })

      if (response.ok) {
        await fetchWishlist()
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    }
  }

  const removeFromWishlist = async (productId: string, productType: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, productType }),
      })

      if (response.ok) {
        await fetchWishlist()
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const value = {
    items,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    loading,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}