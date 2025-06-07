'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCart } from '@/app/contexts/CartContext';
import { useWishlist } from '@/app/contexts/WishlistContext';
import { useAuth } from '@/app/contexts/AuthContext';
import Button from '@/app/components/ui/animated-button';
import SpecificationsTable from './SpecificationsTable';
import ReviewSystem from '../ReviewSystem/ReviewSystem';
import { useProductView } from '@/app/hooks/useProductView';
import Loading from '@/app/components/ui/Loading';
import {
  useLoading,
  LoadingSpinner,
  FullPageLoading,
  ButtonLoading,
} from '@/app/hooks/useLoading';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Clock,
  AlertTriangle,
  Check,
  Copy,
  CheckCircle,
  Tag,
} from 'lucide-react';

interface ProductDetailProps {
  params: {
    slug?: string;
    id?: string;
  };
  type: 'component' | 'peripheral';
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  stock: number;
  specifications?: Record<string, string>;
  imageUrl?: string | null;
  discountPrice?: number | null;
  ratings?: {
    average: number;
    count: number;
  };
}

export default function ProductDetail({ params, type }: ProductDetailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const { addItem } = useCart();
  const locale = pathname.split('/')[1];
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [copied, setCopied] = useState(false);

  const defaultImageUrl = '/images/product-placeholder.svg';

  useProductView(params.id, type);

  const isProductInWishlist = product
    ? isInWishlist(product.id, type.toUpperCase())
    : false;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let productId;

        if (params && params.id) {
          productId = params.id;
        } else if (params && params.slug) {
          productId = params.slug;
        } else {
          const currentUrl = window.location.pathname;
          const urlParts = currentUrl.split('/');
          productId = urlParts[urlParts.length - 1];
        }

        if (!productId || productId === 'undefined') {
          setError(t('errors.productIdMissing'));
          setLoading(false);
          return;
        }
        const response = await fetch(`/api/shop/product/${type}s/${productId}`);

        if (!response.ok) {
          throw new Error(
            `${t('errors.errorsfailedToLoad')}: ${response.status}`
          );
        }

        const data = await response.json();

        if (!data || typeof data !== 'object' || !data.name) {
          throw new Error(t('errors.invalidProductData'));
        }

        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(
          error instanceof Error ? error.message : t('errors.failedToLoad')
        );
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params, t, type]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem(
      {
        id: product.id,
        type: type,
        name: product.name,
        price: product.discountPrice || product.price,
        imageUrl: product.imageUrl || '',
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/${locale}/cart`);
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (isProductInWishlist) {
      await removeFromWishlist(product.id, type.toUpperCase());
    } else {
      await addToWishlist(product.id, type.toUpperCase());
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getDiscountPercentage = () => {
    if (!product || !product.discountPrice || !product.price) return null;
    const discount = Math.round(
      ((product.price - product.discountPrice) / product.price) * 100
    );
    return discount > 0 ? discount : null;
  };

  const discountPercentage = getDiscountPercentage();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            {error || t('errors.notFound')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {t('errors.productNotExist')}
          </p>
          <Link
            href={`/${locale}/${type}s`}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t('categoryPage.backTo', {
              type:
                type === 'component'
                  ? t('components.name')
                  : t('components.peripherals'),
            })}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {' '}
      <div className="mb-6 flex justify-start">
        <Button
          href={`/${locale}/${type}s/${product.category || ''}`}
          title={t('categoryPage.backTo', {
            type:
              type === 'component'
                ? t('components.components')
                : t('components.peripherals'),
          })}
          direction="left"
          className="inline-block text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
        />
      </div>
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product image */}
          <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center relative">
            {discountPercentage && (
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <Tag size={12} className="mr-1" />
                  {t('shop.product.offBadge', {
                    percentage: discountPercentage,
                  })}
                </span>
              </div>
            )}
            <img
              src={(product?.imageUrl || defaultImageUrl).trim()}
              alt={product?.name}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Product details */}
          <div className="flex flex-col">
            <div className="mb-4">
              {' '}
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100/80 text-blue-800 dark:bg-red-900/30 dark:text-red-300 rounded-md mb-2">
                {product.category ||
                  (type === 'component'
                    ? t('components.components')
                    : t('components.peripherals'))}
              </span>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                {product.name}
              </h1>
              <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                {product.description}
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                {product &&
                  product.price !== undefined &&
                  (product.discountPrice ? (
                    <>
                      <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                        €{(product.discountPrice || 0).toFixed(2)}
                      </span>
                      <span className="ml-2 text-lg text-neutral-500 dark:text-neutral-400 line-through">
                        €{product.price.toFixed(2)}
                      </span>{' '}
                      <span className="ml-2 px-2 py-1 bg-blue-100/80 text-blue-800 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium rounded-md">
                        {t('product.saveAmount')} €
                        {(product.price - (product.discountPrice || 0)).toFixed(
                          2
                        )}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                      €{product.price.toFixed(2)}
                    </span>
                  ))}
              </div>{' '}
              <div
                className={`inline-flex items-center px-2 py-1 rounded text-sm ${
                  product.stock <= 0
                    ? 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : product.stock <= 3
                      ? 'bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                }`}
              >
                {product.stock > 0 ? (
                  product.stock <= 3 ? (
                    t('product.onlyFewLeft')
                  ) : (
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      {t('product.inStock')}
                    </span>
                  )
                ) : (
                  <span className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    {t('product.outOfStock')}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity selector and buttons */}
            <div className="flex flex-col space-y-4 mt-auto">
              <div className="flex items-center">
                <span className="mr-4 text-neutral-700 dark:text-neutral-300">
                  {t('product.quantity')}:
                </span>
                <div className="flex items-center border border-neutral-300 dark:border-neutral-600 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    disabled={quantity <= 1}
                    aria-label={t('product.decreaseQuantity')}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-neutral-900 dark:text-white min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-3 py-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    disabled={quantity >= product.stock}
                    aria-label={t('product.increaseQuantity')}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 dark:bg-red-500 hover:bg-blue-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-red-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  {t('buttons.addToCart')}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex items-center justify-center py-3 px-4 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-stone-950 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-red-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {t('product.buyNow')}
                </button>
              </div>

              <div className="flex space-x-4">
                <button
                  className={`flex items-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 ${
                    isProductInWishlist ? 'text-red-600 dark:text-red-400' : ''
                  }`}
                  onClick={handleWishlistToggle}
                >
                  <Heart
                    size={18}
                    className="mr-1"
                    fill={isProductInWishlist ? 'currentColor' : 'none'}
                  />
                  <span className="text-sm">
                    {isProductInWishlist
                      ? t('shop.product.removeFromWishlist')
                      : t('buttons.addToWishlist')}
                  </span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={18} className="mr-1" />
                      <span className="text-sm">{t('product.copied')}</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={18} className="mr-1" />
                      <span className="text-sm">{t('product.share')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Shipping information */}
            <div className="mt-8 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center">
                <Truck size={16} className="mr-2" />
                <span>{t('product.freeShipping')}</span>
              </div>
              <div className="flex items-center">
                <Shield size={16} className="mr-2" />
                <span>{t('product.warrantyIncluded')}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span>{t('product.estimatedDelivery')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for more information */}
        <div className="border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex border-b border-neutral-200 dark:border-neutral-700">
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'description'
                  ? 'border-blue-600 text-blue-600 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('description')}
            >
              {t('product.tabs.description')}
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'specifications'
                  ? 'border-blue-600 text-blue-600 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('specifications')}
            >
              {t('product.tabs.specifications')}
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              {t('product.tabs.reviews')}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-3xl mx-auto">
                {product.specifications &&
                Object.keys(product.specifications).length > 0 ? (
                  <SpecificationsTable
                    specifications={product.specifications}
                    isExpanded={true}
                    toggleExpand={() => {}}
                  />
                ) : (
                  <p className="text-center text-neutral-500 dark:text-neutral-400">
                    {t('product.noSpecifications')}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewSystem
                productId={product.id}
                productType={type.toUpperCase() as 'COMPONENT' | 'PERIPHERAL'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
