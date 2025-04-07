'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

/**
 * Kļūdas ziņojuma komponents ar konsekventu stilizāciju
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
        <h2 className="text-xl font-bold text-white mb-4">Kļūda</h2>
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
 * Veiksmīga ziņojuma komponents ar konsekventu stilizāciju
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

/**
 * Lapa nav atrasta (404) kļūdas komponents
 */
export function NotFoundPage() {
  const t = useTranslations('common');
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
      <div className="max-w-md w-full p-8 bg-[#1E1E1E] rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 mb-6">{t('pageNotFound')}</p>
        <button 
          onClick={() => router.push('/')}
          className="inline-block px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
        >
          {t('backToHome')}
        </button>
      </div>
    </div>
  );
}