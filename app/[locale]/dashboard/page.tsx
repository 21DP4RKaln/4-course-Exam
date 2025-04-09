'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { 
  User, 
  Package, 
  Cpu,
  Clock
} from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs'

interface Configuration {
  id: string
  name: string
  description?: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  totalPrice: number
  createdAt: string
}

interface Order {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  createdAt: string
  configurationName?: string
}

const mockConfigurations: Configuration[] = [
  {
    id: '1',
    name: 'Gaming Beast',
    description: 'High-end gaming PC with RTX 4080, i9 processor',
    status: 'APPROVED',
    totalPrice: 2499,
    createdAt: '2025-03-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Workstation Setup',
    description: 'For professional work and video editing',
    status: 'DRAFT',
    totalPrice: 1899,
    createdAt: '2025-04-02T14:45:00Z'
  },
  {
    id: '3',
    name: 'Budget Gaming',
    description: 'Affordable gaming PC with good performance',
    status: 'SUBMITTED',
    totalPrice: 899,
    createdAt: '2025-04-05T09:15:00Z'
  }
]

const mockOrders: Order[] = [
  {
    id: 'ord-1',
    status: 'COMPLETED',
    totalAmount: 2499,
    createdAt: '2025-03-20T10:30:00Z',
    configurationName: 'Gaming Beast'
  },
  {
    id: 'ord-2',
    status: 'PROCESSING',
    totalAmount: 1249,
    createdAt: '2025-04-01T15:20:00Z',
    configurationName: 'Office PC'
  }
]

export default function DashboardPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('configurations')
  const locale = pathname.split('/')[1]

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/auth/login`)
    }
  }, [isAuthenticated, loading, router, locale])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
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
      'DRAFT': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'SUBMITTED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      // Order statuses
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'PROCESSING': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
    
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          {t('dashboard.title')}
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.welcome')},
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user?.name || user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <Tabs defaultValue="configurations" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          </TabsList>
          
          {/* My Configurations Tab */}
          <TabsContent value="configurations" className="p-6">
            {mockConfigurations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('dashboard.noConfigurations')}
                </p>
                <button
                  onClick={() => router.push(`/${locale}/configurator`)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    + New Configuration
                  </button>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockConfigurations.map((config) => (
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
                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
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
            {mockOrders.length === 0 ? (
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
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {mockOrders.map((order) => (
                        <tr 
                          key={order.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => router.push(`/${locale}/orders/${order.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
            <div className="space-y-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <User size={20} className="mr-2" />
                Profile Information
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="form-label">
                      {t('auth.email')}
                    </label>
                    <input 
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="form-input bg-gray-100 dark:bg-gray-800"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">
                      {t('auth.name')}
                    </label>
                    <input 
                      type="text"
                      defaultValue={user?.name || ''}
                      className="form-input"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <button className="w-full mt-4 btn-primary">
                    Update Profile
                  </button>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Change Password
                </h2>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">
                        Current Password
                      </label>
                      <input 
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">
                        New Password
                      </label>
                      <input 
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">
                        Confirm New Password
                      </label>
                      <input 
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <button className="w-full mt-4 btn-primary">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}