'use client';

import { useTranslations } from 'next-intl';
import { Wrench, Computer, Search } from 'lucide-react';

export default function Features() {
  const t = useTranslations('features');
  
  return (
    <section className="py-8 bg-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          {t('title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4">
              <div className="text-red-600 text-2xl">
                <Search className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              {t('diagnostics.title')}
            </h3>
            <p className="text-gray-400">
              {t('diagnostics.price')}
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4">
              <div className="text-red-600 text-2xl">
                <Wrench className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              {t('repair.title')}
            </h3>
            <p className="text-gray-400">
              {t('repair.price')}
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4">
              <div className="text-red-600 text-2xl">
                <Computer className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              {t('assembly.title')}
            </h3>
            <p className="text-gray-400">
              {t('assembly.price')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}