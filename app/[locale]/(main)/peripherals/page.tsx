'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'
import { AlertTriangle, ArrowLeft, Keyboard, Monitor, Headphones, Mouse, Gamepad, Printer, Speaker, Webcam } from 'lucide-react'
import AnimatedButton from '@/app/components/ui/animated-button'
import { motion, useInView } from 'framer-motion'

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
  
  const ctaRef = useRef(null)
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const bannerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/peripherals')
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
      'keyboard': <Keyboard size={30} className="text-red-500" />,
      'mouse': <Mouse size={30} className="text-blue-500" />,
      'monitor': <Monitor size={30} className="text-purple-500" />,
      'headphones': <Headphones size={30} className="text-green-500" />,
      'speakers': <Speaker size={30} className="text-indigo-500" />,
      'gamepad': <Gamepad size={30} className="text-yellow-500" />,
      'camera': <Webcam size={30} className="text-red-500" />,
      'keyboards': <Keyboard size={30} className="text-red-500" />,
      'mice': <Mouse size={30} className="text-blue-500" />,
      'monitors': <Monitor size={30} className="text-purple-500" />,
      'webcams': <Webcam size={30} className="text-red-500" />,
      'printers': <Printer size={30} className="text-cyan-500" />
    }
    
    return icons[slug as keyof typeof icons] || <Keyboard size={30} className="text-neutral-500" />
  }

  if (loading) {
    return <FullPageLoading />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatedButton
          href={`/${locale}/`}
          title={t('categoryPage.backToHome')}
          direction="left"
          className="mb-6 inline-block"
        />
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
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
    <motion.div
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="mb-6 flex justify-start">
        <AnimatedButton
          href={`/${locale}`}
          title={t('common.backToHome')}
          direction="left"
          className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        />
      </div>
      
      <motion.h1 
        variants={itemVariants}
        className="text-3xl font-bold text-neutral-900 dark:text-white mb-6"
      >
        {t('peripherals.title')}
      </motion.h1>
      
      <motion.p 
        variants={itemVariants}
        className="text-lg text-neutral-600 dark:text-neutral-400 mb-8"
      >
        {t('peripherals.description')}
      </motion.p>
      
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {categories.map(category => (
          <motion.div key={category.id} variants={itemVariants}>
            <Link
              href={`/${locale}/peripherals/${category.slug}`}
              className="block bg-white dark:bg-stone-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="mb-4">
                  {getCategoryIcon(category.slug)}
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  {(() => {
                    try {
                      return t(`categories.${category.slug}`) || category.name
                    } catch (e) {
                      return category.name
                    }
                  })()}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                  {(() => {
                    try {
                      return t(`peripheralDescriptions.${category.slug}`)
                    } catch (e) {
                      return category.description || `Browse our selection of ${category.name.toLowerCase()}`
                    }
                  })()}
                </p>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t('peripherals.productsAvailable', { count: category.componentCount })}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
        {/* CTA section */}  <div className="mt-12 bg-gradient-to-r from-blue-800 to-blue-950 dark:from-red-900/30 dark:to-neutral-900 rounded-lg border border-blue-700 dark:border-neutral-800 shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('peripherals.buildingNewPc')}
        </h2>
        <p className="text-neutral-300 mb-6 max-w-2xl mx-auto">
          {t('peripherals.buildingDesc')}
        </p>        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${locale}/components`}
            className="px-6 py-3 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 border border-blue-500 dark:border-red-500"
          >
            <Keyboard size={18} className="inline-block mr-2" />
            {t('peripherals.browseComponents')}
          </Link>
          <Link
            href={`/${locale}/configurator`}
            className="px-6 py-3 bg-white text-neutral-900 rounded-md hover:bg-neutral-100 border border-neutral-300"
          >
            <Monitor size={18} className="inline-block mr-2" />
            {t('peripherals.configurePc')}
          </Link>
        </div>
      </div>
    </motion.div>
  )
}