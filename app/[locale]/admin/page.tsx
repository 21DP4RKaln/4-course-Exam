'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
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
  AlertTriangle
} from 'lucide-react'

// Types
type TabType = 'users' | 'orders' | 'components' | 'configurations'

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
}

interface OrderData {
  id: string;
  userId: string;
  userName: string;
  email: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
}

interface ConfigurationData {
  id: string;
  name: string;
  userId: string;
  userName: string;
  status: string;
  isTemplate: boolean;
  isPublic: boolean;
  totalPrice: number;
  createdAt: string;
}

interface ComponentData {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: string;
}

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

  const [users, setUsers] = useState<UserData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [configurations, setConfigurations] = useState<ConfigurationData[]>([])
  const [components, setComponents] = useState<ComponentData[]>([])

  const [tabLoading, setTabLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, user?.role])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;

    const fetchData = async () => {
      setTabLoading(true);
      setError(null);
      
      try {
        let endpoint = '';
        
        switch (activeTab) {
          case 'users':
            endpoint = '/api/admin/users';
            const usersResponse = await fetch(endpoint);
            if (!usersResponse.ok) throw new Error('Failed to fetch users');
            const usersData = await usersResponse.json();
            setUsers(usersData);
            break;
            
          case 'orders':
            endpoint = '/api/admin/orders';
            const ordersResponse = await fetch(endpoint);
            if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
            const ordersData = await ordersResponse.json();
            setOrders(ordersData);
            break;
            
          case 'configurations':
            endpoint = '/api/admin/configurations';
            const configsResponse = await fetch(endpoint);
            if (!configsResponse.ok) throw new Error('Failed to fetch configurations');
            const configsData = await configsResponse.json();
            setConfigurations(configsData);
            break;
            
          case 'components':
            endpoint = '/api/admin/components';
            const componentsResponse = await fetch(endpoint);
            if (!componentsResponse.ok) throw new Error('Failed to fetch components');
            const componentsData = await componentsResponse.json();
            setComponents(componentsData);
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
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
      'PROCESSING': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'DRAFT': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'SUBMITTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
    
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }
  
  const getRoleColor = (role: string) => {
    const roleColors = {
      'ADMIN': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'SPECIALIST': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'USER': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
    
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
  }

  const handleDelete = async (id: string, type: TabType) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error(`Failed to delete ${type} item`);

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
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };
  
  // Navigate to edit page
  const handleEdit = (id: string, type: TabType) => {
    router.push(`/${locale}/admin/${type}/edit/${id}`);
  };
  
  // Navigate to view page
  const handleView = (id: string, type: TabType) => {
    router.push(`/${locale}/admin/${type}/view/${id}`);
  };
  
  // Navigate to create page
  const handleCreate = (type: TabType) => {
    router.push(`/${locale}/admin/${type}/create`);
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
    
    switch (activeTab) {
      case 'users':
        return (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registered
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => {
                const user = item as UserData;
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.orderCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleView(user.id, 'users')}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                          onClick={() => handleEdit(user.id, 'users')}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleDelete(user.id, 'users')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
        
      case 'orders':
        return (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => {
                const order = item as OrderData;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.userName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {order.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.itemCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      €{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleView(order.id, 'orders')}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                          onClick={() => handleEdit(order.id, 'orders')}
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
        
      case 'configurations':
        return (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Configuration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visibility
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => {
                const config = item as ConfigurationData;
                return (
                  <tr key={config.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {config.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {config.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {config.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(config.status)}`}>
                        {config.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {config.isTemplate && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                            Template
                          </span>
                        )}
                        {config.isPublic && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                            Public
                          </span>
                        )}
                        {!config.isTemplate && !config.isPublic && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 rounded-full">
                            Private
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      €{config.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(config.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleView(config.id, 'configurations')}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                          onClick={() => handleEdit(config.id, 'configurations')}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleDelete(config.id, 'configurations')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
        
      case 'components':
        return (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Component
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Added
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => {
                const component = item as ComponentData;
                return (
                  <tr key={component.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {component.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {component.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 capitalize">
                        {component.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      €{component.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        component.stock <= 5 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : component.stock <= 10
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {component.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(component.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleView(component.id, 'components')}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                          onClick={() => handleEdit(component.id, 'components')}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleDelete(component.id, 'components')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  }
}