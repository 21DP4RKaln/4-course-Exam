'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'
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

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string
  
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [showDetails, setShowDetails] = useState(false)
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname])

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
      }
    };

    if (isAuthenticated && !loading) {
      fetchOrderData();
    }
  }, [orderId, isAuthenticated, loading]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return null
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
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
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
        return <Clock className="h-8 w-8 text-red-500" />
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
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/${locale}/dashboard`}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Order #{orderId}</h1>
          <p>Order details content here...</p>
        </div>
      </div>
    </div>
  )
}