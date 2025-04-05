'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: string;
  maxWidth?: string;
}

/**
 * Base modal component with customizable content
 */
export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  maxWidth = 'max-w-lg' 
}: ModalProps) {
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-[#1E1E1E] rounded-lg p-6 w-full ${maxWidth} relative mx-4 my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {title && (
          <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        )}
        
        {children}
      </div>
    </div>
  );
}

/**
 * Contact modal for customer support
 */
export function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('contactModal');
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={t('title')}
      maxWidth="max-w-md"
    >
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
    </Modal>
  );
}

/**
 * Contact form modal for business inquiries
 */
export function ContactFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('footer');
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={t('contact.title')}
      maxWidth="max-w-md"
    >
      <form className="mt-4">
        <div className="grid grid-cols-1 gap-4">
          <input 
            type="text" 
            placeholder={t('contact.name')} 
            className="w-full px-4 py-2 border border-gray-700 bg-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-red-600" 
          />
          <input 
            type="email" 
            placeholder={t('contact.email')} 
            className="w-full px-4 py-2 border border-gray-700 bg-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-red-600" 
          />
          <textarea 
            placeholder={t('contact.message')} 
            className="w-full px-4 py-2 border border-gray-700 bg-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-red-600" 
            rows={4}
          />
          <button 
            type="submit" 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('contact.send')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Error message component with consistent styling
 */
export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const t = useTranslations();
  const router = useRouter();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
      <div className="max-w-md w-full p-8 bg-[#1E1E1E] rounded-lg shadow-lg text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h2 className="text-xl font-bold text-white mb-4">Error</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        
        <div className="flex justify-center space-x-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
            >
              {t('common.retry')}
            </button>
          )}
          
          <button
            onClick={() => router.push(`/`)}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Success message component with consistent styling
 */
export function SuccessMessage({ 
  title, 
  message, 
  actionText, 
  onAction 
}: { 
  title: string; 
  message: string; 
  actionText?: string; 
  onAction?: () => void 
}) {
  return (
    <div className="bg-[#2A2A2A] rounded-lg p-8 text-center">
      <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-gray-400 mb-6">{message}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-block px-6 py-3 bg-[#E63946] text-white rounded-lg hover:bg-[#FF4D5A] transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}