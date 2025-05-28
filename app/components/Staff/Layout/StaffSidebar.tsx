'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
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
  BarChart,
  User,
  UserCog,
  Camera
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
    // Account settings - visible to both specialists and admins
    {
      label: t('staff.accountSettings') || 'Account Settings',
      href: `/${locale}/${userRole}/account`,
      icon: UserCog,
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
    <motion.aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-stone-950 border-r border-neutral-200 dark:border-neutral-700 flex flex-col`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo Section */}
      <motion.div 
        className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div 
              key="full-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <LogoWrapper $theme={theme}>
                <Link href={`/${locale}`} className="logo-link">
                  <div className="flex items-center">
                    <div className="logo-container p-1">
                      <Image
                        src={theme === 'dark' ? '/images/logo-dark.png' : '/images/logo-light.png'}
                        alt="IvaPro Logo"
                        width={60}
                        height={28}
                        className="logo-image"
                        priority
                      />
                    </div>
                  </div>
                </Link>
              </LogoWrapper>
            </motion.div>
          ) : (
            <motion.div 
              key="small-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex justify-center"
            >
              <LogoWrapper $theme={theme}>
                <Link href={`/${locale}`} className="logo-link">
                  <div className="flex items-center justify-center">
                    <div className="logo-container relative w-9 h-9 p-1">
                      <Image
                        src={theme === 'dark' ? '/images/logo-dark.png' : '/images/logo-light.png'}
                        alt="IvaPro Logo"
                        width={32}
                        height={32}
                        className="logo-image object-contain"
                        priority
                      />
                    </div>
                  </div>
                </Link>
              </LogoWrapper>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="expand"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="collapse"
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <motion.div 
          className="space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, staggerChildren: 0.05 }}
        >
          {menuItems
            .filter(item => item.show)
            .map((item, index) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                      active
                        ? 'bg-primary dark:bg-red-500 text-white shadow-md'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <motion.div 
                      whileHover={{ scale: active ? 1 : 1.1 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
                    </motion.div>
                    
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              )
            })}
        </motion.div>
      </nav>

      {/* User Section */}
      <motion.div 
        className="border-t border-neutral-200 dark:border-neutral-700 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <AnimatePresence>
            {!isCollapsed && (              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >                <Link href={`/${locale}/${userRole}/account`} title={t('staff.accountSettings') || 'Account Settings'}>                  <motion.div 
                    className="w-8 h-8 rounded-full bg-primar flex items-center justify-center text-white font-semibold overflow-hidden cursor-pointer relative group"
                    whileTap={{ scale: 0.95 }}
                    initial={{ boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }}
                    animate={{ boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)" }}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: theme === 'dark' 
                        ? "0px 0px 8px rgba(220, 38, 38, 0.6)" 
                        : "0px 0px 8px rgba(0, 102, 204, 0.6)" 
                    }}
                  >
                    {user?.profileImageUrl ? (
                      <Image
                        src={user.profileImageUrl}
                        alt={user?.firstName || user?.name || 'User'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user?.firstName?.[0] || user?.name?.[0] || 'U'}</span>
                    )}
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ 
                          scale: [1, 1.2, 1.1],
                          rotate: [0, -5, 5, 0],
                          transition: {
                            duration: 0.5,
                            ease: "easeInOut",
                          }
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 20 
                        }}
                      >
                        <Camera size={16} className="text-white drop-shadow-lg filter brightness-110" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </Link>
                <div className="ml-3">
                  <Link href={`/${locale}/${userRole}/account`} className="group block">
                    <motion.p 
                      className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-primary dark:group-hover:text-red-500 transition-colors duration-200"
                      whileHover={{ y: -1 }}
                    >
                      {user?.firstName || user?.name}
                    </motion.p>
                    <motion.p 
                      className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-200"
                      whileHover={{ y: 1 }}
                    >
                      {user?.role}
                    </motion.p>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            onClick={logout}
            className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={t('auth.logout')}
            whileHover={{ scale: 1.1, color: theme === 'dark' ? '#ef4444' : '#0066CC' }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </motion.div>
    </motion.aside>
  )
}

const LogoWrapper = styled.div<{ $theme: string }>`
  .logo-link {
    display: inline-block;
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    transform-origin: center;
  }

  .logo-link:hover {
    transform: scale(1.05);
  }

  .logo-link:active {
    transform: scale(0.95);
    transition: all 0.1s cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  .logo-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.5s ease;
    overflow: hidden;
  }

  .logo-container::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      transparent, 
      transparent, 
      transparent, 
      ${props => props.$theme === 'dark' ? '#dc2626' : '#0066cc'}
    );
    animation: rotate 4s linear infinite;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .logo-link:hover .logo-container::before {
    opacity: 0.15;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .logo-link:hover .logo-container {
    background-color: ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(0, 102, 204, 0.1)'};
    box-shadow: 0 4px 20px ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(0, 102, 204, 0.3)'};
  }

  .logo-image {
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  }

  .logo-link:hover .logo-image {
    filter: drop-shadow(0 4px 12px ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(0, 102, 204, 0.4)'});
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1); }
  }

  .logo-link:active .logo-image {
    filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.3));
    animation: none;
  }
`;