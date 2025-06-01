'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Mail, Phone, MapPin, Monitor, Cpu, Keyboard, Wrench, Info, Clock, ArrowRight } from 'lucide-react'
import SocialMediaButtons from '@/app/components/ui/social-icons'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Footer() {
  const t = useTranslations()
  const pathname = usePathname()
  const { theme } = useTheme()
  const locale = pathname.split('/')[1]
  
  const footerRef = useRef(null)
  const companyInfoRef = useRef(null)
  const quickLinksRef = useRef(null)
  const productsRef = useRef(null)
  const otherLinksRef = useRef(null)
  const contactRef = useRef(null)
  const bottomRef = useRef(null)
  
  const isCompanyInfoInView = useInView(companyInfoRef, { once: false, amount: 0.3 })
  const isQuickLinksInView = useInView(quickLinksRef, { once: false, amount: 0.3 })
  const isProductsInView = useInView(productsRef, { once: false, amount: 0.3 })
  const isOtherLinksInView = useInView(otherLinksRef, { once: false, amount: 0.3 })
  const isContactInView = useInView(contactRef, { once: false, amount: 0.3 })
  const isBottomInView = useInView(bottomRef, { once: false, amount: 0.3 })

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }
  
  const linkHoverVariants = {
    initial: {},
    hover: {}
  }

  return (
    <footer 
      className={`border-t ${
        theme === 'dark' 
          ? 'bg-black border-stone-950 text-neutral-300' 
          : 'bg-white border-neutral-200 text-neutral-600'
      }`}
      ref={footerRef}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Company Info */}
          <motion.div 
            className="md:col-span-3 space-y-6"
            ref={companyInfoRef}
            initial="hidden"
            animate={isCompanyInfoInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <motion.h3 
                className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}
                whileHover={{ scale: 1.02 }}
              >
                {t('common.appName')}
              </motion.h3>
              <motion.p 
                className="text-sm max-w-md leading-relaxed mb-6"
                variants={itemVariants}
              >
                {t('common.Text')}
              </motion.p>
              <motion.div 
                className="flex justify-start mb-6"
                variants={itemVariants}
              >
                <SocialMediaButtons />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            className="md:col-span-2"
            ref={quickLinksRef}
            initial="hidden"
            animate={isQuickLinksInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.h3 
              className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}
              variants={itemVariants}
            >
              {t('nav.options')}
            </motion.h3>
            <motion.ul className="space-y-2" variants={containerVariants}>
              <motion.li variants={itemVariants}>
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    href={`/${locale}/configurator`}
                    className={`text-sm flex items-center ${
                      theme === 'dark'
                        ? 'hover:text-brand-red-500' 
                        : 'hover:text-brand-blue-500'
                    } transition-colors group`}
                  >
                    <Cpu size={14} className={`mr-2 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                    <span>{t('nav.configurator')}</span>
                    <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </motion.div>
              </motion.li>
              <motion.li variants={itemVariants}>
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    href={`/${locale}/shop/ready-made`}
                    className={`text-sm flex items-center ${
                      theme === 'dark'
                        ? 'hover:text-brand-red-500' 
                        : 'hover:text-brand-blue-500'
                    } transition-colors group`}
                  >
                    <Monitor size={14} className={`mr-2 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                    <span>{t('nav.readyMade')}</span>
                    <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </motion.div>
              </motion.li>
            </motion.ul>
          </motion.div>

          {/* Products */}
          <motion.div 
            className="md:col-span-2"
            ref={productsRef}
            initial="hidden"
            animate={isProductsInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.h3 
              className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}
              variants={itemVariants}
            >
              {t('nav.products')}
            </motion.h3>
            <motion.ul className="space-y-2" variants={containerVariants}>
              <motion.li variants={itemVariants}>
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    href={`/${locale}/components`}
                    className={`text-sm flex items-center ${
                      theme === 'dark'
                        ? 'hover:text-brand-red-500' 
                        : 'hover:text-brand-blue-500'
                    } transition-colors group`}
                  >
                    <Cpu size={14} className={`mr-2 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                    <span>{t('nav.components')}</span>
                    <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </motion.div>
              </motion.li>
              <motion.li variants={itemVariants}>
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    href={`/${locale}/peripherals`}
                    className={`text-sm flex items-center ${
                      theme === 'dark'
                        ? 'hover:text-brand-red-500' 
                        : 'hover:text-brand-blue-500'
                    } transition-colors group`}
                  >
                    <Keyboard size={14} className={`mr-2 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                    <span>{t('nav.peripherals')}</span>
                    <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </motion.div>
              </motion.li>
            </motion.ul>
          </motion.div>

          {/* Other Links */}
          <motion.div 
            className="md:col-span-2"
            ref={otherLinksRef}
            initial="hidden"
            animate={isOtherLinksInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.h3 
              className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}
              variants={itemVariants}
            >
              {t('nav.services')}
            </motion.h3>
            <motion.ul className="space-y-2" variants={containerVariants}>
              <motion.li variants={itemVariants}>
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    href={`/${locale}/repairs`}
                    className={`text-sm flex items-center ${
                      theme === 'dark'
                        ? 'hover:text-brand-red-500' 
                        : 'hover:text-brand-blue-500'
                    } transition-colors group`}
                  >
                    <Wrench size={14} className={`mr-2 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                    <span>{t('nav.repairs')}</span>
                    <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </motion.div>
              </motion.li>
              <motion.li variants={itemVariants}>
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    href={`/${locale}/about`}
                    className={`text-sm flex items-center ${
                      theme === 'dark'
                        ? 'hover:text-brand-red-500' 
                        : 'hover:text-brand-blue-500'
                    } transition-colors group`}
                  >
                    <Info size={14} className={`mr-2 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                    <span>{t('nav.about')}</span>
                    <ArrowRight size={12} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </motion.div>
              </motion.li>
            </motion.ul>
          </motion.div>

          {/* Contact & Working Hours */}
          <motion.div 
            className="md:col-span-3"
            ref={contactRef}
            initial="hidden"
            animate={isContactInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.h3 
              className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}
              variants={itemVariants}
            >
              {t('footer.contact')}
            </motion.h3>
            <motion.ul className="space-y-3 mb-8" variants={containerVariants}>
              <motion.li className="flex items-start" variants={itemVariants}>
                <MapPin size={16} className={`mr-2 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                <span className="text-sm">{t('contact.address')}</span>
              </motion.li>
              <motion.li className="flex items-center" variants={itemVariants}>
                <Phone size={16} className={`mr-2 flex-shrink-0 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                <span className="text-sm">{t('contact.phone')}</span>
              </motion.li>
              <motion.li className="flex items-center" variants={itemVariants}>
                <Mail size={16} className={`mr-2 flex-shrink-0 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                <motion.a 
                  href="mailto:info@ivapro.com" 
                  className="text-sm hover:underline"
                  whileHover={{ scale: 1.05 }}
                >
                  {t('contact.email')}
                </motion.a>
              </motion.li>
            </motion.ul>

            <motion.h3 
              className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}
              variants={itemVariants}
            >
              {t('nav.workingHours')}
            </motion.h3>
            <motion.ul className="space-y-2" variants={containerVariants}>
              <motion.li className="flex items-start" variants={itemVariants}>
                <Clock size={16} className={`mr-2 mt-0.5 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                <motion.div className="text-sm">
                  <p>{t('contact.workingHours')}</p>
                  <p>{t('contact.weekends')}</p>
                </motion.div>
              </motion.li>
            </motion.ul>
          </motion.div>
        </div>
        
        <motion.div 
          className={`border-t mt-12 pt-8 ${theme === 'dark' ? 'border-stone-950' : 'border-neutral-200'}`}
          ref={bottomRef}
          initial="hidden"
          animate={isBottomInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.p className="text-sm mb-4 md:mb-0" variants={itemVariants}>
              {t('footer.copyright')}
            </motion.p>
            
            <motion.div className="flex space-x-6" variants={containerVariants}>
              <motion.div variants={itemVariants} whileHover={{ y: -2 }}>
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
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ y: -2 }}>
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
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}