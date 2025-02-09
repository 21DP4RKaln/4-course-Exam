'use client'

import { useTranslations } from 'next-intl'

interface FooterContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FooterContactModal({ isOpen, onClose }: FooterContactModalProps) {
  const t = useTranslations('footer')

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-lg max-w-lg w-full relative" 
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={onClose} 
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg 
            className="w-6 h-6 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-center text-red-500">{t('contact.title')}</h2>
        <form className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            <input 
              type="text" 
              placeholder={t('contact.name')} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600" 
            />
            <input 
              type="email" 
              placeholder={t('contact.email')} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600" 
            />
            <textarea 
              placeholder={t('contact.message')} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600" 
            />
            <button 
              type="submit" 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('contact.send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}