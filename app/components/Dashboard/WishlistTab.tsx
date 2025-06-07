'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useWishlist } from '@/app/contexts/WishlistContext';
import { Heart, Trash2 } from 'lucide-react';
import ProductCard from '@/app/components/Products/ProductCard';

export default function WishlistTab() {
  const dashboardT = useTranslations('dashboard');
  const { items, removeFromWishlist, loading } = useWishlist();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  const handleRemove = async (productId: string, productType: string) => {
    await removeFromWishlist(productId, productType);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-red-500"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-neutral-950 rounded-xl shadow-lg p-8 text-center border border-blue-100 dark:border-red-900/20">
          <Heart
            size={48}
            className="mx-auto text-blue-500 dark:text-red-500 mb-4"
          />
          <h3 className="text-lg font-medium text-neutral-950 dark:text-white mb-2">
            {dashboardT('emptyWishlist')}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {dashboardT('emptyWishlistMessage')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="relative group">
              <ProductCard
                id={item.productId}
                name={item.name}
                price={item.price}
                imageUrl={item.imageUrl}
                type={
                  item.productType.toLowerCase() as
                    | 'component'
                    | 'configuration'
                }
                category={''}
                stock={1}
                showRating={true}
              />
              <button
                onClick={() => handleRemove(item.productId, item.productType)}
                className="absolute top-2 right-2 z-10 p-2 bg-white/80 dark:bg-neutral-800/80 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
