'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { locales } from '@/app/i18n/config'
import { ChevronDown } from 'lucide-react'

const languageNames: Record<string, string> = {
  en: 'EN',
  lv: 'LV',
  ru: 'RU',
}

export default function LanguageSwitcher() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
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
        className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{languageNames[currentLocale]}</span>
        <ChevronDown size={16} className="ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50">
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                className={`w-full text-left px-4 py-2 text-sm ${
                  locale === currentLocale
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => changeLocale(locale)}
              >
                {languageNames[locale]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}