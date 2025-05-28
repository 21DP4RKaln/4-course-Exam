'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/app/contexts/ThemeContext'
import { CheckCircle, Wrench, Award, Headphones, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ServicesSection() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const { theme } = useTheme()
  
  // Add scroll animation hooks
  const { scrollY } = useScroll()
  const titleOpacity = useTransform(scrollY, [300, 700], [0, 1])
  const titleY = useTransform(scrollY, [300, 700], [50, 0])
  const cardsOpacity = useTransform(scrollY, [400, 800], [0, 1])
  const cardsScale = useTransform(scrollY, [400, 800], [0.9, 1])
  const ctaY = useTransform(scrollY, [700, 1000], [100, 0])
  const ctaOpacity = useTransform(scrollY, [700, 1000], [0, 1])

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
    <motion.section 
      className={`py-16 md:py-24 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-10 md:mb-16"
          style={{ opacity: titleOpacity, y: titleY }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-neutral-900'
          }`}>
            {t('nav.Choose')}
          </h2>
          <p className={`max-w-2xl mx-auto text-sm md:text-base ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`}>
            {t('nav.Answer')}
          </p>
        </motion.div>        

        {/* Service Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
          style={{ opacity: cardsOpacity, scale: cardsScale }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
        >
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 group relative overflow-hidden ${
                theme === 'dark' 
                  ? 'bg-dark-card border border-stone-950 hover:border-brand-red-800'
                  : 'bg-white border border-neutral-100 hover:border-brand-blue-200'
              } shadow-soft hover:shadow-medium`}
            >              
              {/* Service icon */}
              <motion.div 
                className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl flex items-center justify-center mb-4 md:mb-6 ${
                  theme === 'dark' 
                    ? 'bg-brand-red-900/30 group-hover:bg-brand-red-900/50'
                    : 'bg-brand-blue-50 group-hover:bg-brand-blue-100'
                } transition-colors`}
                initial={{ scale: 0.8, rotate: -5 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                {service.icon}
              </motion.div>
              
              {/* Service title */}
              <h3 className={`text-lg md:text-xl font-bold mb-2 md:mb-3 group-hover:${
                theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
              } transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-neutral-900'
              }`}>
                {service.title}
              </h3>
              
              {/* Service description */}
              <p className={`text-sm md:text-base ${
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              } mb-4 md:mb-6`}>
                {service.description}
              </p>
              
              {/* Background decoration */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-125">
                <div className={`w-full h-full rounded-full ${
                  theme === 'dark' ? 'bg-brand-red-500' : 'bg-brand-blue-500'
                }`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
          {/* CTA Section */}
        <motion.div 
          className={`mt-16 md:mt-24 rounded-xl md:rounded-2xl overflow-hidden ${
            theme === 'dark' ? 'bg-dark-card border border-stone-950' : 'bg-white border border-neutral-100'
          } shadow-medium`}
          style={{ y: ctaY, opacity: ctaOpacity }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative flex flex-col md:flex-row">
            {/* Left side - image */}              
            <motion.div 
                className="md:w-1/2 h-48 sm:h-64 md:h-auto md:min-h-[280px] relative order-2 md:order-1"
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Image
                  src= "/images/PC.png"
                  alt="PC Build"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className={`absolute inset-0 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-t md:bg-gradient-to-r from-black via-transparent to-transparent' 
                    : 'bg-gradient-to-t md:bg-gradient-to-r from-white via-transparent to-transparent'
                }`}></div>
              </motion.div>
              
              {/* Right side - text */}
            <motion.div 
              className="md:w-1/2 p-6 md:p-8 lg:p-12 flex flex-col justify-center order-1 md:order-2"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h3 
                className={`text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-neutral-900'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {t('nav.readyToBuild')}
              </motion.h3>
              
              <motion.p 
                className={`text-sm md:text-base mb-6 md:mb-8 ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t('nav.customPcDesc')}
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link 
                  href={`/${locale}/configurator`}
                  className={`inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl text-white text-sm md:text-base font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-brand-red-600 hover:bg-brand-red-700 shadow hover:shadow-xl hover:shadow-brand-red-600/20' 
                      : 'bg-brand-blue-600 hover:bg-brand-blue-700 shadow hover:shadow-xl hover:shadow-brand-blue-600/20'
                  }`}
                >
                  {t('nav.startBuilding')}
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                
                <Link 
                  href={`/${locale}/shop/ready-made`}
                  className={`inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                      : 'bg-white text-neutral-900 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  {t('nav.readyMade')}
                </Link>
              </motion.div>            
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}