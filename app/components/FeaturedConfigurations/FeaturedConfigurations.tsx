'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/app/contexts/CartContext';
import { ShoppingCart, Heart, ChevronRight, Trophy, Flame } from 'lucide-react';

interface Configuration {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  imageUrl: string | null;
  viewCount?: number;
  isPopular?: boolean;
}

export default function FeaturedConfigurations() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const { addItem } = useCart();

  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigurations = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/configurations/popular?limit=4');

        if (!response.ok) {
          throw new Error('Failed to fetch popular configurations');
        }

        const data = await response.json();
        setConfigurations(data);
      } catch (error) {
        console.error('Error fetching popular configurations:', error);
        setError('Failed to load configurations');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigurations();
  }, []);

  const handleAddToCart = (config: Configuration) => {
    addItem({
      id: config.id,
      type: 'configuration',
      name: config.name,
      price: config.discountPrice || config.price,
      imageUrl: config.imageUrl || '',
    });
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
            {t('nav.Popular')}
          </h2>
          <div className="animate-pulse h-6 w-24 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-neutral-300 dark:bg-neutral-700 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 w-20 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error && configurations.length === 0) {
    return (
      <section className="py-12">
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            {t('error.loadingConfigs')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
          {t('nav.Popular')}
        </h2>
        <Link
          href={`/${locale}/shop/ready-made`}
          className="flex items-center text-brand-red-600 dark:text-brand-red-400 hover:underline"
        >
          {t('buttons.view')} <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {configurations.map(config => (
          <div
            key={config.id}
            className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image or placeholder */}
            <Link href={`/${locale}/shop/product/${config.id}`}>
              <div className="h-48 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center relative">
                {config.imageUrl ? (
                  <img
                    src={config.imageUrl}
                    alt={config.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {t('product.imageAlt')}
                  </span>
                )}

                {/* Show popularity badge based on view count */}
                {config.isPopular && (
                  <div className="absolute top-2 left-2 flex items-center bg-gradient-to-r from-brand-red-600 to-brand-red-500 text-white text-xs px-3 py-1 rounded-full">
                    <Flame size={14} className="mr-1" />
                    {t('nav.popular')}
                  </div>
                )}

                {/* Show top pick badge for the most viewed item */}
                {configurations.indexOf(config) === 0 &&
                  config.viewCount &&
                  config.viewCount > 0 && (
                    <div className="absolute top-2 right-2 flex items-center bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs px-3 py-1 rounded-full">
                      <Trophy size={14} className="mr-1" />
                      {t('nav.topPick')}
                    </div>
                  )}
              </div>
            </Link>

            <div className="p-4">
              <Link href={`/${locale}/shop/product/${config.id}`}>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1 hover:text-brand-red-600 dark:hover:text-brand-red-400">
                  {config.name}
                </h3>
              </Link>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
                {config.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  {config.discountPrice ? (
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-brand-red-600 dark:text-brand-red-500">
                        €{config.discountPrice}
                      </span>
                      <span className="ml-2 text-sm text-neutral-500 line-through">
                        €{config.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">
                      €{config.price}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-brand-red-500 dark:hover:text-brand-red-400"
                    aria-label={t('buttons.addToWishlist')}
                  >
                    <Heart size={20} />
                  </button>
                  <button
                    className="p-2 text-white bg-brand-red-600 rounded-md hover:bg-brand-red-700"
                    onClick={() => handleAddToCart(config)}
                    aria-label={t('buttons.addToCart')}
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
