'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function HeroSection() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  return (
    <section className="py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          {t('nav.Name')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
          {t('nav.Info')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/${locale}/configurator`}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 text-lg font-semibold"
            >
              {t('nav.configurator')}
            </Link>
            <Link
              href={`/${locale}/shop/ready-made`}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-lg font-semibold"
            >
              {t('nav.readyMade')}
            </Link>
          </div>
          <div className="pt-4 flex items-center text-gray-500 dark:text-gray-400">
            <span className="mr-2">✓</span>
            <span>{t('nav.shipping')}</span>
            <span className="mx-3">|</span>
            <span className="mr-2">✓</span>
            <span>{t('nav.warranty')}</span>
            <span className="mx-3">|</span>
            <span className="mr-2">✓</span>
            <span>{t('nav.support')}</span>
          </div>
        </div>
        <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-2xl">
          {/* Placeholder for actual image */}
          <div className="opacity-30 absolute inset-0 bg-gradient-to-r from-purple-600 to-red-500 flex items-center justify-center">
          </div>
          {/* Uncomment when you have an actual image */}
          <Image
            src="/images/dark-pc.png"
            alt="Custom gaming PC"
            fill
            className="object-cover"
            priority
          />
          
        </div>
      </div>
    </section>
  )
}