'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  Sun, 
  Moon, 
  Home, 
  Monitor, 
  Cpu, 
  User, 
  LogOut,
  Keyboard,
  Wrench,
  Info,
  ChevronRight
} from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  dashboardLink: string
}

export default function EnhancedMobileMenu({ isOpen, onClose, dashboardLink }: MobileMenuProps) {
  const t = useTranslations()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()

  const locale = pathname.split('/')[1]

  if (!isOpen) return null

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <LanguageSwitcher />
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <nav className="space-y-6">
          <Link 
            href={`/${locale}`}
            className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            onClick={onClose}
          >
            <Home size={20} className="mr-3" />
            {t('nav.home')}
          </Link>

          {/* PC Options Group */}
          <div className="space-y-2 pl-8 border-l-2 border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">PCs</h3>
            
            <Link 
              href={`/${locale}/configurator`}
              className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
              onClick={onClose}
            >
              <Cpu size={20} className="mr-3" />
              {t('nav.configurator')}
            </Link>

            <Link 
              href={`/${locale}/shop/ready-made`}
              className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
              onClick={onClose}
            >
              <Monitor size={20} className="mr-3" />
              {t('nav.readyMade')}
            </Link>
          </div>

          {/* New navigation links */}
          <Link 
            href={`/${locale}/components`}
            className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            onClick={onClose}
          >
            <Cpu size={20} className="mr-3" />
            Components
          </Link>
          
          <Link 
            href={`/${locale}/peripherals`}
            className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            onClick={onClose}
          >
            <Keyboard size={20} className="mr-3" />
            Peripherals
          </Link>
          
          <Link 
            href={`/${locale}/repairs`}
            className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            onClick={onClose}
          >
            <Wrench size={20} className="mr-3" />
            Repairs
          </Link>
          
          <Link 
            href={`/${locale}/about`}
            className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            onClick={onClose}
          >
            <Info size={20} className="mr-3" />
            About Us
          </Link>

          {isAuthenticated ? (
            <>
              <Link 
                href={dashboardLink}
                className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                onClick={onClose}
              >
                <User size={20} className="mr-3" />
                {t('nav.dashboard')}
              </Link>

              <button 
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
              >
                <LogOut size={20} className="mr-3" />
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <div className="pt-4 space-y-4">
              <Link 
                href={`/${locale}/auth/login`}
                className="block w-full py-3 text-center text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={onClose}
              >
                {t('nav.login')}
              </Link>
              
              <Link 
                href={`/${locale}/auth/register`}
                className="block w-full py-3 text-center text-white bg-red-600 rounded-md hover:bg-red-700"
                onClick={onClose}
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}