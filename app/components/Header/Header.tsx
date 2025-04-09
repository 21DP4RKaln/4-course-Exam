'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useCart } from '@/app/contexts/CartContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Sun, Moon, Menu, X, ShoppingCart, User, LogOut } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'

export default function Header() {
  const t = useTranslations()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
 
  const locale = pathname.split('/')[1]

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {t('common.appName')}
            </span>
          </Link>

          {/* Galvenā navigācija (paslēpta mobilajās ierīcēs) */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href={`/${locale}/configurator`}
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              {t('nav.configurator')}
            </Link>
            <Link 
              href={`/${locale}/shop/ready-made`}
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              {t('nav.readyMade')}
            </Link>
          </nav>

          {/* Vadīklas un pogas */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {/* Tēmas pārslēgšana */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Grozs */}
            <Link 
              href={`/${locale}/cart`}
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Autentifikācija */}
            {isAuthenticated ? (
              <div className="relative flex items-center">
                <Link 
                  href={`/${locale}/dashboard`}
                  className="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  <User size={20} className="mr-1" />
                  <span className="hidden lg:inline">{user?.name || user?.email}</span>
                </Link>
                <button 
                  onClick={() => logout()}
                  className="ml-4 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  aria-label={t('nav.logout')}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link 
                  href={`/${locale}/auth/login`}
                  className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  href={`/${locale}/auth/register`}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobilais izvēlnes pārslēgs */}
          <div className="flex md:hidden items-center space-x-4">
            <Link 
              href={`/${locale}/cart`}
              className="relative p-2"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobilā izvēlne */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}