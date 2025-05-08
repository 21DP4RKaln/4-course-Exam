'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Moon, Sun, Bell, Search } from 'lucide-react'

export function StaffHeader() {
  const t = useTranslations()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  // Extract page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split('/')
    const lastSegment = segments[segments.length - 1]
    
    if (lastSegment === 'admin' || lastSegment === 'specialist') {
      return t('staff.dashboard')
    }
    
    // Try to get translation for the page
    const translationKey = `staff.${lastSegment}`
    return t(translationKey) || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-red-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Profile */}
        <div className="flex items-center border-l border-gray-200 dark:border-gray-700 pl-4">
          <div className="mr-3 text-right">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.firstName || user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary dark:bg-red-500 flex items-center justify-center text-white font-semibold">
            {user?.firstName?.[0] || user?.name?.[0] || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}