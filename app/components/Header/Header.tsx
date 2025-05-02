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
  Keyboard,
  Info
} from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'

export default function Header() {
  const t = useTranslations()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Dropdown states
  const [pcDropdownOpen, setPcDropdownOpen] = useState(false)
  const pcDropdownRef = useRef<HTMLDivElement>(null)
 
  const locale = pathname.split('/')[1]

  // Handle scroll effect for glass header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-dark-background/80 backdrop-blur-md shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className={`text-xl font-bold transition-colors ${
              theme === 'dark' 
                ? 'text-white' 
                : isScrolled ? 'text-brand-blue-600' : 'text-brand-blue-600'
            }`}>
              {t('common.appName')}
            </span>
          </Link>

          {/* Main navigation (hidden on mobile) */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* PC Options Dropdown */}
            <div className="relative" ref={pcDropdownRef}>
              <button
                className={`flex items-center space-x-1 font-medium ${
                  isScrolled || theme !== 'dark'
                    ? 'text-gray-800 dark:text-gray-200' 
                    : 'text-white'
                } hover:text-brand-red-500 dark:hover:text-brand-red-400 transition-colors`}
                onClick={() => setPcDropdownOpen(!pcDropdownOpen)}
                aria-expanded={pcDropdownOpen}
              >
                <span>PCs</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${pcDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {pcDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-dark-card rounded-xl shadow-medium dark:shadow-hard overflow-hidden z-50 border border-gray-100 dark:border-gray-800">
                  <div className="py-1">
                    <Link
                      href={`/${locale}/configurator`}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setPcDropdownOpen(false)}
                    >
                      <Cpu size={18} className={`mr-3 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                      {t('nav.configurator')}
                    </Link>
                    <Link
                      href={`/${locale}/shop/ready-made`}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setPcDropdownOpen(false)}
                    >
                      <Monitor size={18} className={`mr-3 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                      {t('nav.readyMade')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* New navigation links */}
            <Link 
              href={`/${locale}/components`}
              className={`font-medium ${
                isScrolled || theme !== 'dark' 
                  ? 'text-gray-800 dark:text-gray-200' 
                  : 'text-white'
              } hover:text-brand-red-500 dark:hover:text-brand-red-400 transition-colors ${
                pathname.includes('/components') ? 'text-brand-red-500 dark:text-brand-red-400' : ''
              }`}
            >
              {t('nav.components')}
            </Link>
            
            <Link 
              href={`/${locale}/peripherals`}
              className={`font-medium ${
                isScrolled || theme !== 'dark' 
                  ? 'text-gray-800 dark:text-gray-200' 
                  : 'text-white'
              } hover:text-brand-red-500 dark:hover:text-brand-red-400 transition-colors ${
                pathname.includes('/peripherals') ? 'text-brand-red-500 dark:text-brand-red-400' : ''
              }`}
            >
              {t('nav.peripherals')}
            </Link>
            
            <Link 
              href={`/${locale}/repairs`}
              className={`font-medium ${
                isScrolled || theme !== 'dark' 
                  ? 'text-gray-800 dark:text-gray-200' 
                  : 'text-white'
              } hover:text-brand-red-500 dark:hover:text-brand-red-400 transition-colors ${
                pathname.includes('/repairs') ? 'text-brand-red-500 dark:text-brand-red-400' : ''
              }`}
            >
              Repairs
            </Link>
            
            <Link 
              href={`/${locale}/about`}
              className={`font-medium ${
                isScrolled || theme !== 'dark' 
                  ? 'text-gray-800 dark:text-gray-200' 
                  : 'text-white'
              } hover:text-brand-red-500 dark:hover:text-brand-red-400 transition-colors ${
                pathname.includes('/about') ? 'text-brand-red-500 dark:text-brand-red-400' : ''
              }`}
            >
              {t('nav.about')}
            </Link>
          </nav>

          {/* Controls and buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <LanguageSwitcher />
            
            {/* Theme toggle */}
            <button 
              onClick={toggleTheme}
              className={`rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                isScrolled || theme !== 'dark'
                  ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800' 
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart */}
            <Link 
              href={`/${locale}/cart`}
              className={`relative rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                isScrolled || theme !== 'dark'
                  ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full text-white ${
                  theme === 'dark' ? 'bg-brand-red-600' : 'bg-brand-blue-600'
                }`}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="relative flex items-center space-x-4">
                <Link 
                  href={getDashboardLink()}
                  className={`flex items-center space-x-2 ${
                    isScrolled || theme !== 'dark'
                      ? 'text-gray-800 dark:text-gray-200' 
                      : 'text-white'
                  } hover:text-brand-red-500 dark:hover:text-brand-red-400 transition-colors`}
                >
                  <User size={18} />
                  <span className="hidden lg:inline text-sm font-medium">{user?.name || user?.email}</span>
                </Link>
                <button 
                  onClick={() => logout()}
                  className={`rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                    isScrolled || theme !== 'dark'
                      ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  aria-label={t('nav.logout')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="space-x-3">
                <Link 
                  href={`/${locale}/auth/login`}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-white hover:bg-white/10 border border-white/20' 
                      : 'text-brand-blue-600 hover:bg-brand-blue-50 border border-brand-blue-200'
                  }`}
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  href={`/${locale}/auth/register`}
                  className={`px-4 py-2 text-sm font-medium rounded-lg text-white ${
                    theme === 'dark' 
                      ? 'bg-brand-red-600 hover:bg-brand-red-700' 
                      : 'bg-brand-blue-600 hover:bg-brand-blue-700'
                  }`}
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
              <ShoppingCart size={20} className={`${
                isScrolled || theme !== 'dark' ? 'text-gray-800 dark:text-gray-200' : 'text-white'
              }`} />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded-full ${
                  theme === 'dark' ? 'bg-brand-red-600' : 'bg-brand-blue-600'
                }`}>
                  {totalItems}
                </span>
              )}
            </Link>
            
            <button
              className={`p-2 ${
                isScrolled || theme !== 'dark' ? 'text-gray-800 dark:text-gray-200' : 'text-white'
              }`}
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