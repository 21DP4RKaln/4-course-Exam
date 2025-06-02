'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Cpu, Monitor, HardDrive, Zap, Server, Shield, Layers, Fan, Keyboard } from 'lucide-react'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'
import AnimatedButton from '@/app/components/ui/animated-button'
import { motion, useInView } from 'framer-motion'

// Definē kategorijas interfeisu
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  componentCount: number;
}

// Funkcija, kas atgriež atbilstošo ikonu katrai kategorijas slug vērtībai
const getCategoryIcon = (slug: string) => {
  const icons = {
    'cpu': <Cpu size={30} className="text-red-500" />,
    'motherboard': <Server size={30} className="text-blue-500" />,
    'gpu': <Monitor size={30} className="text-purple-500" />,
    'ram': <HardDrive size={30} className="text-green-500" />,
    'storage': <HardDrive size={30} className="text-indigo-500" />,
    'psu': <Zap size={30} className="text-yellow-500" />,
    'case': <Shield size={30} className="text-pink-500" />,
    'cooling': <Fan size={30} className="text-teal-500" />,
    'cooler': <Fan size={30} className="text-teal-500" />,
    'default': <Layers size={30} className="text-neutral-500" />
  }
  return icons[slug as keyof typeof icons] || icons.default
}

export default function ComponentsPage() {
  // Inicializē tulkošanas un navigācijas hooks
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]
  
  // State mainīgie kategoriju, ielādes un kļūdu pārvaldībai
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Ref objekts CTA sekcijas animācijas pārvaldībai
  const ctaRef = useRef(null)
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 })

  // Animāciju konfigurācijas objekti
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 
      }
    }
  }
  
  // Individuālo elementu animācija
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

  // Banner sekcijas animācija ar mērogošanas efektu
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

  // useEffect hook, kas ielādē kategorijas no API, kad komponente tiek palaista
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        // Izpilda API pieprasījumu, lai iegūtu komponenšu kategorijas
        const response = await fetch('/api/components')
        if (!response.ok) throw new Error('Failed to fetch component categories')
        
        const data = await response.json()
        
        // Pārbauda vai atbildē ir derīgi kategoriju dati
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories)
        } else {
          throw new Error('Invalid response data')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setError('Failed to load component categories. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  if (loading) {
    return <FullPageLoading />
  }

  // Rāda kļūdas ziņojumu un atkārtošanas pogu, ja radusies kļūda
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
          {t('common.tryAgain')}
        </button>
      </div>
    )
  }

  // Galvenā komponentes JSX struktūra
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 py-8"
    >      
      {/* Navigācijas poga atgriešanai uz sākumlapu */}
      <div className="mb-6 flex justify-start">
        <AnimatedButton
          href={`/${locale}`}
          title={t('common.backToHome')}
          direction="left"
          className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        />
      </div>
      
      {/* Lapas virsraksts ar animāciju */}
      <motion.h1 
        variants={itemVariants}
        className="text-3xl font-bold text-neutral-900 dark:text-white mb-6"
      >
        {t('components.title')}
      </motion.h1>
      
      {/* Lapas apraksts ar animāciju */}
      <motion.p 
        variants={itemVariants}
        className="text-lg text-neutral-600 dark:text-neutral-400 mb-8"
      >
        {t('components.description')}
      </motion.p>
      
      {/* Kategoriju režģis ar animāciju */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Kartē katru kategoriju uz animētu kartīti */}
        {categories.map(category => (
          <motion.div key={category.id} variants={itemVariants}>
            <Link
              href={`/${locale}/components/${category.slug}`}
              className="block bg-white dark:bg-stone-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Kategorijas ikona */}
                <div className="mb-4">
                  {getCategoryIcon(category.slug)}
                </div>
                {/* Kategorijas nosaukums ar tulkošanas mēģinājumu */}
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  {(() => {
                    try {
                      return t(`categories.${category.slug}`)
                    } catch (e) {
                      return category.name
                    }
                  })()}
                </h2>
                {/* Kategorijas apraksts ar tulkošanas mēģinājumu */}
                <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                  {(() => {
                    try {
                      return t(`categoryDescriptions.${category.slug}`)
                    } catch (e) {
                      return category.description || t('components.description')
                    }
                  })()}
                </p>
                {/* Pieejamo produktu skaita rādītājs */}
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t('components.productsAvailable', { count: category.componentCount })}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      
      {/* CTA (Call-to-Action) sekcija ar gradientu fonu */}
      <div className="mt-12 bg-gradient-to-r from-blue-800 to-blue-950 dark:from-red-900/30 dark:to-neutral-900 rounded-lg border border-blue-700 dark:border-neutral-800 shadow-lg p-8 text-center">
        {/* CTA virsraksts */}
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('peripherals.buildingNewPc')}
        </h2>
        {/* CTA apraksts */}
        <p className="text-neutral-300 mb-6 max-w-2xl mx-auto">
          {t('peripherals.buildingDesc')}
        </p>
        {/* CTA pogas - komponenšu pārlūkošanai un PC konfiguratoram */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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