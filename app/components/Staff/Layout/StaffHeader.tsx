'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import LanguageSwitcher from '@/app/components/Header/LanguageSwitcher'
import { Moon, Sun, Bell, Search } from 'lucide-react'
import Image from 'next/image'

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
    <header className="h-16 bg-white dark:bg-stone-950 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-stone-950 dark:text-white">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-64 pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-red-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Profile */}
        <div className="flex items-center border-l border-neutral-200 dark:border-neutral-700 pl-4">
          <div className="mr-3 text-right">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {user?.firstName || user?.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {user?.role}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primar flex items-center justify-center text-white font-semibold overflow-hidden">
            {user?.profileImageUrl ? (
              <Image
                src={user.profileImageUrl}
                alt={user?.firstName || user?.name || 'User'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user?.firstName?.[0] || user?.name?.[0] || 'U'}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}