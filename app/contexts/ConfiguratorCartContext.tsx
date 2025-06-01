"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

type CartItem = {
  id: string
  type: string
  name: string
  price: number
  imageUrl?: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  
  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id)
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (item.quantity || 1)
        }
        return updatedItems
      } else {
        return [...prevItems, { ...item, quantity: item.quantity || 1 }]
      }
    })
  }
  
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
  }
  
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    )
  }
  
  const clearCart = () => {
    setItems([])
  }
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)
  
  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  
  return context
}
