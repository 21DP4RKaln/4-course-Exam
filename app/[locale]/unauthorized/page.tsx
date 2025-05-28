'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-stone-950 rounded-lg shadow-lg text-center">
        <div className="mb-6 flex justify-center">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          {t('errors.unauthorized.title', { fallback: 'Access Denied' })}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          {t('errors.unauthorized.message', { 
            fallback: 'You do not have permission to access this page.' 
          })}
        </p>
        <div className="space-y-4">
          <button
            onClick={() => router.push(`/${locale}`)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('buttons.backToHome', { fallback: 'Back to Home' })}
          </button>
          <button
            onClick={() => router.push(`/${locale}/auth/login`)}
            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            {t('buttons.login', { fallback: 'Login' })}
          </button>
        </div>
      </div>
    </div>
  )
}