'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  LayoutDashboard, 
  Wrench, 
  Settings, 
  Cpu, 
  Monitor, 
  Users, 
  DollarSign, 
  Megaphone, 
  Settings2, 
  Package, 
  Keyboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart
} from 'lucide-react'

export function StaffSidebar() {
  const t = useTranslations()
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isAdmin = user?.role === 'ADMIN'
  const isSpecialist = user?.role === 'SPECIALIST'
  const userRole = user?.role?.toLowerCase()

  const menuItems = [
    {
      label: t('staff.dashboard'),
      href: `/${locale}/${userRole}`,
      icon: LayoutDashboard,
      show: true
    },
    {
      label: t('staff.repairs'),
      href: `/${locale}/${userRole}/repairs`,
      icon: Wrench,
      show: true
    },
    {
      label: t('staff.configurations'),
      href: `/${locale}/${userRole}/configurations`,
      icon: Settings,
      show: true
    },
    {
      label: t('staff.components'),
      href: `/${locale}/${userRole}/components`,
      icon: Cpu,
      show: true
    },
    {
      label: t('staff.peripherals'),
      href: `/${locale}/${userRole}/peripherals`,
      icon: Keyboard,
      show: true
    },
    {
      label: t('staff.readyPCs'),
      href: `/${locale}/${userRole}/ready-made`,
      icon: Monitor,
      show: true
    },
    // Admin-only sections
    {
      label: t('staff.users'),
      href: `/${locale}/admin/users`,
      icon: Users,
      show: isAdmin
    },
    {
      label: t('staff.orders'),
      href: `/${locale}/admin/orders`,
      icon: Package,
      show: isAdmin
    },
    {
      label: t('staff.financial'),
      href: `/${locale}/admin/financial`,
      icon: DollarSign,
      show: isAdmin
    },
    {
      label: t('staff.marketing'),
      href: `/${locale}/admin/marketing`,
      icon: Megaphone,
      show: isAdmin
    },
    {
      label: t('staff.analytics'),
      href: `/${locale}/admin/analytics`,
      icon: BarChart,
      show: isAdmin
    },
    {
      label: t('staff.settings'),
      href: `/${locale}/admin/settings`,
      icon: Settings2,
      show: isAdmin
    }
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-stone-950 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-xl font-bold text-primary dark:text-red-500">
              IvaPro
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {isAdmin ? 'Admin' : 'Specialist'}
            </span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems
          .filter(item => item.show)
          .map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary dark:bg-red-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary dark:bg-red-500 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0] || user?.name?.[0] || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.firstName || user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={t('auth.logout')}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  )
}