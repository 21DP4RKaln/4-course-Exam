'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import WishlistTab from '@/app/components/Dashboard/WishlistTab'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'
import { 
  User, 
  Package, 
  Cpu,
  Clock,
  Settings,
  Heart
} from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs'
import { getUserConfigurations, getUserOrders, type UserConfiguration, type UserOrder } from '@/lib/services/dashboardService'
import ProfileTab from '@/app/components/Dashboard/Dashboard'

export default function DashboardPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  
  const { user, isAuthenticated, loading } = useAuth()

  const [activeTab, setActiveTab] = useState(
    tabParam === 'profile' ? 'profile' : 
    tabParam === 'orders' ? 'orders' : 'configurations'
  )
  
  const locale = pathname.split('/')[1]
  
  const [configurations, setConfigurations] = useState<UserConfiguration[]>([])
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (user?.role === 'ADMIN') {
        router.push(`/${locale}/admin`)
      } else if (user?.role === 'SPECIALIST') {
        router.push(`/${locale}/specialist`)
      }
    }
  }, [isAuthenticated, loading, router, locale, pathname, user?.role])

  useEffect(() => {
    if (!isAuthenticated || loading || user?.role !== 'USER') return;

    const fetchData = async () => {
      setDataLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'configurations') {
          const configData = await getUserConfigurations(user!.id);
          setConfigurations(configData);
        } else if (activeTab === 'orders') {
          const orderData = await getUserOrders(user!.id);
          setOrders(orderData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, isAuthenticated, loading, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    )
  }
 
  if (!isAuthenticated || user?.role !== 'USER') {
    return null 
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale, { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    const statusColors = {
      // Configuration statuses
      'DRAFT': 'bg-gray-100 text-stone-950 dark:bg-stone-950 dark:text-gray-300',
      'SUBMITTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      // Order statuses
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'PROCESSING': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
    
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-stone-950'
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
 
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', value);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          {t('dashboard.title')}
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.welcome')},
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user?.name || user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-xl shadow-md overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <TabsTrigger 
              value="configurations"
              className="flex-1 py-4 px-4 text-sm font-medium"
            >
              <Cpu size={18} className="mr-2" />
              {t('dashboard.myConfigurations')}
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="flex-1 py-4 px-4 text-sm font-medium"
            >
              <Package size={18} className="mr-2" />
              {t('dashboard.myOrders')}
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="flex-1 py-4 px-4 text-sm font-medium"
            >
              <User size={18} className="mr-2" />
              {t('dashboard.profile')}
            </TabsTrigger>
            <TabsTrigger 
              value="wishlist"
              className="flex-1 py-4 px-4 text-sm font-medium"
            >
              <Heart size={18} className="mr-2" />
              {t('dashboard.wishlist')}
            </TabsTrigger>
          </TabsList>
          
          {/* My Configurations Tab */}
          <TabsContent value="configurations" className="p-6">
            {dataLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mr-3"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading configurations...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => handleTabChange('configurations')}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : configurations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('dashboard.noConfigurations')}
                </p>
                <button
                  onClick={() => router.push(`/${locale}/configurator`)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {t('nav.configurator')}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('dashboard.myConfigurations')}
                  </h2>
                  <button
                    onClick={() => router.push(`/${locale}/configurator`)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    + New Configuration
                  </button>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {configurations.map((config) => (
                    <div key={config.id} className="py-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-3 md:mb-0">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {config.name}
                            </h3>
                            <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(config.status)}`}>
                              {config.status}
                            </span>
                          </div>
                          {config.description && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {config.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock size={14} className="mr-1" />
                            {formatDate(config.createdAt)}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            €{config.totalPrice.toFixed(2)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/${locale}/configurator?edit=${config.id}`)}
                              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              Edit
                            </button>
                            {config.status === 'APPROVED' && (
                              <button
                                onClick={() => router.push(`/${locale}/shop/product/${config.id}`)}
                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                              >
                                Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* My Orders Tab */}
          <TabsContent value="orders" className="p-6">
            {dataLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mr-3"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading orders...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => handleTabChange('orders')}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('dashboard.noOrders')}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.myOrders')}
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Configuration
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-stone-950 divide-y divide-gray-200 dark:divide-gray-700">
                      {orders.map((order) => (
                        <tr 
                          key={order.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => router.push(`/${locale}/orders/${order.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {order.configurationName || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            €{order.totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="p-6">
            <ProfileTab />
          </TabsContent>
            
            {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="p-6">
            <WishlistTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}