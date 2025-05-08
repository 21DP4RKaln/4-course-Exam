'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { locales } from '@/app/i18n/config'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Globe, ChevronDown, Check } from 'lucide-react'

const languageNames: Record<string, string> = {
  en: 'English',
  lv: 'Latviski',
  ru: 'Русский',
}

const languageCodes: Record<string, string> = {
  en: 'EN',
  lv: 'LV',
  ru: 'RU',
}

export default function LanguageSwitcher() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLocale = pathname.split('/')[1]

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])
 
  const changeLocale = (locale: string) => {
    const pathSegments = pathname.split('/')
    pathSegments[1] = locale
    const newPath = pathSegments.join('/')
   
    router.push(newPath)
    router.refresh() 
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center space-x-1 rounded-full p-2 transition-colors ${
          pathname.includes('/about') || theme !== 'dark'
            ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800' 
            : 'text-white hover:bg-white/10'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Globe size={18} />
        <span className="ml-1 text-sm font-medium flex items-center">
          {languageCodes[currentLocale]}
        </span>
        <ChevronDown size={14} className={`ml-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-dark-card rounded-xl shadow-soft dark:shadow-medium overflow-hidden z-50 border border-gray-100 dark:border-gray-800">
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  locale === currentLocale
                    ? `${theme === 'dark' 
                        ? 'bg-brand-red-50/10 text-brand-red-500' 
                        : 'bg-brand-blue-50 text-brand-blue-600'}`
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => changeLocale(locale)}
              >
                <span className="flex-1 text-left">{languageNames[locale]}</span>
                {locale === currentLocale && (
                  <Check size={16} className={`${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-600'}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}