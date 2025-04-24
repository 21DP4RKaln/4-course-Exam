'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, Phone, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export default function LoginPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const { login, loading } = useAuth()
  const locale = pathname.split('/')[1]
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  
  // Create dynamic schema based on login method
  const loginSchema = z.object({
    emailOrPhone: loginMethod === 'email' 
      ? z.string().email('Invalid email address')
      : z.string().min(6, 'Phone number must be at least 6 characters'),
    password: z.string().min(1, 'Password is required'),
  })

  type LoginFormData = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: ''
    }
  })

  // Reset form when login method changes
  useEffect(() => {
    reset({
      emailOrPhone: '',
      password: ''
    })
  }, [loginMethod, reset])

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data.emailOrPhone, data.password)
      
      // The router.push will happen in the auth context after successful login
    } catch (error: any) {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {t('auth.loginTitle')}
        </h1>

        {/* Login Method Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Login using:
          </p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email')
                reset({ emailOrPhone: '', password: '' })
              }}
              className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                loginMethod === 'email'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Mail size={18} className="mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('phone')
                reset({ emailOrPhone: '', password: '' })
              }}
              className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                loginMethod === 'phone'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Phone size={18} className="mr-2" />
              Phone
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm flex items-start">
            <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {loginMethod === 'email' ? t('auth.email') : 'Phone Number'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {loginMethod === 'email' ? (
                  <Mail size={18} className="text-gray-400" />
                ) : (
                  <Phone size={18} className="text-gray-400" />
                )}
              </div>
              <input
                id="emailOrPhone"
                type={loginMethod === 'email' ? 'email' : 'tel'}
                {...register('emailOrPhone')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={loginMethod === 'email' ? "john@example.com" : "+371 12345678"}
              />
            </div>
            {errors.emailOrPhone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.emailOrPhone.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.password')}
              </label>
              <Link href={`/${locale}/auth/forgot-password`} className="text-sm text-red-600 dark:text-red-400 hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Processing...</span>
              </div>
            ) : (
              t('auth.signIn')
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.noAccount')}{' '}
            <Link href={`/${locale}/auth/register`} className="text-red-600 dark:text-red-400 hover:underline">
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}