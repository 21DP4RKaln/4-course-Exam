'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useSession, signIn, signOut } from 'next-auth/react'

type User = {
  id: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  name?: string
  role: 'USER' | 'ADMIN' | 'SPECIALIST'
  profileImageUrl?: string
  shippingAddress?: string
  shippingCity?: string
  shippingPostalCode?: string
  shippingCountry?: string
}

type ProfileUpdateData = Partial<User> & {
  password?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (emailOrPhone: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string, phone?: string, profileImage?: File | null) => Promise<void>
  socialLogin: (provider: 'google' | 'apple' | 'linkedin') => Promise<void>
  updateProfile: (userData: ProfileUpdateData, profileImage?: File | null, deleteProfileImage?: boolean) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const t = useTranslations()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = pathname?.split('/')[1] || 'en'
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      if (!mounted) return

      try {       
        if (session?.user) {
          if (!mounted) return
          
          const userData: User = {
            id: (session.user as any).id || session.user.email || 'unknown',
            email: session.user.email || undefined,
            name: session.user.name || undefined,
            firstName: session.user.name?.split(' ')[0] || undefined,
            lastName: session.user.name?.split(' ').slice(1).join(' ') || undefined,
            role: ((session.user as any).role || 'USER') as 'USER' | 'ADMIN' | 'SPECIALIST',
            profileImageUrl: session.user.image || undefined,
          }
          
          setUser(userData)
          setLoading(false)
          setInitialCheckDone(true)
          return
        }

        const response = await fetch('/api/auth/me')
        if (!mounted) return

        if (response.ok) {
          const userData = await response.json()
          if (!mounted) return
          
          setUser(userData)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialCheckDone(true)
        }
      }
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [session, status])

  useEffect(() => {
    if (!initialCheckDone || loading) return

    const isAdminRoute = pathname?.startsWith(`/${locale}/admin`)
    const isSpecialistRoute = pathname?.startsWith(`/${locale}/specialist`)

    if (isAdminRoute || isSpecialistRoute) {
      if (!user) {
        router.replace(`/${locale}/auth?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      if (isAdminRoute && user.role !== 'ADMIN') {
        router.replace(`/${locale}/unauthorized`)
        return
      }

      if (isSpecialistRoute && !['ADMIN', 'SPECIALIST'].includes(user.role)) {
        router.replace(`/${locale}/unauthorized`)
        return
      }
    }
  }, [pathname, locale, router, user, loading, initialCheckDone])

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return `/${locale}/admin`
      case 'SPECIALIST':
        return `/${locale}/specialist`
      default:
        return `/${locale}/dashboard`
    }
  }

  const login = async (identifier: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: identifier.includes('@') ? identifier : undefined,
          phone: !identifier.includes('@') ? identifier : undefined,
          password 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Login failed')
      }

      const userData = await response.json()
      setUser(userData)
      
      const redirect = searchParams.get('redirect')
      
      if (userData.role === 'ADMIN') {
        router.push(`/${locale}/admin`)
      } else if (userData.role === 'SPECIALIST') {
        router.push(`/${locale}/specialist`)
      } else {
        if (redirect) {
          router.push(`/${locale}/${redirect}`)
        } else {
          router.push(`/${locale}/dashboard`)
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
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
        throw new Error(error.error?.message || 'Registration failed')
      }

      const userData = await response.json()
      setUser(userData)      
      router.push(`/${locale}/dashboard`)
    } catch (error: any) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const socialLogin = async (provider: 'google' | 'apple' | 'linkedin') => {
    try {
      setLoading(true)
      const result = await signIn(provider, {
        callbackUrl: `/${locale}/dashboard`,
        redirect: false,
      })
      
      if (result?.error) {
        throw new Error(`${provider} authentication failed`)
      }
      
    } catch (error: any) {
      console.error('Social login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }
    const updateProfile = async (userData: ProfileUpdateData, profileImage?: File | null, deleteProfileImage?: boolean) => {
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
      
      if (deleteProfileImage) {
        formData.append('deleteProfileImage', 'true')
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
      await signOut({ redirect: false })
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
    socialLogin,
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