'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import ProfileTab from '@/app/components/Dashboard/ProfileTab'
import {
  User,
  Users,
  Package,
  Cpu,
  ShoppingCart,
  Settings,
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserCog
} from 'lucide-react'

type TabType = 'users' | 'orders' | 'components' | 'configurations'

export default function AdminPanelPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [deleteLoading, setDeleteLoading] = useState<{id: string, type: string} | null>(null)

  interface UserType {
    id: string;
    name: string;
    email: string;
    role: string;
    orderCount?: number;
    createdAt: string;
  }

  const [users, setUsers] = useState<UserType[]>([])
  interface OrderType {
    id: string;
    userName: string;
    email: string;
    status: string;
    totalAmount: number;
  }

  const [orders, setOrders] = useState<OrderType[]>([])
  interface ConfigurationType {
    id: string;
    name: string;
    userName: string;
    status: string;
    totalPrice?: number;
  }

  const [configurations, setConfigurations] = useState<ConfigurationType[]>([])
  interface ComponentType {
    id: string;
    name: string;
    category: string;
    price?: number;
    stock?: number;
  }

  const [components, setComponents] = useState<ComponentType[]>([])

  const [showProfileSettings, setShowProfileSettings] = useState(false)

  const toggleProfileSettings = () => {
    setShowProfileSettings(!showProfileSettings)
  }

  const [tabLoading, setTabLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      const isProfilePage = pathname.includes('/dashboard') && 
                            new URLSearchParams(window.location.search).get('tab') === 'profile';

      if (!isProfilePage) {
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isAuthenticated, loading, router, locale, pathname, user?.role]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;

    const fetchData = async () => {
      setTabLoading(true);
      setError(null);
      
      try {
        let endpoint = '';
        
        switch (activeTab) {
          case 'users':
            endpoint = '/api/admin';
            const usersResponse = await fetch(endpoint);
            
            if (!usersResponse.ok) {
              const errorText = await usersResponse.text();
              throw new Error(`Failed to fetch users: ${usersResponse.status} ${errorText}`);
            }
            
            const usersData = await usersResponse.json();
            setUsers(usersData);
            break;
            
          case 'orders':
            endpoint = '/api/admin/orders';
            const ordersResponse = await fetch(endpoint);
            
            if (!ordersResponse.ok) {
              const errorText = await ordersResponse.text();
              throw new Error(`Failed to fetch orders: ${ordersResponse.status} ${errorText}`);
            }
            
            const ordersData = await ordersResponse.json();
            setOrders(ordersData);
            break;
            
          case 'configurations':
            endpoint = '/api/admin/configurations';
            const configsResponse = await fetch(endpoint);
            
            if (!configsResponse.ok) {
              const errorText = await configsResponse.text();
              throw new Error(`Failed to fetch configurations: ${configsResponse.status} ${errorText}`);
            }
            
            const configsData = await configsResponse.json();
            setConfigurations(configsData);
            break;
            
          case 'components':
            endpoint = '/api/admin/components';
            const componentsResponse = await fetch(endpoint);
            
            if (!componentsResponse.ok) {
              const errorText = await componentsResponse.text();
              throw new Error(`Failed to fetch components: ${componentsResponse.status} ${errorText}`);
            }
            
            const componentsData = await componentsResponse.json();
            setComponents(componentsData);
            break;
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data. Please try again later.');
      } finally {
        setTabLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, isAuthenticated, user?.role]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }
  
  if (!isAuthenticated || user?.role !== 'ADMIN') {
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
 
  const filteredData = {
    users: users.filter(user => 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    orders: orders.filter(order => 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    configurations: configurations.filter(config => 
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.userName.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    components: components.filter(component => 
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const getCurrentItems = () => {
    const currentItems = filteredData[activeTab]
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return currentItems.slice(indexOfFirstItem, indexOfLastItem)
  }
  
  const totalPages = Math.ceil(filteredData[activeTab].length / itemsPerPage)
  
  const getStatusColor = (status: string) => {
    const statusColors = {
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'PROCESSING': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'DRAFT': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'SUBMITTED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
    
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }
  
  const getRoleColor = (role: string) => {
    const roleColors = {
      'ADMIN': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'SPECIALIST': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'USER': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
    
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
  }

  const handleCreate = (type: TabType) => {
    switch (type) {
      case 'components':
        router.push(`/${locale}/admin/components/create`);
        break;
      case 'configurations':
        router.push(`/${locale}/admin/configurations/create`);
        break;
      case 'users':
        alert('Create user functionality is not implemented yet');
        break;
      case 'orders':
        alert('Create order functionality is not implemented yet');
        break;
    }
  };

  const handleDelete = async (id: string, type: TabType) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      setDeleteLoading({ id, type });
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Failed to delete ${type} item`);
      }
 
      switch (type) {
        case 'users':
          setUsers(users.filter(user => user.id !== id));
          break;
        case 'orders':
          setOrders(orders.filter(order => order.id !== id));
          break;
        case 'configurations':
          setConfigurations(configurations.filter(config => config.id !== id));
          break;
        case 'components':
          setComponents(components.filter(component => component.id !== id));
          break;
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      alert(error.message || 'Failed to delete item. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (id: string, type: TabType) => {
    router.push(`/${locale}/admin/${type}/edit/${id}`);
  };

  const handleView = (id: string, type: TabType) => {
    router.push(`/${locale}/admin/${type}/view/${id}`);
  };

  const navigateToProfile = () => {
    router.push(`/${locale}/dashboard?tab=profile`);
  };
  
  const renderTabContent = () => {
    const items = getCurrentItems();
    
    if (tabLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mr-3"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading data...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-8">
          <AlertTriangle size={32} className="mx-auto text-red-500 mb-2" />
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }
    
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
          <p className="text-gray-600 dark:text-gray-400">No items found. Try adjusting your search query.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {activeTab === 'users' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              
              {activeTab === 'orders' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              
              {activeTab === 'configurations' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Configuration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Creator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              
              {activeTab === 'components' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Component</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {activeTab === 'users' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name || 'Anonymous'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(item.role)}`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.orderCount || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleView(item.id, 'users')}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                          onClick={() => handleEdit(item.id, 'users')}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, 'users')}
                          disabled={deleteLoading?.id === item.id && deleteLoading?.type === 'users'}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          {deleteLoading?.id === item.id && deleteLoading?.type === 'users' ? (
                            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-red-600 dark:border-red-400 rounded-full"></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </>
                )}
                
                {activeTab === 'orders' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.userName || item.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">€{item.totalAmount?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleView(item.id, 'orders')}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                          onClick={() => handleEdit(item.id, 'orders')}
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
                
                {activeTab === 'configurations' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">€{item.totalPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleView(item.id, 'configurations')}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                          onClick={() => handleEdit(item.id, 'configurations')}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, 'configurations')}
                          disabled={deleteLoading?.id === item.id && deleteLoading?.type === 'configurations'}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          {deleteLoading?.id === item.id && deleteLoading?.type === 'configurations' ? (
                            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-red-600 dark:border-red-400 rounded-full"></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </>
                )}
                
                {activeTab === 'components' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">€{item.price?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleView(item.id, 'components')}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                          onClick={() => handleEdit(item.id, 'components')}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                          onClick={() => handleDelete(item.id, 'components')}
                          disabled={deleteLoading?.id === item.id && deleteLoading?.type === 'components'}
                        >
                          {deleteLoading?.id === item.id && deleteLoading?.type === 'components' ? (
                            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-red-600 dark:border-red-400 rounded-full"></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={toggleProfileSettings}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
          >
            <UserCog size={18} className="mr-2" />
            {showProfileSettings ? "Back to Admin" : "Profile Settings"}
          </button>
          {!showProfileSettings && (
            <>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md ${activeTab === 'users' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md ${activeTab === 'orders' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('configurations')}
            className={`px-4 py-2 rounded-md ${activeTab === 'configurations' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Configurations
          </button>
          <button 
            onClick={() => setActiveTab('components')}
            className={`px-4 py-2 rounded-md ${activeTab === 'components' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Components
          </button>
          </>
          )}
        </div>
      </div>
      {showProfileSettings ? (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Import and use the ProfileTab component directly */}
        <ProfileTab />
      </div>
    ) : (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Admin panel content... */}
      </div>
    )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between mb-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative flex-grow sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            
            {/* Add button with proper handler */}
            {(activeTab === 'components' || activeTab === 'configurations') && (
              <button 
                onClick={() => handleCreate(activeTab)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Plus size={18} className="mr-1" />
                {`Add ${activeTab.slice(0, -1)}`}
              </button>
            )}
          </div>
        </div>
        
        {renderTabContent()}
        
        {/* Pagination */}
        {filteredData[activeTab].length > itemsPerPage && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData[activeTab].length)} of {filteredData[activeTab].length} entries
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              
              <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}