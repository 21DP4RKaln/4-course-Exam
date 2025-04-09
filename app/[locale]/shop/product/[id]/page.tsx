'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/app/contexts/CartContext'
import { 
  ArrowLeft, 
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Clock,
  ChevronDown,
  Star,
  Cpu,
  Monitor,
  HardDrive,
  Layers,
  Fan,
  Zap,
  Server,
  AlertTriangle,
  Eye
} from 'lucide-react'
import type { PC, PCWithRelated } from '@/lib/services/shopService'

export default function ProductDetailsPage() {
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
  const [product, setProduct] = useState<PCWithRelated | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
 
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/shop/product/${productId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found')
          } else {
            setError('Failed to load product')
          }
          return
        }
        
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Failed to load product. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [productId])

  // Handle loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
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
            href={`/${locale}/shop/ready-made`}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      type: 'configuration',
      name: product.name,
      price: product.discountPrice || product.price,
      imageUrl: product.imageUrl ?? ''
    }, quantity)
  }
  
  const handleBuyNow = () => {
    handleAddToCart()
    router.push(`/${locale}/cart`)
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/${locale}/shop/ready-made`}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to all PCs
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product image */}
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-lg">
              PC Image
            </span>
          </div>
          
          {/* Product details */}
          <div className="flex flex-col">
            <div className="mb-4">
              {product.category && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md mb-2">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      size={16} 
                      className={i < Math.floor(product.ratings?.average || 0) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300 dark:text-gray-600"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.ratings?.average.toFixed(1)} ({product.ratings?.count} reviews)
                </span>
              </div>
              
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
            <div className="mb-6">
              <button
                onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Quick Specifications
                </span>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-500 transform transition-transform ${isSpecsOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {isSpecsOpen && (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.specs.cpu && (
                    <div className="flex items-center">
                      <Cpu size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.specs.cpu}
                      </span>
                    </div>
                  )}
                  {product.specs.gpu && (
                    <div className="flex items-center">
                      <Monitor size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.specs.gpu}
                      </span>
                    </div>
                  )}
                  {product.specs.ram && (
                    <div className="flex items-center">
                      <HardDrive size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.specs.ram}
                      </span>
                    </div>
                  )}
                  {product.specs.storage && (
                    <div className="flex items-center">
                      <HardDrive size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.specs.storage}
                      </span>
                    </div>
                  )}
                  {product.specs.psu && (
                    <div className="flex items-center">
                      <Zap size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.specs.psu}
                      </span>
                    </div>
                  )}
                  {product.specs.motherboard && (
                    <div className="flex items-center">
                      <Server size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.specs.motherboard}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
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
                <span>Free shipping on orders over €1000</span>
              </div>
              <div className="flex items-center">
                <Shield size={16} className="mr-2" />
                <span>2 years warranty included</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span>Estimated delivery: 3-5 business days</span>
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
              Reviews ({product.ratings?.count || 0})
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{product.longDescription || product.description}</p>
              </div>
            )}
            
            {activeTab === 'specifications' && (
              <div className="max-w-3xl mx-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key}>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 w-1/3 capitalize">
                          {key}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
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
                        Based on {product.ratings?.count || 0} reviews
                      </span>
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Write a Review
                  </button>
                </div>
                
                {/* Sample reviews - in a real app these would come from the database */}
                <div className="space-y-6">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-400 font-semibold">
                          JD
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            John Doe
                          </h4>
                          <time className="text-xs text-gray-500 dark:text-gray-400">
                            March 15, 2025
                          </time>
                        </div>
                        <div className="flex items-center mt-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              size={14} 
                              className={i < 5 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-gray-300 dark:text-gray-600"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Absolutely amazing PC! Performance is incredible and it handles all my games at max settings without breaking a sweat. Build quality is excellent and it arrived well-packaged. Highly recommended!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                          AS
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Anna Smith
                          </h4>
                          <time className="text-xs text-gray-500 dark:text-gray-400">
                            March 10, 2025
                          </time>
                        </div>
                        <div className="flex items-center mt-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              size={14} 
                              className={i < 4 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-gray-300 dark:text-gray-600"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Great PC with excellent performance. Setup was easy and everything worked perfectly out of the box. The only minor issue is that it runs a bit louder than expected under heavy load, but the cooling keeps temperatures perfectly under control.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <button className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium">
                      Load More Reviews
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Related products */}
      {product.related && product.related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Products
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.related.map((pc) => (
              <div 
                key={pc.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* PC image (placeholder) */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    PC Image
                  </span>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    <Link 
                      href={`/${locale}/shop/product/${pc.id}`}
                      className="hover:text-red-600 dark:hover:text-red-400"
                    >
                      {pc.name}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                    {pc.description}
                  </p>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      {pc.discountPrice ? (
                        <div>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            €{pc.discountPrice.toFixed(2)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                            €{pc.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          €{pc.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => addItem({
                        id: pc.id,
                        type: 'configuration',
                        name: pc.name,
                        price: pc.discountPrice || pc.price,
                        imageUrl: pc.imageUrl ?? ''
                      })}
                      className="p-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}