'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Cpu, Monitor, Keyboard, Wrench, Info, Clock } from 'lucide-react'

export default function EnhancedFooter() {
  const t = useTranslations()
  const pathname = usePathname()
  
  // Get current locale from path
  const locale = pathname.split('/')[1]

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Company Info */}
          <div className="md:col-span-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {t('common.appName')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('common.Text')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* PC Products */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              PC Options
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/configurator`}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center"
                >
                  <Cpu size={16} className="mr-2" />
                  {t('nav.configurator')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/shop/ready-made`}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center"
                >
                  <Monitor size={16} className="mr-2" />
                  {t('nav.readyMade')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Products
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/components`}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center"
                >
                  <Cpu size={16} className="mr-2" />
                  Components
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/peripherals`}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center"
                >
                  <Keyboard size={16} className="mr-2" />
                  Peripherals
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/repairs`}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center"
                >
                  <Wrench size={16} className="mr-2" />
                  Repairs
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/about`}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center"
                >
                  <Info size={16} className="mr-2" />
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  {t('footer.address')}
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {t('footer.number')}
                </span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
                <a href="mailto:info@ivapro.com" className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                  {t('footer.mail')}
                </a>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Mon-Fri: 10-19, Sat: 10-16
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
              {t('footer.copyright')}
            </p>
            
            <div className="flex space-x-6">
              <Link 
                href={`/${locale}/privacy-policy`}
                className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 text-sm"
              >
                {t('footer.privacyPolicy')}
              </Link>
              <Link 
                href={`/${locale}/terms-of-service`}
                className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 text-sm"
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