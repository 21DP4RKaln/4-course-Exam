'use client';

import { useTranslations } from 'next-intl';
import { Zap, Truck, ThumbsUp } from 'lucide-react';

export default function Features() {
  const t = useTranslations('features');
  
  return (
    <section className="py-16 bg-[#1a1b26]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
            {t('title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4">
              <div className="text-red-600 text-2xl">
                <Zap className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              {t('professional.title')}
            </h3>
            <p className="text-gray-400">
              {t('professional.description')}
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
            <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
              <div className="text-red-600 text-2xl">
                <Truck className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              {t('delivery.title')}
            </h3>
            <p className="text-gray-400">
              {t('delivery.description')}
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
            <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mb-4">
              <div className="text-red-600 text-2xl">
                <ThumbsUp className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              {t('secure.title')}
            </h3>
            <p className="text-gray-400">
              {t('secure.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}