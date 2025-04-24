'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  User,
  Calendar,
  Mail,
  ShieldCheck,
  Package,
  Cpu,
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  Phone
} from 'lucide-react'

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string
  
  const router = useRouter()
  const t = useTranslations()
  const pathname = usePathname()
  const { user: currentUser, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!isAuthenticated || currentUser?.role !== 'ADMIN')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, currentUser?.role])

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'ADMIN') return

    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/users/${userId}`)
        
        if (!response.ok) {
          throw new Error(response.status === 404 
            ? 'User not found' 
            : 'Failed to fetch user details')
        }
        
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('Error fetching user:', error)
        setError('Failed to load user details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUser()
  }, [userId, isAuthenticated, currentUser?.role])
 
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
    return null
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'User Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The user you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link 
            href={`/${locale}/admin`}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Admin Panel
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
 
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete user');

      router.push(`/${locale}/admin`);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/${locale}/admin`}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Admin Panel
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center">
                {/* Profile image */}
                <div className="h-24 w-24 rounded-full overflow-hidden bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.name || 'User'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-red-600 dark:text-red-400" />
                  )}
                </div>
                
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.name || 'Anonymous User'}
                </h1>
                
                <div className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mb-4">
                  {user.role}
                </div>
                
                <div className="flex flex-col w-full text-sm text-gray-600 dark:text-gray-400 space-y-3 mt-2">
                  {user.email && (
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  
                  {user.phone && (
                    <div className="flex items-center">
                      <Phone size={16} className="mr-2" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>Registered: {formatDate(user.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Package size={16} className="mr-2" />
                    <span>Orders: {user.orderCount || 0}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Cpu size={16} className="mr-2" />
                    <span>Configurations: {user.configCount || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Link
                    href={`/${locale}/admin/users/edit/${userId}`}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center justify-center"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit User
                  </Link>
                  
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Orders & Details */}
        <div className="col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                User Details
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">First Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.firstName || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.lastName || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      {user.email || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Phone size={16} className="mr-2 text-gray-400" />
                      {user.phone || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center">
                      <ShieldCheck size={16} className="mr-2 text-gray-400" />
                      {user.role}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Orders
              </h2>
              
              {user.orders && user.orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {user.orders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {order.id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            €{order.totalAmount?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  This user has no orders yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}