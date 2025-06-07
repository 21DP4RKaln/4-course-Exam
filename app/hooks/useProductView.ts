import { useEffect } from 'react';

/**
 * Hook to increment product view count
 * This will track views and increment the count in the database
 *
 * @param productId ID of the product
 * @param productType Type of the product ('configuration', 'component', 'peripheral')
 */
export function useProductView(
  productId: string | undefined,
  productType: string | undefined
) {
  useEffect(() => {
    if (!productId || !productType) return;

    if (typeof window === 'undefined') return;

    const viewedKey = `viewed_${productType}_${productId}`;
    const lastViewed = sessionStorage.getItem(viewedKey);
    const now = Date.now();

    if (lastViewed && now - parseInt(lastViewed, 10) < 30 * 60 * 1000) {
      return;
    }

    sessionStorage.setItem(viewedKey, now.toString());

    const incrementView = async () => {
      try {
        const response = await fetch('/api/shop/product/view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId, productType }),
        });

        if (!response.ok) {
          console.error('Failed to record view:', await response.text());
        }
      } catch (error) {
        console.error('Failed to record product view:', error);
      }
    };

    incrementView();
  }, [productId, productType]);
}
