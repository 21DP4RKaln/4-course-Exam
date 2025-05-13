'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/app/contexts/CartContext'
import { useAuth } from '@/app/contexts/AuthContext'
import SpecificationsTable from '../Shop/SpecificationsTable'
import { useProductView } from '@/app/hooks/useProductView'
import ReviewSystem from '../ReviewSystem/ReviewSystem'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'
import { 
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Copy
} from 'lucide-react'
import AnimatedButton from '@/app/components/ui/animated-button'

interface ProductCommonProps {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stock: number;
  longDescription?: string;
  ratings?: {
    average: number;
    count: number;
  };
}

interface ConfigurationProduct extends ProductCommonProps {
  type: 'configuration';
  components: any[];
}

interface ComponentProduct extends ProductCommonProps {
  type: 'component';
  category: string;
  specifications: Record<string, string>;
}

interface PeripheralProduct extends ProductCommonProps {
  type: 'peripheral';
  category: string;
  specifications: Record<string, string>;
}

type Product = ConfigurationProduct | ComponentProduct | PeripheralProduct;

interface UniversalProductPageProps {
  productId?: string;
}

export default function UniversalProductPage({ productId: propProductId }: UniversalProductPageProps) {
  const params = useParams()
  const routeProductId = params.id as string
  const productId = propProductId || routeProductId
  
  console.log("UniversalProductPage - params:", params);
  console.log("UniversalProductPage - routeProductId:", routeProductId);
  console.log("UniversalProductPage - propProductId:", propProductId);
  console.log("UniversalProductPage - final productId:", productId);
    
  const router = useRouter()
  const t = useTranslations('product')
  const tNav = useTranslations('nav')
  const tButtons = useTranslations('buttons')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const { addItem } = useCart()
  const { user, isAuthenticated } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [referrer, setReferrer] = useState<string | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [copied, setCopied] = useState(false)

  const defaultImageUrl = '/images/Default-image.png'

  useProductView(productId, product?.type)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ref = document.referrer;
      const origin = window.location.origin;
      if (ref.startsWith(origin)) {
        setReferrer(ref.substring(origin.length));
      }
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError(t('productIdMissing'));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // First try to fetch from shop/product for configurations
        let response = await fetch(`/api/shop/product/${productId}`);
        
        if (response.status === 404) {
          // If not found, try components
          response = await fetch(`/api/shop/product/components/${productId}`);
          if (response.status === 404) {
            // Finally try peripherals
            response = await fetch(`/api/shop/product/peripherals/${productId}`);
          }
        }

        if (!response.ok) {
          if (response.status === 404) {
            setError(t('productNotFound'));
          } else {
            setError(t('failedToLoad'));
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object' || !data.name) {
          throw new Error(t('invalidProductData'));
        }
        
        setProduct(data);
      
        if (isAuthenticated) {
          checkWishlistStatus();
        }
        
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : t('failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    } else {
      setError(t('productIdMissing'));
      setLoading(false);
    }
  }, [productId, isAuthenticated, t]);

  const checkWishlistStatus = async () => {
    if (!isAuthenticated || !productId || !product) return;
    
    try {
      const response = await fetch(`/api/wishlist/check?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.isWishlisted);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      type: product.type,
      name: product.name,
      price: product.discountPrice || product.price,
      imageUrl: product.imageUrl ?? defaultImageUrl
    }, quantity);
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/${locale}/cart`);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (!product) return;

    try {
      const response = await fetch('/api/wishlist', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productType: product.type.toUpperCase()
        }),
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  };

  const getBackLink = () => {
    if (referrer) {
      return referrer;
    }
 
    if (!product) return `/${locale}/shop`;
    
    switch (product.type) {
      case 'configuration':
        return `/${locale}/shop/ready-made`;
      case 'component':
        return `/${locale}/components`;
      case 'peripheral':
        return `/${locale}/peripherals`;
      default:
        return `/${locale}/shop`;
    }
  };
 
  const renderSpecificationsSection = () => {
    if (!product) return null;
    
    if (product.type === 'configuration') { 
      const configProduct = product as ConfigurationProduct;
      return (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('components')}</h3>
          <div className="space-y-4">
            {configProduct.components.map((component) => (
              <div key={component.id} className="p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{component.name}</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{component.category}</p>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">€{component.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (product.type === 'component' || product.type === 'peripheral') {
      const componentProduct = product as ComponentProduct | PeripheralProduct;
      const specs = componentProduct.specifications || {};
      
      return (
        <div className="max-w-3xl mx-auto">
          {Object.keys(specs).length > 0 ? (
            <SpecificationsTable 
              specifications={specs}
              isExpanded={true}
              toggleExpand={() => {}}
            />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              {t('noSpecifications')}
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };
 
  const getCategoryDisplay = () => {
    if (!product) return '';
    
    if (product.type === 'configuration') {
      return t('pcConfiguration');
    } else if (product.type === 'component' || product.type === 'peripheral') {
      return (product as ComponentProduct | PeripheralProduct).category;
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || t('productNotFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('productRemovedText')}
          </p>          <Link href={getBackLink()}>
            <AnimatedButton 
              title={t('backToShop')} 
              direction="left" 
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href={getBackLink()}>
          <AnimatedButton 
            title={t('backToShop')} 
            direction="left" 
          />
        </Link>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product image */}
          <div className="flex items-center justify-center">
            <img 
              src={(product?.imageUrl || defaultImageUrl).trim()} 
              alt={product?.name} 
              className="h-full w-full object-contain"
            />
          </div>
          
          {/* Product details */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="badge badge-destructive mb-2">
                {getCategoryDisplay()}
              </span>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {product.description}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                {product.discountPrice ? (
                  <>
                    <span className="product-price-display">
                      €{product.discountPrice.toFixed(2)}
                    </span>
                    <span className="product-price-original">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className="product-discount-badge">
                      {t('saveAmount', { amount: (product.price - (product.discountPrice || 0)).toFixed(2) })}
                    </span>
                  </>
                ) : (
                  <span className="product-price-display">
                    €{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              <div className={`product-stock-badge ${
                product.stock <= 3 ? 'product-stock-low' : 
                product.stock > 0 ? 'product-stock-in' : 'product-stock-out'
              }`}>
                {product.stock > 0 
                  ? (product.stock <= 3 ? t('onlyLeft', { count: product.stock }) : t('inStock')) 
                  : t('outOfStock')}
              </div>
            </div>
            
            {/* Quantity selector and buttons */}
            <div className="flex flex-col space-y-4 mt-auto">
              <div className="flex items-center">
                <span className="mr-4 text-gray-700 dark:text-gray-300">{t('quantity')}:</span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="product-quantity-btn"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-gray-900 dark:text-white min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="product-quantity-btn"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn btn-primary"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  {t('addToCart')}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="btn btn-secondary"
                >
                  {t('buyNow')}
                </button>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={handleWishlistToggle}
                  className={`action-button ${
                    isWishlisted ? 'text-red-600 dark:text-red-400' : ''
                  }`}
                >
                  <Heart size={18} className={`mr-1 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span className="text-sm">{isWishlisted ? t('saved') : t('addToWishlist')}</span>
                </button>
                
                <button 
                  onClick={handleShare}
                  className="action-button"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={18} className="mr-1" />
                      <span className="text-sm">{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={18} className="mr-1" />
                      <span className="text-sm">{t('share')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Shipping information */}
            <div className="mt-8 space-y-3">
              <div className="product-info-icon">
                <Truck size={16} className="mr-2" />
                <span>{t('freeShippingOver100')}</span>
              </div>
              <div className="product-info-icon">
                <Shield size={16} className="mr-2" />
                <span>{t('yearsWarranty', { years: 2 })}</span>
              </div>
              <div className="product-info-icon">
                <Clock size={16} className="mr-2" />
                <span>{t('deliveryTime')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for more information */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`product-tab ${
                activeTab === 'description' ? 'product-tab-active' : 'product-tab-inactive'
              }`}
              onClick={() => setActiveTab('description')}
            >
              {t('description')}
            </button>
            <button
              className={`product-tab ${
                activeTab === 'specifications' ? 'product-tab-active' : 'product-tab-inactive'
              }`}
              onClick={() => setActiveTab('specifications')}
            >
              {t('specifications')}
            </button>
            <button
              className={`product-tab ${
                activeTab === 'reviews' ? 'product-tab-active' : 'product-tab-inactive'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              {t('reviews')}
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="product-description">
                <p className="whitespace-pre-line">{product.longDescription || product.description}</p>
              </div>
            )}
            
            {activeTab === 'specifications' && renderSpecificationsSection()}
            
            {activeTab === 'reviews' && (
              <ReviewSystem 
                productId={product.id} 
                productType={product.type.toUpperCase() as 'CONFIGURATION' | 'COMPONENT' | 'PERIPHERAL'} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}