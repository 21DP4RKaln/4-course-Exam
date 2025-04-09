'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  const t = useTranslations()
  const pathname = usePathname()
  
  // Iegūt pašreizējo lokalizāciju no ceļa
  const locale = pathname.split('/')[1]

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Par mums */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {t('common.appName')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Modern PC configuration platform for custom and ready-made computers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Ātras saites */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/configurator`}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  {t('nav.configurator')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/shop/ready-made`}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  {t('nav.readyMade')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/dashboard`}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  {t('nav.dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Juridiskā informācija */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/privacy-policy`}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/terms-of-service`}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/contact`}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakti */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  1234 Main Street, City, Country
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  +371 12345678
                </span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
                <a href="mailto:info@ivapro.com" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  info@ivapro.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}