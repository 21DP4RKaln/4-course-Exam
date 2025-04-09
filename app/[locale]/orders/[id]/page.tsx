'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  MapPin,
  Calendar,
  CreditCard,
  ChevronDown
} from 'lucide-react'

const mockOrders = [
  {
    id: 'ord-1',
    status: 'COMPLETED',
    totalAmount: 2499,
    items: [
      {
        id: 'pc1',
        name: 'Gaming Beast',
        type: 'configuration',
        price: 2499,
        quantity: 1,
      }
    ],
    shippingAddress: {
      fullName: 'John Doe',
      address: '123 Main Street',
      city: 'Riga',
      postalCode: 'LV-1050',
      country: 'Latvia',
      email: 'john.doe@example.com',
      phone: '+371 12345678'
    },
    paymentMethod: 'card',
    trackingNumber: 'LV12345678',
    createdAt: '2025-03-20T10:30:00Z',
    updatedAt: '2025-03-22T14:45:00Z',
    estimatedDelivery: '2025-03-25T00:00:00Z',
    deliveredAt: '2025-03-24T09:15:00Z',
    timeline: [
      {
        status: 'ORDER_PLACED',
        date: '2025-03-20T10:30:00Z',
        description: 'Order placed'
      },
      {
        status: 'PAYMENT_CONFIRMED',
        date: '2025-03-20T10:35:00Z',
        description: 'Payment confirmed'
      },
      {
        status: 'PROCESSING',
        date: '2025-03-21T08:45:00Z',
        description: 'Order processing'
      },
      {
        status: 'SHIPPED',
        date: '2025-03-22T14:45:00Z',
        description: 'Order shipped via Omniva'
      },
      {
        status: 'DELIVERED',
        date: '2025-03-24T09:15:00Z',
        description: 'Order delivered'
      }
    ]
  },
  {
    id: 'ord-2',
    status: 'PROCESSING',
    totalAmount: 1249,
    items: [
      {
        id: 'pc3',
        name: 'Office PC',
        type: 'configuration',
        price: 899,
        quantity: 1,
      },
      {
        id: 'comp-1',
        name: 'Extra RAM 16GB',
        type: 'component',
        price: 89,
        quantity: 2,
      }
    ],
    shippingAddress: {
      fullName: 'Jane Smith',
      address: '456 Oak Street',
      city: 'Riga',
      postalCode: 'LV-1011',
      country: 'Latvia',
      email: 'jane.smith@example.com',
      phone: '+371 98765432'
    },
    paymentMethod: 'paypal',
    trackingNumber: null,
    createdAt: '2025-04-01T15:20:00Z',
    updatedAt: '2025-04-02T09:30:00Z',
    estimatedDelivery: '2025-04-06T00:00:00Z',
    deliveredAt: null,
    timeline: [
      {
        status: 'ORDER_PLACED',
        date: '2025-04-01T15:20:00Z',
        description: 'Order placed'
      },
      {
        status: 'PAYMENT_CONFIRMED',
        date: '2025-04-01T15:25:00Z',
        description: 'Payment confirmed'
      },
      {
        status: 'PROCESSING',
        date: '2025-04-02T09:30:00Z',
        description: 'Order processing'
      }
    ]
  }
]

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname])

  const order = mockOrders.find(order => order.id === params.id)
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link 
            href={`/${locale}/dashboard`}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale, { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale, { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    }).format(date)
  }
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'PROCESSING':
        return <Clock className="h-8 w-8 text-blue-500" />
      case 'PENDING':
        return <Clock className="h-8 w-8 text-amber-500" />
      case 'CANCELLED':
        return <XCircle className="h-8 w-8 text-red-500" />
      default:
        return <Package className="h-8 w-8 text-gray-500" />
    }
  }
  
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }
  
  const getTimelineStatusClass = (status: string, index: number, length: number) => {
    // Completed step
    if (index < order.timeline.length) {
      return 'bg-blue-600 dark:bg-blue-500'
    }
    // Current step
    if (index === order.timeline.length) {
      return 'border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-800'
    }
    // Future step
    return 'bg-gray-200 dark:bg-gray-700'
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/${locale}/dashboard`}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="mr-4">
                {getStatusIcon(order.status)}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order #{order.id}
                </h1>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                <FileText size={18} className="mr-2" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
        
        {/* Order timeline */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Status
          </h2>
          
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute left-5 top-5 ml-2.5 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            {/* Timeline steps */}
            <div className="space-y-8">
              {order.timeline.map((step, index) => (
                <div key={index} className="relative flex items-start">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index < order.timeline.length ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  } shrink-0 z-10`}>
                    {index === order.timeline.length - 1 && order.status === 'COMPLETED' ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white dark:text-white">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                      {step.description}
                    </h3>
                    <time className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(step.date)}
                    </time>
                  </div>
                </div>
              ))}
              
              {/* Estimated delivery if not delivered yet */}
              {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                <div className="relative flex items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 z-10">
                    <span className="text-gray-600 dark:text-gray-400">{order.timeline.length + 1}</span>
                  </div>
                  
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                      Estimated Delivery
                    </h3>
                    <time className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateShort(order.estimatedDelivery)}
                    </time>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Order details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order summary */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item, index) => (
                    <li key={index} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {item.type === 'component' ? 'Part' : 'PC'}
                          </span>
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            €{item.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">
                      €{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white">Free</span>
                  </div>
                  
                  <div className="flex justify-between font-medium mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      €{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shipping and payment info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping & Payment
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Shipping Address
                    </h3>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Payment Method
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
              
              {order.trackingNumber && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-start">
                    <Truck className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Tracking Information
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Tracking #: {order.trackingNumber}
                      </p>
                      <a 
                        href="#" 
                        className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Track Package
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional details section */}
          <div className="mt-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">
                Additional Details
              </span>
              <ChevronDown 
                size={20} 
                className={`text-gray-500 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {showDetails && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Contact Information
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email: {order.shippingAddress.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone: {order.shippingAddress.phone}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Order Dates
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Order Placed: {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated: {formatDate(order.updatedAt)}
                    </p>
                    {order.deliveredAt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Delivered On: {formatDate(order.deliveredAt)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Need Help?
                  </h3>
                  <div className="flex space-x-4">
                    <a 
                      href="#" 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Contact Support
                    </a>
                    <a 
                      href="#" 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Return Policy
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}