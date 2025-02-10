'use client'

import { useTranslations } from 'next-intl'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const t = useTranslations('contactModal')
    
    if (!isOpen) return null
  
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    }
  
    return (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={handleBackdropClick} 
        >
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#1a1b26] p-8">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
  
            <h2 className="text-2xl font-bold text-white mb-6">{t('title')}</h2>
            
            <div className="space-y-6">
              <p className="text-gray-300">
                {t('description.first')}
              </p>
              <p className="text-gray-300">
                {t('description.second')}
              </p>
  
              {/* Contact options */}
              <div>
                <h3 className="text-lg text-white mb-2">{t('callOrRequest')}</h3>
                <a 
                  href="tel:+37120699800" 
                  className="text-xl text-white font-bold hover:text-lime-400"
                >
                  +371 20699800
                </a>
              </div>
  
              {/* Messaging */}
              <div>
                <h3 className="text-lg text-white mb-2">{t('writeMessage')}</h3>
                <div className="flex gap-4">
                  <a 
                    href="https://t.me/ivaprolv" 
                    className="px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700"
                  >
                    Telegram
                  </a>
                  <a 
                    href="https://wa.me/37120699800" 
                    className="px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
  
              {/* Email */}
              <div>
                <h3 className="text-lg text-white mb-2">{t('writeEmail')}</h3>
                <div className="flex gap-4">
                  <a 
                    href="mailto: ivaprolv@outlook.com" 
                    className="px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700"
                  >
                    ivaprolv@outlook.com
                  </a>
                </div>
              </div>
  
              <p className="text-gray-400 text-sm">
                {t('workHours')}
              </p>
            </div>
          </div>
        </div>
      )
  }