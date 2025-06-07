'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  type: 'component' | 'configuration' | 'peripheral';
  category: string;
  stock: number;
  specs?: Record<string, string>;
  showRating?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  type,
  category,
  stock,
  specs,
  showRating = true,
}: ProductCardProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const t = useTranslations();

  return (
    <div className="relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-stone-950">
        <Image
          src={imageUrl || '/images/product-placeholder.svg'}
          alt={name}
          width={400}
          height={400}
          className="object-contain w-full h-full p-4"
        />
        {stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
        {stock > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-medium rounded">
            {t('product.inStock')}
          </div>
        )}
        {/* Category badge */}
        {category === 'office' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium rounded">
            {t('shop.categories.office')}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/${locale}/product/${type}/${id}`} className="block">
          <h3 className="font-medium text-neutral-900 dark:text-white mb-1 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          €{price.toFixed(2)}
        </div>
        {/* Specs button */}
        <button className="flex items-center justify-between w-full px-3 py-1.5 bg-neutral-100 dark:bg-stone-950 rounded text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
          <span>{t('buttons.viewSpecs')}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
