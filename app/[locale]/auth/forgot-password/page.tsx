'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Mail, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AnimatedButton from '@/app/components/ui/animated-button'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
 
      setIsSubmitted(true)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-stone-950 shadow-md rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Check your email
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We've sent a password reset link to your email address.
            </p>
            <div className="mt-6">
              <AnimatedButton
                href={`/${locale}/auth/login`}
                title="Back to Login"
                direction="left"
                className="inline-block"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <AnimatedButton
          href={`/${locale}/auth/login`}
          title="Back to Login"
          direction="left"
          className="inline-block"
        />
      </div>

      <div className="bg-white dark:bg-stone-950 shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Reset your password
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-stone-950`}
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Mail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoading ? 'cursor-wait' : ''
              }`}
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}