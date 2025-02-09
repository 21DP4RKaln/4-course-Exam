'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Reviews() {
  const t = useTranslations('reviews');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const reviews = [
    {
      name: t('review1.name'),
      text: t('review1.text'),
      image: "/review-pc.jpg"
    },
    {
      name: t('review2.name'),
      text: t('review2.text'),
      image: "/review-pc-2.jpg"
    },
    {
      name: t('review3.name'),
      text: t('review3.text'),
      image: "/review-pc-3.jpg"
    }
  ];

  const nextReview = () => {
    setCurrentReviewIndex((prev) => 
      (prev + 1) % reviews.length
    );
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => 
      prev === 0 ? reviews.length - 1 : prev - 1
    );
  };

  const currentReview = reviews[currentReviewIndex];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          {t('title')}
        </h2>
        <div className="relative">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <Image
                    src={currentReview.image}
                    alt={currentReview.name}
                    fill
                    style={{objectFit: 'cover'}}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {currentReview.name}
                  </h3>
                  <p className="text-gray-400">
                    {currentReview.text}
                  </p>
                  <button className="mt-4 text-red-500 font-medium">
                    {t('chooseComputer')}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Navigācijas pogas */}
          <button 
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-red-600 p-2 rounded-full"
          >
            <span className="sr-only">{t('prevReview')}</span>
            ←
          </button>
          <button 
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-red-600 p-2 rounded-full"
          >
            <span className="sr-only">{t('nextReview')}</span>
            →
          </button>
        </div>
      </div>
    </section>
  );
}