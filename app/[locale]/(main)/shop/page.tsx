'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Monitor, Cpu, Gamepad2, ArrowRight } from 'lucide-react';

export default function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('shop');
  const locale = pathname.split('/')[1];

  const shopCategories = [
    {
      title: t('readyMadePCs'),
      description: t('readyMadePCsDescription'),
      href: `/${locale}/shop/ready-made`,
      icon: Monitor,
      color: 'bg-blue-500',
    },
    {
      title: t('components'),
      description: t('componentsDescription'),
      href: `/${locale}/components`,
      icon: Cpu,
      color: 'bg-green-500',
    },
    {
      title: t('peripherals'),
      description: t('peripheralsDescription'),
      href: `/${locale}/peripherals`,
      icon: Gamepad2,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('shopTitle')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('shopSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {shopCategories.map(category => {
          const IconComponent = category.icon;
          return (
            <Link
              key={category.href}
              href={category.href}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent size={32} className="text-white" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {category.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>

                <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  <span className="mr-2">{t('browseCategory')}</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Featured section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          {t('featuredSection')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            href={`/${locale}/configurator`}
            className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            <h3 className="text-xl font-semibold mb-2">{t('buildYourOwn')}</h3>
            <p className="opacity-90">{t('configuratorDescription')}</p>
          </Link>

          <Link
            href={`/${locale}/shop/ready-made`}
            className="p-6 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300"
          >
            <h3 className="text-xl font-semibold mb-2">{t('readyMade')}</h3>
            <p className="opacity-90">{t('readyMadeDescription')}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
