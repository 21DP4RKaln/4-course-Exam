'use client';

import { useTranslations } from 'next-intl';
import { MessageCircle, Wrench, Settings, Truck } from 'lucide-react';

export default function ProcessSteps() {
  const t = useTranslations('processSteps');
  
  const steps = [
    {
      step: 1,
      title: t('step1.title'),
      description: t('step1.description'),
      icon: MessageCircle
    },
    {
      step: 2,
      title: t('step2.title'),
      description: t('step2.description'),
      icon: Wrench
    },
    {
      step: 3,
      title: t('step3.title'),
      description: t('step3.description'),
      icon: Settings
    },
    {
      step: 4,
      title: t('step4.title'),
      description: t('step4.description'),
      icon: Truck
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          {t('title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={step.step} 
                className="bg-white/5 backdrop-blur-sm rounded-lg p-8 relative transform transition-transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold absolute -top-6 left-8">
                  {step.step}
                </div>
                <div className="flex justify-center mb-4">
                  <IconComponent className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}