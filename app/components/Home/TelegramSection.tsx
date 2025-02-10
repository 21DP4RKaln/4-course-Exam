'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function TelegramSection() {
  const t = useTranslations('telegramSection');
  
  return (
    <section className="py-16 bg-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[#58b6f9]/50 via-[#58b6f9]/60 to-[#eff8fe]/70 rounded-2xl p-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <div>
              {/* <div className="text-white-500 mb-2">
                {t('memberCount')}
              </div> */}
              <h2 className="text-3xl font-bold text-white mb-4">
                {t('title')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('description')}
              </p>
              <Link 
                href="https://t.me/IvaProCommunity" 
                className="inline-flex items-center gap-3 bg-[#27A7E7] text-white px-3 py-3 rounded-lg hover:bg-[#229AD6]"
              >
                <Image 
                  src="/images/telegram-logo.png" 
                  alt="Telegram" 
                  width={36} 
                  height={36} 
                />
                {t('joinButton')}
              </Link>
              {/* <div className="text-gray-400 mt-4 text-sm italic">
                  {t('giveaway')}  
              </div> */}
            </div>
            {/* <div className="relative h-[300px]">
              <Image
                src="/images/telegram-preview.png"
                alt={t('previewAlt')}
                fill
                style={{objectFit: 'contain'}}
              /> 
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}