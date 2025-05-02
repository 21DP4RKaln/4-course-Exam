'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/app/contexts/ThemeContext'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { CartProvider } from '@/app/contexts/CartContext'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}