'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/app/contexts/ThemeContext'
import { CheckCircle, Wrench, Award, Headphones, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ServicesSection() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const { theme } = useTheme()

  const services = [
    {
      id: 'building',
      icon: <Wrench className={`h-10 w-10 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />,
      title: t('nav.Building'),
      description: t('nav.Text1')
    },
    {
      id: 'validation',
      icon: <CheckCircle className={`h-10 w-10 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />,
      title: t('nav.Validation'),
      description: t('nav.Text2')
    },
    {
      id: 'quality',
      icon: <Award className={`h-10 w-10 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />,
      title: t('nav.Quality'),
      description: t('nav.Text3')
    },
    {
      id: 'support',
      icon: <Headphones className={`h-10 w-10 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />,
      title: t('nav.Support'),
      description: t('nav.Text4')
    }
  ]

  return (
    <section className={`py-24 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {t('nav.Choose')}
          </h2>
          <p className={`max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {t('nav.Answer')}
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className={`rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden ${
                theme === 'dark' 
                  ? 'bg-dark-card border border-gray-800 hover:border-brand-red-800'
                  : 'bg-white border border-gray-100 hover:border-brand-blue-200'
              } shadow-soft hover:shadow-medium`}
            >
              {/* Service icon */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                theme === 'dark' 
                  ? 'bg-brand-red-900/30 group-hover:bg-brand-red-900/50'
                  : 'bg-brand-blue-50 group-hover:bg-brand-blue-100'
              } transition-colors`}>
                {service.icon}
              </div>
              
              {/* Service title */}
              <h3 className={`text-xl font-bold mb-3 group-hover:${
                theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
              } transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {service.title}
              </h3>
              
              {/* Service description */}
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              } mb-6`}>
                {service.description}
              </p>
              
              {/* Learn more link */}
              <div className={`flex items-center text-sm font-medium ${
                theme === 'dark' 
                  ? 'text-brand-red-400 group-hover:text-brand-red-300' 
                  : 'text-brand-blue-600 group-hover:text-brand-blue-500'
              }`}>
                <span>Learn more</span>
                <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
              
              {/* Background decoration */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-125">
                <div className={`w-full h-full rounded-full ${
                  theme === 'dark' ? 'bg-brand-red-500' : 'bg-brand-blue-500'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className={`mt-24 rounded-2xl overflow-hidden ${
          theme === 'dark' ? 'bg-dark-card border border-gray-800' : 'bg-white border border-gray-100'
        } shadow-medium`}>
          <div className="relative flex flex-col md:flex-row">
            {/* Left side - image */}
            <div className="md:w-1/2 min-h-[300px] relative">
              <Image
                src={theme === 'dark' ? "/dark-pc.png" : "/light-pc.png"}
                alt="PC Build"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className={`absolute inset-0 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-black via-transparent to-transparent' 
                  : 'bg-gradient-to-r from-white via-transparent to-transparent'
              } md:bg-none`}></div>
            </div>
            
            {/* Right side - text */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Ready to build your dream PC?
              </h3>
              <p className={`mb-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Whether you want to configure your own custom PC or choose from our ready-made selections, we're here to deliver exceptional quality and performance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href={`/${locale}/configurator`}
                  className={`inline-flex items-center px-6 py-3 rounded-xl text-white font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-brand-red-600 hover:bg-brand-red-700 shadow hover:shadow-xl hover:shadow-brand-red-600/20' 
                      : 'bg-brand-blue-600 hover:bg-brand-blue-700 shadow hover:shadow-xl hover:shadow-brand-blue-600/20'
                  }`}
                >
                  Start Building
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link 
                  href={`/${locale}/shop/ready-made`}
                  className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                      : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  View Ready-Made PCs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}