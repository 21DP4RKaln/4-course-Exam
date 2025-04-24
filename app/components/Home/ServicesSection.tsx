'use client'

import { Cpu, CheckCircle, Award, Headphones } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const services = [
  {
    icon: <Cpu size={32} />,
    title: ('nav.Building'),
    description: ('nav.Text1')
  },
  {
    icon: <CheckCircle size={32} />,
    title: ('nav.Validation'),
    description: ('nav.Text2')
  },
  {
    icon: <Award size={32} />,
    title: ('nav.Quality'),
    description: ('nav.Text3')
  },
  {
    icon: <Headphones size={32} />,
    title: ('nav.Support'),
    description: ('nav.Text4')
  }
]

export default function ServicesSection() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('nav.Choose')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('nav.Answer')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-red-600 dark:text-red-400 mb-4">
              {service.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {service.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}