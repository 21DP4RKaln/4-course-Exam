'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/app/contexts/CartContext'
import SpecificationsTable from '../Shop/SpecificationsTable';
import { useProductView } from '@/app/hooks/useProductView'
import { 
  ArrowLeft, 
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Clock,
  ChevronDown,
  AlertTriangle,
  Check,
  Info,
  Star
} from 'lucide-react'

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

// Specific properties for different product types
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

// Union type for all product types
type Product = ConfigurationProduct | ComponentProduct | PeripheralProduct;

export default function UniversalProductPage() {
  const params = useParams()
  const productId = params.id as string
    
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { addItem } = useCart()
  const locale = pathname.split('/')[1]
  
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [isSpecsOpen, setIsSpecsOpen] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [referrer, setReferrer] = useState<string | null>(null)

  useProductView(productId, product?.type)

  useEffect(() => {
    // Detect the referrer URL to use for the back button
    if (typeof window !== 'undefined') {
      const ref = document.referrer;
      const origin = window.location.origin;
      
      // Only set referrer if it's from the same origin
      if (ref.startsWith(origin)) {
        setReferrer(ref.substring(origin.length));
      }
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Universal product fetch endpoint
        console.log("Fetching product with ID:", productId);
        const response = await fetch(`/api/shop/product/${productId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log("Received product data:", data);
        
        if (!data || typeof data !== 'object' || !data.name) {
          throw new Error('Invalid product data received');
        }
        
        setProduct(data);
        
        // If there are related products, set them
        if (data.related && Array.isArray(data.related)) {
          setRelatedProducts(data.related);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    } else {
      setError('Product ID is missing');
      setLoading(false);
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      type: product.type || 'product', // Use the product's actual type if available
      name: product.name,
      price: product.discountPrice || product.price,
      imageUrl: product.imageUrl ?? ''
    }, quantity);
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/${locale}/cart`);
  };

  // Helper function to get the back link based on product type and referrer
  const getBackLink = () => {
    // If we have a referrer from the same site, use that
    if (referrer) {
      return referrer;
    }
    
    // Otherwise fall back to category-based links
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
  
  // Helper function to get specifications section based on product type
  const renderSpecificationsSection = () => {
    if (!product) return null;
    
    if (product.type === 'configuration') {
      const configProduct = product as ConfigurationProduct;
      return (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Components</h3>
          <div className="space-y-4">
            {configProduct.components.map((component) => (
              <div key={component.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
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
      // For component and peripheral
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
              No specifications available for this product.
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };

  // Helper function to get product category display name
  const getCategoryDisplay = () => {
    if (!product) return '';
    
    if (product.type === 'configuration') {
      return 'PC Configuration';
    } else if (product.type === 'component' || product.type === 'peripheral') {
      return (product as ComponentProduct | PeripheralProduct).category;
    }
    
    return '';
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Handle error state
  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Product Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            href={getBackLink()}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link 
          href={getBackLink()}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Shop
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product image */}
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-gray-500 dark:text-gray-400 text-lg">
                {getCategoryDisplay()}
              </span>
            )}
          </div>
          
          {/* Product details */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md mb-2">
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
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      €{product.discountPrice.toFixed(2)}
                    </span>
                    <span className="ml-2 text-lg text-gray-500 dark:text-gray-400 line-through">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium rounded-md">
                      Save €{(product.price - (product.discountPrice || 0)).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    €{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${
                product.stock <= 3 
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              }`}>
                {product.stock > 0 
                  ? (product.stock <= 3 ? `Only ${product.stock} left in stock` : 'In Stock') 
                  : 'Out of Stock'}
              </div>
            </div>
            
            {/* Quick overview of specs */}
            {product.type !== 'configuration' && (product as ComponentProduct).specifications && (
              <div className="mb-6">
                <button
                  onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Specifications
                  </span>
                  <ChevronDown 
                    size={20} 
                    className={`text-gray-500 transform transition-transform ${isSpecsOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isSpecsOpen && (
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
                    {Object.entries((product as ComponentProduct).specifications).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 capitalize">
                          {key}:
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Quantity selector and buttons */}
            <div className="flex flex-col space-y-4 mt-auto">
              <div className="flex items-center">
                <span className="mr-4 text-gray-700 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-gray-900 dark:text-white min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                  className="flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
              
              <div className="flex space-x-4">
                <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                  <Heart size={18} className="mr-1" />
                  <span className="text-sm">Add to Wishlist</span>
                </button>
                
                <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                  <Share2 size={18} className="mr-1" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
            
            {/* Shipping information */}
            <div className="mt-8 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Truck size={16} className="mr-2" />
                <span>Free shipping on orders over €100</span>
              </div>
              <div className="flex items-center">
                <Shield size={16} className="mr-2" />
                <span>2 years warranty included</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span>Estimated delivery: 1-3 business days</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for more information */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'description'
                  ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'specifications'
                  ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{product.longDescription || product.description}</p>
              </div>
            )}
            
            {activeTab === 'specifications' && renderSpecificationsSection()}
            
            {activeTab === 'reviews' && (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Customer Reviews
                    </h3>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            size={18} 
                            className={i < Math.floor(product.ratings?.average || 0) 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300 dark:text-gray-600"
                            }
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {product.ratings?.average.toFixed(1) || '0.0'} out of 5 ({product.ratings?.count || 0} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Write a Review
                  </button>
                </div>
                
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No reviews yet. Be the first to review this product!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}