'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

type User = {
  id: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  name?: string
  role: 'USER' | 'ADMIN' | 'SPECIALIST'
  profileImageUrl?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (emailOrPhone: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string, phone?: string, profileImage?: File | null) => Promise<void>
  updateProfile: (userData: Partial<User>, profileImage?: File | null) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const t = useTranslations()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          console.log("Login response data:", userData)
          setUser(userData)
        }
      } catch (error) {
        console.error(t('Error.Auth_check'), error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const getDashboardLink = () => {
    if (!user) return `/${locale}/dashboard`
    
    switch (user.role) {
      case 'ADMIN':
        return `/${locale}/admin`
      case 'SPECIALIST':
        return `/${locale}/specialist`
      default:
        return `/${locale}/dashboard`
    }
  }

  const login = async (emailOrPhone: string, password: string) => {
    setLoading(true)
    try {
      const isEmail = emailOrPhone.includes('@')
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: isEmail ? emailOrPhone : undefined,
          phone: !isEmail ? emailOrPhone : undefined,
          password 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || t('Error.Log_fail'))
      }

      const userData = await response.json()
      setUser(userData)
  
      const redirectPath = getDashboardLink()
      router.push(redirectPath)
    } catch (error) {
      console.error(t('Error.Log_Err'), error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name?: string, phone?: string, profileImage?: File | null) => {
    setLoading(true)
    try {
      let firstName, lastName
      if (name) {
        const nameParts = name.trim().split(' ')
        firstName = nameParts[0]
        lastName = nameParts.slice(1).join(' ')
      }

      const formData = new FormData()
      formData.append('email', email || '')
      formData.append('password', password)
      if (firstName) formData.append('firstName', firstName)
      if (lastName) formData.append('lastName', lastName)
      if (phone) formData.append('phone', phone)
      if (profileImage) formData.append('profileImage', profileImage)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || t('Error.Reg_fail'))
      }

      const userData = await response.json()
      setUser(userData)

      router.push(`/${locale}/dashboard`)
    } catch (error) {
      console.error(t('Error.Reg_Err'), error)
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  const updateProfile = async (userData: Partial<User>, profileImage?: File | null) => {
    setLoading(true)
    try {
      const formData = new FormData()

      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value))
        }
      })

      if (profileImage) {
        formData.append('profileImage', profileImage)
      }
      
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Profile update failed')
      }

      const updatedUserData = await response.json()
      setUser(updatedUserData)
      return updatedUserData
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      setUser(null)
      router.push(`/${locale}`)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}