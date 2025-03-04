'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Truck, Settings, Shield } from 'lucide-react';
import { useCallback } from 'react';

export default function Hero() {
    const t = useTranslations('hero');

    const scrollToFooter = useCallback(() => {
        requestAnimationFrame(() => {
            const footer = document.querySelector('footer');
            if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }, []);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white">
                        {t('title')}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {t('subtitle')}
                    </p>
                    
                    {/* Info bloki */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="flex flex-col items-center p-10 space-y-3">
                            <div className="text-red-500 text-xl mb-2">
                                <Truck size={26} className="text-red-500" />
                            </div>
                            <h3 className="text-white font-medium">
                                {t('features.delivery')}
                            </h3>
                        </div>
                        <div className="text-center p-4">
                            <div className="flex flex-col items-center p-7 space-y-3">
                                <Settings size={26} className="text-red-500" />
                            </div>
                            <h3 className="text-white font-medium">
                                {t('features.assembly')}
                            </h3>
                        </div>
                        <div className="text-center p-4">
                            <div className="flex flex-col items-center p-8 space-y-3">
                                <Shield size={26} className="text-red-500" />
                            </div>
                            <h3 className="text-white font-medium">
                                {t('features.warranty')}
                            </h3>
                        </div>
                    </div>

                    {/* Aizvietojam Link ar button */}
                    <button 
                        onClick={scrollToFooter}
                        className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-red-700 transition-colors"
                    >
                        {t('cta')}
                    </button>
                </div>

                <div className="relative h-[600px]">
                <Image 
                    src="/images/pc-case.png"
                    alt="PC case"
                    width={500}
                    height={600}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
            </div>
        </main>
    );
}