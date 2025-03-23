'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';

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
        <button
          onClick={() => router.push(`/${locale}`)}
          className="inline-block px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
        >
          {t('common.backToHome')}
        </button>
      </div>
    </div>
  );
}