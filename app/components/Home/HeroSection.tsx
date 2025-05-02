'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Cpu, Monitor, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function HeroSection() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const { theme } = useTheme()
  
  return (
    <section className="relative min-h-[85vh] w-full flex flex-col justify-center">
      {/* Background image with gradient overlay based on theme */}
      <div className="absolute inset-0 z-0">
        {theme === 'dark' ? (
        <div className="absolute inset-0 z-0 flex justify-end">
          <div className="relative w-3/4 h-full">
            <Image 
              src="/images/dark-pc.png" 
              alt="Dark PC" 
              fill 
              className="object-cover"
              priority
            />
          </div>
        </div>
        ) : (
          <div className="absolute inset-0 z-0 flex justify-end">
            <div className="relative w-3/4 h-full">
            <Image 
              src="/images/light-pc.png" 
              alt="Light PC" 
              fill 
              className="object-cover object-center"
              priority
            />
            </div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-black/70 to-brand-red-800/50' 
            : 'bg-gradient-to-r from-white/70 to-brand-blue-600/30'
        }`}></div>
      </div>
      
      {/* Hero content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {t('nav.Name')}
          </h1>
          
          <p className={`text-xl md:text-2xl mb-8 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            {t('nav.Info')}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/${locale}/configurator`}
              className={`inline-flex items-center px-6 py-3 rounded-xl text-white font-medium transition-all ${
                theme === 'dark' 
                  ? 'bg-brand-red-600 hover:bg-brand-red-700 shadow-lg hover:shadow-xl hover:shadow-brand-red-600/20' 
                  : 'bg-brand-blue-600 hover:bg-brand-blue-700 shadow-lg hover:shadow-xl hover:shadow-brand-blue-600/20'
              }`}
            >
              <Cpu className="mr-2 h-5 w-5" />
              {t('nav.configurator')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            
            <Link
              href={`/${locale}/shop/ready-made`}
              className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                theme === 'dark' 
                  ? 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border border-white/20' 
                  : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-md'
              }`}
            >
              <Monitor className="mr-2 h-5 w-5" />
              {t('nav.readyMade')}
            </Link>
          </div>
          
          <div className={`flex items-center gap-8 mt-10 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                theme === 'dark' ? 'bg-brand-red-500' : 'bg-brand-blue-500'
              }`}></div>
              <span>{t('nav.shipping')}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                theme === 'dark' ? 'bg-brand-red-500' : 'bg-brand-blue-500'
              }`}></div>
              <span>{t('nav.warranty')}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                theme === 'dark' ? 'bg-brand-red-500' : 'bg-brand-blue-500'
              }`}></div>
              <span>{t('nav.support')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}