'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
  Camera,
} from 'lucide-react';

export function StaffSidebar() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isSpecialist = user?.role === 'SPECIALIST';
  const userRole = user?.role?.toLowerCase();
  const menuItems = [
    {
      label: t('staff.dashboard'),
      href: `/${locale}/${userRole}`,
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: t('staff.repairs'),
      href: `/${locale}/${userRole}/repairs`,
      icon: Wrench,
      show: true,
    },
    {
      label: t('staff.components'),
      href: `/${locale}/${userRole}/components`,
      icon: Cpu,
      show: true,
    },
    {
      label: t('staff.peripherals'),
      href: `/${locale}/${userRole}/peripherals`,
      icon: Keyboard,
      show: true,
    },
    {
      label: t('staff.readyPCs'),
      href: `/${locale}/${userRole}/ready-made`,
      icon: Monitor,
      show: true,
    },
    // Account settings - visible to both specialists and admins
    {
      label: t('staff.accountSettings') || 'Account Settings',
      href: `/${locale}/${userRole}/account`,
      icon: UserCog,
      show: true,
    },
    // Admin-only sections
    {
      label: t('staff.users'),
      href: `/${locale}/admin/users`,
      icon: Users,
      show: isAdmin,
    },
    {
      label: t('staff.orders'),
      href: `/${locale}/admin/orders`,
      icon: Package,
      show: isAdmin,
    },
    {
      label: t('staff.financial'),
      href: `/${locale}/admin/financial`,
      icon: DollarSign,
      show: isAdmin,
    },
    {
      label: t('staff.marketing'),
      href: `/${locale}/admin/marketing`,
      icon: Megaphone,
      show: isAdmin,
    },
    {
      label: t('staff.analytics'),
      href: `/${locale}/admin/analytics`,
      icon: BarChart,
      show: isAdmin,
    },
    {
      label: t('staff.settings'),
      href: `/${locale}/admin/settings`,
      icon: Settings2,
      show: isAdmin,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Add smooth scroll behavior and enhanced transitions
  useEffect(() => {
    const sidebar = document.getElementById('staff-sidebar');
    if (sidebar) {
      sidebar.style.scrollBehavior = 'smooth';
    }
  }, []);

  return (
    <motion.aside
      id="staff-sidebar"
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-stone-950 border-r border-neutral-200 dark:border-neutral-700 flex flex-col shadow-lg backdrop-blur-sm`}
      initial={{ x: -100, opacity: 0, scale: 0.95 }}
      animate={{
        x: 0,
        opacity: 1,
        scale: 1,
        width: isCollapsed ? '5rem' : '16rem',
      }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        width: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      }}
      whileHover={{
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Logo Section */}
      <motion.div
        className="h-16 flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-stone-950"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex-1 min-w-0"
            >
              <LogoWrapper $theme={theme}>
                <Link href={`/${locale}`} className="logo-link">
                  <div className="flex items-center">
                    <div className="logo-container p-2">
                      <Image
                        src={
                          theme === 'dark'
                            ? '/images/logo-dark.png'
                            : '/images/logo-light.png'
                        }
                        alt="IvaPro Logo"
                        width={64}
                        height={30}
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
              initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex-1 flex justify-center"
            >
              <LogoWrapper $theme={theme}>
                <Link href={`/${locale}`} className="logo-link-collapsed">
                  <div className="flex items-center justify-center w-12 h-12">
                    <div className="logo-container-collapsed">
                      <Image
                        src={
                          theme === 'dark'
                            ? '/images/logo-dark.png'
                            : '/images/logo-light.png'
                        }
                        alt="IvaPro Logo"
                        width={28}
                        height={28}
                        className="logo-image-collapsed"
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
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-all duration-200 hover:shadow-md"
          whileHover={{
            scale: 1.1,
            backgroundColor:
              theme === 'dark'
                ? 'rgba(64, 64, 64, 0.8)'
                : 'rgba(245, 245, 245, 0.8)',
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="expand"
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ChevronRight size={18} />
              </motion.div>
            ) : (
              <motion.div
                key="collapse"
                initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ChevronLeft size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3, staggerChildren: 0.1 }}
        >
          {menuItems
            .filter(item => item.show)
            .map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.1 + 0.4,
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                  }}
                  whileHover={{ x: 4 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                      active
                        ? 'bg-gradient-to-r from-primary to-primary/90 dark:from-red-500 dark:to-red-600 text-white shadow-lg shadow-primary/25 dark:shadow-red-500/25'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-gradient-to-r hover:from-neutral-100 hover:to-neutral-50 dark:hover:from-neutral-700 dark:hover:to-neutral-600 hover:shadow-md'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {active && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: 'easeInOut',
                        }}
                      />
                    )}

                    <motion.div
                      className="relative z-10"
                      whileHover={{
                        scale: active ? 1.05 : 1.15,
                        rotate: active ? 0 : 5,
                      }}
                      whileTap={{ scale: 0.9 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <Icon
                        size={20}
                        className={`${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                          active ? 'drop-shadow-sm' : ''
                        }`}
                      />
                    </motion.div>

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, x: -10 }}
                          animate={{ opacity: 1, width: 'auto', x: 0 }}
                          exit={{ opacity: 0, width: 0, x: -10 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="whitespace-nowrap font-medium relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}
        </motion.div>
      </nav>

      {/* User Section */}
      <motion.div
        className="border-t border-neutral-200 dark:border-neutral-700 px-4 py-4 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-stone-950"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
      >
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div
              key="collapsed-user"
              className="flex flex-col items-center space-y-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Collapsed User Avatar */}
              <Link
                href={`/${locale}/${userRole}/account`}
                title={`${user?.firstName || user?.name} - ${t('staff.accountSettings')}`}
                className="group"
              >
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 dark:from-red-500 dark:to-red-600 flex items-center justify-center text-white font-semibold overflow-hidden cursor-pointer relative shadow-lg"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{
                    scale: 1.15,
                    boxShadow:
                      theme === 'dark'
                        ? '0px 8px 20px rgba(220, 38, 38, 0.5)'
                        : '0px 8px 20px rgba(0, 102, 204, 0.5)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 17 }}
                >
                  {user?.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt={user?.firstName || user?.name || 'User'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-lg font-bold">
                      {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                    </span>
                  )}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileHover={{
                        scale: [1, 1.3, 1.1],
                        rotate: [0, -10, 10, 0],
                        opacity: 1,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: 'easeInOut',
                      }}
                    >
                      <User
                        size={16}
                        className="text-white drop-shadow-lg filter brightness-110"
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Link>

              {/* Collapsed Logout Button */}
              <motion.button
                onClick={logout}
                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:shadow-lg"
                title={t('auth.logout')}
                whileHover={{
                  scale: 1.15,
                  rotate: [0, -5, 5, 0],
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(220, 38, 38, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <LogOut size={16} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-user"
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="flex items-center min-w-0 flex-1 mr-3">
                <Link
                  href={`/${locale}/${userRole}/account`}
                  title={t('staff.accountSettings') || 'Account Settings'}
                  className="flex items-center group"
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 dark:from-red-500 dark:to-red-600 flex items-center justify-center text-white font-semibold overflow-hidden cursor-pointer relative shadow-md"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{
                      scale: 1.1,
                      boxShadow:
                        theme === 'dark'
                          ? '0px 6px 16px rgba(220, 38, 38, 0.4)'
                          : '0px 6px 16px rgba(0, 102, 204, 0.4)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 17 }}
                  >
                    {user?.profileImageUrl ? (
                      <Image
                        src={user.profileImageUrl}
                        alt={user?.firstName || user?.name || 'User'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-sm font-bold">
                        {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                      </span>
                    )}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileHover={{
                          scale: [1, 1.3, 1.1],
                          rotate: [0, -10, 10, 0],
                          opacity: 1,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: 'easeInOut',
                        }}
                      >
                        <Camera
                          size={16}
                          className="text-white drop-shadow-lg filter brightness-110"
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                  <div className="ml-3 min-w-0 flex-1">
                    <motion.p
                      className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-primary dark:group-hover:text-red-400 transition-colors duration-200 truncate"
                      whileHover={{ y: -1, scale: 1.02 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      {user?.firstName || user?.name}
                    </motion.p>
                    <motion.p
                      className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors duration-200 font-medium uppercase tracking-wide"
                      whileHover={{ y: 1, scale: 1.02 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      {user?.role}
                    </motion.p>
                  </div>
                </Link>
              </div>

              <motion.button
                onClick={logout}
                className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:shadow-lg"
                title={t('auth.logout')}
                whileHover={{
                  scale: 1.15,
                  rotate: [0, -5, 5, 0],
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(220, 38, 38, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <LogOut size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.aside>
  );
}

const LogoWrapper = styled.div<{ $theme: string }>`
  .logo-link {
    display: inline-block;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
    border-radius: 12px;
    padding: 4px;
  }

  .logo-link:hover {
    transform: scale(1.08) translateY(-2px);
    background: ${props =>
      props.$theme === 'dark'
        ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'};
  }

  .logo-link:active {
    transform: scale(0.96) translateY(1px);
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Collapsed logo styles */
  .logo-link-collapsed {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 8px;
    padding: 2px;
  }

  .logo-link-collapsed:hover {
    transform: scale(1.1);
    background: ${props =>
      props.$theme === 'dark'
        ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'};
  }

  .logo-container-collapsed {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props =>
      props.$theme === 'dark'
        ? 'linear-gradient(135deg, rgba(64, 64, 64, 0.3) 0%, rgba(32, 32, 32, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.4) 100%)'};
    backdrop-filter: blur(4px);
    border: 1px solid
      ${props =>
        props.$theme === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)'};
    transition: all 0.3s ease;
  }

  .logo-image-collapsed {
    position: relative;
    z-index: 2;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.15));
    object-fit: contain;
  }

  .logo-link-collapsed:hover .logo-container-collapsed {
    background: ${props =>
      props.$theme === 'dark'
        ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(0, 102, 204, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)'};
    box-shadow: 0 4px 16px
      ${props =>
        props.$theme === 'dark'
          ? 'rgba(220, 38, 38, 0.25)'
          : 'rgba(0, 102, 204, 0.25)'};
    border-color: ${props =>
      props.$theme === 'dark'
        ? 'rgba(220, 38, 38, 0.3)'
        : 'rgba(0, 102, 204, 0.3)'};
  }

  .logo-link-collapsed:hover .logo-image-collapsed {
    filter: drop-shadow(
      0 3px 8px
        ${props =>
          props.$theme === 'dark'
            ? 'rgba(220, 38, 38, 0.4)'
            : 'rgba(0, 102, 204, 0.4)'}
    );
    transform: scale(1.05);
  }

  .logo-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    transition: all 0.6s ease;
    overflow: hidden;
    background: ${props =>
      props.$theme === 'dark'
        ? 'linear-gradient(135deg, rgba(64, 64, 64, 0.3) 0%, rgba(32, 32, 32, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.4) 100%)'};
    backdrop-filter: blur(8px);
    border: 1px solid
      ${props =>
        props.$theme === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)'};
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
      ${props => (props.$theme === 'dark' ? '#dc2626' : '#0066cc')},
      transparent
    );
    animation: rotate 6s linear infinite;
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  .logo-container::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: ${props =>
      props.$theme === 'dark'
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'};
    border-radius: 10px;
    z-index: 1;
  }

  .logo-link:hover .logo-container::before {
    opacity: 0.2;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .logo-link:hover .logo-container {
    background: ${props =>
      props.$theme === 'dark'
        ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(0, 102, 204, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)'};
    box-shadow: 0 8px 32px
      ${props =>
        props.$theme === 'dark'
          ? 'rgba(220, 38, 38, 0.25)'
          : 'rgba(0, 102, 204, 0.25)'};
    border-color: ${props =>
      props.$theme === 'dark'
        ? 'rgba(220, 38, 38, 0.3)'
        : 'rgba(0, 102, 204, 0.3)'};
  }

  .logo-image {
    position: relative;
    z-index: 2;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  }

  .logo-link:hover .logo-image {
    filter: drop-shadow(
      0 6px 16px
        ${props =>
          props.$theme === 'dark'
            ? 'rgba(220, 38, 38, 0.4)'
            : 'rgba(0, 102, 204, 0.4)'}
    );
    animation: logoFloat 3s ease-in-out infinite;
  }

  @keyframes logoFloat {
    0%,
    100% {
      transform: translateY(0px) scale(1);
    }
    50% {
      transform: translateY(-2px) scale(1.02);
    }
  }

  .logo-link:active .logo-image {
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
    animation: none;
    transform: scale(0.98);
  }
`;
