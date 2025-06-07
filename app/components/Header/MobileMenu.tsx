'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from '@/app/contexts/ThemeContext';
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
  ChevronRight,
  ShoppingCart,
  Globe,
} from 'lucide-react';
import { locales } from '@/app/i18n/config';

const languageNames: Record<string, string> = {
  en: 'English',
  lv: 'Latviski',
  ru: 'Русский',
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardLink: string;
}

export default function MobileMenu({
  isOpen,
  onClose,
  dashboardLink,
}: MobileMenuProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const locale = pathname.split('/')[1];

  const changeLocale = (newLocale: string) => {
    const pathSegments = pathname.split('/');
    pathSegments[1] = newLocale;
    const newPath = pathSegments.join('/');

    router.push(newPath);
    router.refresh();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-black overflow-y-auto">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header with theme and language toggles */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-lg font-semibold">IvaPro</div>

          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-stone-950 relative"
            >
              <Globe
                size={20}
                className="text-neutral-600 dark:text-neutral-400"
              />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-stone-950"
              aria-label={
                theme === 'dark' ? t('common.lightMode') : t('common.darkMode')
              }
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Language Dropdown */}
        {languageMenuOpen && (
          <div className="mb-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4">
            <h3 className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {t('common.language')}
            </h3>
            <div className="space-y-2">
              {locales.map(localeOption => (
                <button
                  key={localeOption}
                  onClick={() => changeLocale(localeOption)}
                  className={`flex items-center w-full p-3 rounded-xl ${
                    localeOption === locale
                      ? theme === 'dark'
                        ? 'bg-brand-red-900/20 text-brand-red-400 border border-brand-red-800/30'
                        : 'bg-brand-blue-50 text-brand-blue-600 border border-brand-blue-200'
                      : 'hover:bg-neutral-100 dark:hover:bg-stone-950 text-stone-950 dark:text-neutral-300'
                  }`}
                >
                  <span>{languageNames[localeOption]}</span>
                  {localeOption === locale && (
                    <ChevronRight
                      size={16}
                      className="ml-auto text-neutral-400"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <nav className="space-y-6">
          <Link
            href={`/${locale}`}
            className="flex items-center w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
            onClick={onClose}
          >
            <Home
              size={20}
              className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
            />
            <span className="font-medium">{t('nav.home')}</span>
          </Link>

          {/* PC Options Group */}
          <div className="space-y-1 border-l-2 border-neutral-100 dark:border-stone-950 pl-2">
            <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3 ml-3">
              PCs
            </div>

            <Link
              href={`/${locale}/configurator`}
              className="flex items-center w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
              onClick={onClose}
            >
              <Cpu
                size={20}
                className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
              />
              <span className="font-medium">{t('nav.configurator')}</span>
            </Link>

            <Link
              href={`/${locale}/shop/ready-made`}
              className="flex items-center w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
              onClick={onClose}
            >
              <Monitor
                size={20}
                className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
              />
              <span className="font-medium">{t('nav.readyMade')}</span>
            </Link>
          </div>

          {/* Other navigation items */}
          <Link
            href={`/${locale}/components`}
            className="flex items-center w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
            onClick={onClose}
          >
            <Cpu
              size={20}
              className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
            />
            <span className="font-medium">{t('nav.components')}</span>
          </Link>

          <Link
            href={`/${locale}/peripherals`}
            className="flex items-center w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
            onClick={onClose}
          >
            <Keyboard
              size={20}
              className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
            />
            <span className="font-medium">{t('nav.peripherals')}</span>
          </Link>

          <Link
            href={`/${locale}/repairs`}
            className="flex items-center w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
            onClick={onClose}
          >
            <Wrench
              size={20}
              className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
            />
            <span className="font-medium">{t('nav.repairs')}</span>
          </Link>

          <Link
            href={`/${locale}/about`}
            className="flex items-center w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
            onClick={onClose}
          >
            <Info
              size={20}
              className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
            />
            <span className="font-medium">{t('nav.about')}</span>
          </Link>

          <Link
            href={`/${locale}/cart`}
            className="flex items-center w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
            onClick={onClose}
          >
            <ShoppingCart
              size={20}
              className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
            />
            <span className="font-medium">{t('nav.cart')}</span>
          </Link>

          {/* Authentication links */}
          <div className="pt-6 border-t border-neutral-100 dark:border-stone-950">
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardLink}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                  onClick={onClose}
                >
                  <div className="flex items-center">
                    <User
                      size={20}
                      className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
                    />
                    <span className="font-medium">{t('nav.dashboard')}</span>
                  </div>
                  <ChevronRight size={18} className="text-neutral-400" />
                </Link>

                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="flex items-center w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                >
                  <LogOut
                    size={20}
                    className={`mr-4 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`}
                  />
                  <span className="font-medium">{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/${locale}/auth/login`}
                  className={`flex items-center justify-center w-full p-3 rounded-xl text-center font-medium ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      : 'bg-white text-stone-950 border border-neutral-200 hover:bg-neutral-50'
                  }`}
                  onClick={onClose}
                >
                  {t('nav.login')}
                </Link>

                <Link
                  href={`/${locale}/auth/register`}
                  className={`flex items-center justify-center w-full p-3 rounded-xl text-center font-medium text-white ${
                    theme === 'dark'
                      ? 'bg-brand-red-600 hover:bg-brand-red-700'
                      : 'bg-brand-blue-600 hover:bg-brand-blue-700'
                  }`}
                  onClick={onClose}
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Close button */}
        <div className="pt-6 text-center">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl text-sm font-medium ${
              theme === 'dark'
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {t('nav.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
