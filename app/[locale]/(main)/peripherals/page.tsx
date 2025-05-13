'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'
import { AlertTriangle, ArrowLeft, Keyboard, Monitor, Headphones, Mouse, Gamepad, Printer, Speaker, Webcam } from 'lucide-react'
import AnimatedButton from '@/app/components/ui/animated-button'

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  componentCount: number;
}

export default function PeripheralsPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/components?type=peripherals')
        if (!response.ok) throw new Error('Failed to fetch peripheral categories')
        
        const data = await response.json()
        
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories)
        } else {
          throw new Error('Invalid response data')
        }

        if (data.featuredProducts && Array.isArray(data.featuredProducts)) {
          setFeaturedProducts(data.featuredProducts)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setError('Failed to load peripheral categories. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  const getCategoryIcon = (slug: string) => {
    const icons = {
      'keyboards': <Keyboard size={30} className="text-red-500" />,
      'mice': <Mouse size={30} className="text-blue-500" />,
      'monitors': <Monitor size={30} className="text-purple-500" />,
      'headphones': <Headphones size={30} className="text-green-500" />,
      'speakers': <Speaker size={30} className="text-indigo-500" />,
      'gaming': <Gamepad size={30} className="text-yellow-500" />,
      'webcams': <Webcam size={30} className="text-red-500" />,
      'printers': <Printer size={30} className="text-cyan-500" />
    }
    
    return icons[slug as keyof typeof icons] || <Keyboard size={30} className="text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto text-center py-16">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error}
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-start">
        <AnimatedButton
          href={`/${locale}`}
          title={t('common.backToHome')}
          direction="left"
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('peripherals.title')}
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        {t('peripherals.description')}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <Link
            key={category.id}
            href={`/${locale}/peripherals/${category.slug}`}
            className="bg-white dark:bg-stone-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="mb-4">
                {getCategoryIcon(category.slug)}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {category.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {category.description || `Browse our selection of ${category.name.toLowerCase()}`}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('peripherals.productsAvailable', { count: category.componentCount })}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-12 bg-gradient-to-r from-gray-900 to-stone-950 dark:from-red-900/30 dark:to-gray-900 rounded-lg border border-gray-700 dark:border-gray-800 shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('peripherals.buildingNewPc')}
        </h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          {t('peripherals.buildingDesc')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${locale}/components`}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 border border-red-500"
          >
            <Keyboard size={18} className="inline-block mr-2" />
            {t('peripherals.browseComponents')}
          </Link>
          <Link
            href={`/${locale}/configurator`}
            className="px-6 py-3 bg-white text-gray-900 rounded-md hover:bg-gray-100 border border-gray-300"
          >
            <Monitor size={18} className="inline-block mr-2" />
            {t('peripherals.configurePc')}
          </Link>
        </div>
      </div>
    </div>
  )
}