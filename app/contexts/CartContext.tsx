'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type CartItem = {
  id: string
  type: 'component' | 'configuration' | 'product' | 'peripheral'
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'ivaproCart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error)
    } finally {
      setInitialized(true)
    }
  }, [])
 
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, initialized])

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id)
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex].quantity += quantity
        return updatedItems
      } else {
        return [...currentItems, { ...item, quantity }]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems(currentItems =>
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  )

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}