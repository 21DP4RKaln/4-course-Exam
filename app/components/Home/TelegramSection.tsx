'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function TelegramSection() {
  const t = useTranslations('telegramSection');
  
  return (
    <section className="py-16 bg-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-[#1a1b26] rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-red-500 mb-2">
                {t('memberCount')}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {t('title')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('description')}
              </p>
              <Link 
                href="https://t.me/apiroq" 
                className="inline-flex items-center gap-2 bg-[#27A7E7] text-white px-6 py-3 rounded-lg hover:bg-[#229AD6]"
              >
                <Image 
                  src="/telegram-logo.svg" 
                  alt="Telegram" 
                  width={24} 
                  height={24} 
                />
                {t('joinButton')}
              </Link>
              {/* <div className="text-gray-400 mt-4 text-sm italic">
                  {t('giveaway')}  
              </div> */}
            </div>
            <div className="relative h-[300px]">
              <Image
                src="/images/telegram-preview.png"
                alt={t('previewAlt')}
                fill
                style={{objectFit: 'contain'}}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}