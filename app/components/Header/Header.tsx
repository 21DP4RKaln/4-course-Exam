'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useCart } from '@/app/contexts/CartContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  LogOut, 
  ChevronDown,
  Monitor,
  Cpu,
  Wrench,
  Keyboard
} from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'

export default function EnhancedHeader() {
  const t = useTranslations()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Dropdown states
  const [pcDropdownOpen, setPcDropdownOpen] = useState(false)
  const pcDropdownRef = useRef<HTMLDivElement>(null)
 
  const locale = pathname.split('/')[1]

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return `/${locale}/dashboard`
    
    switch (user.role) {
      case 'ADMIN':
        return `/${locale}/admin`
      case 'SPECIALIST':
        return `/${locale}/specialist`
      default:
        return `/${locale}/dashboard`
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (pcDropdownRef.current && !pcDropdownRef.current.contains(event.target as Node)) {
        setPcDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-xl font-bold text-red-600 dark:text-red-500">
              {t('common.appName')}
            </span>
          </Link>

          {/* Main navigation (hidden on mobile) */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* PC Options Dropdown */}
            <div className="relative" ref={pcDropdownRef}>
              <button
                className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                onClick={() => setPcDropdownOpen(!pcDropdownOpen)}
                aria-expanded={pcDropdownOpen}
              >
                <span>PCs</span>
                <ChevronDown size={16} className="ml-1" />
              </button>
              
              {pcDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50">
                  <div className="py-1">
                    <Link
                      href={`/${locale}/configurator`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setPcDropdownOpen(false)}
                    >
                      <Cpu size={16} className="inline-block mr-2" />
                      {t('nav.configurator')}
                    </Link>
                    <Link
                      href={`/${locale}/shop/ready-made`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setPcDropdownOpen(false)}
                    >
                      <Monitor size={16} className="inline-block mr-2" />
                      {t('nav.readyMade')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* New navigation links */}
            <Link 
              href={`/${locale}/components`}
              className="text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            >
              <span>Components</span>
            </Link>
            
            <Link 
              href={`/${locale}/peripherals`}
              className="text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            >
              <span>Peripherals</span>
            </Link>
            
            <Link 
              href={`/${locale}/repairs`}
              className="text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            >
              <span>Repairs</span>
            </Link>
            
            <Link 
              href={`/${locale}/about`}
              className="text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            >
              <span>About Us</span>
            </Link>
          </nav>

          {/* Controls and buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {/* Theme toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
              aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart */}
            <Link 
              href={`/${locale}/cart`}
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="relative flex items-center">
                <Link 
                  href={getDashboardLink()}
                  className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                >
                  <User size={20} className="mr-1" />
                  <span className="hidden lg:inline">{user?.name || user?.email}</span>
                </Link>
                <button 
                  onClick={() => logout()}
                  className="ml-4 text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                  aria-label={t('nav.logout')}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link 
                  href={`/${locale}/auth/login`}
                  className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  href={`/${locale}/auth/register`}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-4">
            <Link 
              href={`/${locale}/cart`}
              className="relative p-2"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        dashboardLink={getDashboardLink()}
      />
    </header>
  )
}