'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Cpu, Monitor, Keyboard, Wrench, Info, Clock, ArrowRight } from 'lucide-react'

export default function Footer() {
  const t = useTranslations()
  const pathname = usePathname()
  const { theme } = useTheme()

  const locale = pathname.split('/')[1]

  return (
    <footer className={`border-t ${
      theme === 'dark' 
        ? 'bg-black border-gray-800 text-gray-300' 
        : 'bg-white border-gray-200 text-gray-600'
    }`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Company Info */}
          <div className="md:col-span-4 space-y-6">
            <div>
              <h3 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {t('common.appName')}
              </h3>
              <p className="text-sm max-w-md leading-relaxed">
                {t('common.Text')}
              </p>
            </div>
            
            <div className="pt-4">
              <h4 className={`text-sm font-semibold mb-3 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {t('footer.contact')}
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <MapPin size={16} className={`mr-2 mt-0.5 flex-shrink-0 ${
                    theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                  }`} />
                  <span className="text-sm">{t('contact.address')}</span>
                </li>
                <li className="flex items-center">
                  <Phone size={16} className={`mr-2 flex-shrink-0 ${
                    theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                  }`} />
                  <span className="text-sm">{t('contact.phone')}</span>
                </li>
                <li className="flex items-center">
                  <Mail size={16} className={`mr-2 flex-shrink-0 ${
                    theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                  }`} />
                  <a href="mailto:info@ivapro.com" className="text-sm hover:underline">
                    {t('contact.email')}
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="flex space-x-4 pt-2">
              <a href="#" className={`${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-brand-red-500' 
                  : 'text-gray-500 hover:text-brand-blue-500'
              } transition-colors`}>
                <Facebook size={20} />
              </a>
              <a href="#" className={`${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-brand-red-500' 
                  : 'text-gray-500 hover:text-brand-blue-500'
              } transition-colors`}>
                <Twitter size={20} />
              </a>
              <a href="#" className={`${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-brand-red-500' 
                  : 'text-gray-500 hover:text-brand-blue-500'
              } transition-colors`}>
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              PC Options
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/configurator`}
                  className={`text-sm flex items-center ${
                    theme === 'dark'
                      ? 'hover:text-brand-red-500' 
                      : 'hover:text-brand-blue-500'
                  } transition-colors group`}
                >
                  <Cpu size={14} className={`mr-2 ${
                    theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                  }`} />
                  <span>{t('nav.configurator')}</span>
                  <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/shop/ready-made`}
                  className={`text-sm flex items-center ${
                    theme === 'dark'
                      ? 'hover:text-brand-red-500' 
                      : 'hover:text-brand-blue-500'
                  } transition-colors group`}
                >
                  <Monitor size={14} className={`mr-2 ${
                    theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                  }`} />
                  <span>{t('nav.readyMade')}</span>
                  <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div className="md:col-span-2">
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {t('nav.products')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/components`}
                  className={`text-sm flex items-center ${
                    theme === 'dark'
                      ? 'hover:text-brand-red-500' 
                      : 'hover:text-brand-blue-500'
                  } transition-colors group`}
                >
                  <Cpu size={14} className={`mr-2 ${
                    theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                  }`} />
                  <span>{t('nav.components')}</span>
                  <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/peripherals`}
                  className={`text-sm flex items-center ${
                    theme === 'dark'
                      ? 'hover:text-brand-red-500' 
                      : 'hover:text-brand-blue-500'
                  } transition-colors group`}
                >
                  <Keyboard size={14} className={`mr-2 ${
                    theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                  }`} />
                  <span>{t('nav.peripherals')}</span>
                  <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Other Links */}
          <div className="md:col-span-2">
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {t('nav.services')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/repairs`}
                  className={`text-sm flex items-center ${
                    theme === 'dark'
                      ? 'hover:text-brand-red-500' 
                      : 'hover:text-brand-blue-500'
                  } transition-colors group`}
                >
                  <Wrench size={14} className={`mr-2 ${
                    theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                  }`} />
                  <span>{t('nav.repairs')}</span>
                  <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/about`}
                  className={`text-sm flex items-center ${
                    theme === 'dark'
                      ? 'hover:text-brand-red-500' 
                      : 'hover:text-brand-blue-500'
                  } transition-colors group`}
                >
                  <Info size={14} className={`mr-2 ${
                    theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                  }`} />
                  <span>{t('nav.about')}</span>
                  <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div className="md:col-span-2">
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Working Hours
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Clock size={14} className={`mr-2 mt-0.5 ${
                  theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'
                }`} />
                <div className="text-sm">
                  <p>{t('contact.workingHours')}</p>
                  <p>{t('contact.weekends')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className={`border-t mt-12 pt-8 ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">
              {t('footer.copyright')}
            </p>
            
            <div className="flex space-x-6">
              <Link 
                href={`/${locale}/privacy-policy`}
                className={`text-sm ${
                  theme === 'dark'
                    ? 'hover:text-brand-red-500' 
                    : 'hover:text-brand-blue-500'
                } transition-colors`}
              >
                {t('footer.privacyPolicy')}
              </Link>
              <Link 
                href={`/${locale}/terms-of-service`}
                className={`text-sm ${
                  theme === 'dark'
                    ? 'hover:text-brand-red-500' 
                    : 'hover:text-brand-blue-500'
                } transition-colors`}
              >
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}