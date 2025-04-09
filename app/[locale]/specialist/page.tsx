'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  Cpu,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Clock,
  User,
  HardDrive,
  Monitor,
  Server,
  Zap,
  Layers,
  Fan
} from 'lucide-react'

// Mock data for pending configurations
const mockConfigurations = [
  {
    id: 'config-1',
    name: 'High-End Gaming PC',
    userId: 'user-1',
    userName: 'John Doe',
    email: 'john.doe@example.com',
    status: 'SUBMITTED',
    totalPrice: 2499.99,
    createdAt: '2025-04-05T14:30:00Z',
    components: [
      { id: 'cpu-1', category: 'cpu', name: 'Intel Core i9-14900K', price: 649.99 },
      { id: 'gpu-1', category: 'gpu', name: 'NVIDIA RTX 4080 16GB', price: 1199.99 },
      { id: 'mb-1', category: 'motherboard', name: 'ASUS ROG Maximus Z790', price: 549.99 },
      { id: 'ram-1', category: 'ram', name: 'Corsair 32GB DDR5-6000', price: 189.99 },
      { id: 'storage-1', category: 'storage', name: 'Samsung 2TB 990 Pro NVMe SSD', price: 199.99 },
      { id: 'psu-1', category: 'psu', name: 'Corsair RM1000x', price: 189.99 },
      { id: 'case-1', category: 'case', name: 'Lian Li O11 Dynamic EVO', price: 159.99 },
      { id: 'cooling-1', category: 'cooling', name: 'NZXT Kraken Z73', price: 249.99 }
    ]
  },
  {
    id: 'config-2',
    name: 'Workstation Build',
    userId: 'user-2',
    userName: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'SUBMITTED',
    totalPrice: 3899.99,
    createdAt: '2025-04-07T09:15:00Z',
    components: [
      { id: 'cpu-2', category: 'cpu', name: 'AMD Ryzen 9 7950X', price: 599.99 },
      { id: 'gpu-2', category: 'gpu', name: 'NVIDIA RTX 4090 24GB', price: 1599.99 },
      { id: 'mb-2', category: 'motherboard', name: 'MSI MEG X670E ACE', price: 549.99 },
      { id: 'ram-2', category: 'ram', name: 'G.Skill Trident Z5 64GB DDR5-6400', price: 349.99 },
      { id: 'storage-2', category: 'storage', name: 'Samsung 4TB 990 Pro NVMe SSD', price: 399.99 },
      { id: 'psu-2', category: 'psu', name: 'Seasonic PRIME TX-1300', price: 299.99 },
      { id: 'case-2', category: 'case', name: 'Fractal Design Meshify 2 XL', price: 199.99 },
      { id: 'cooling-2', category: 'cooling', name: 'EKWB Custom Loop', price: 699.99 }
    ]
  },
  {
    id: 'config-3',
    name: 'Budget Gaming PC',
    userId: 'user-3',
    userName: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    status: 'SUBMITTED',
    totalPrice: 899.99,
    createdAt: '2025-04-08T16:45:00Z',
    components: [
      { id: 'cpu-3', category: 'cpu', name: 'AMD Ryzen 5 7600X', price: 249.99 },
      { id: 'gpu-3', category: 'gpu', name: 'NVIDIA RTX 4060 8GB', price: 299.99 },
      { id: 'mb-3', category: 'motherboard', name: 'MSI B650 Gaming Plus', price: 149.99 },
      { id: 'ram-3', category: 'ram', name: 'Corsair Vengeance 16GB DDR5-5600', price: 89.99 },
      { id: 'storage-3', category: 'storage', name: 'WD Blue SN570 1TB NVMe SSD', price: 79.99 },
      { id: 'psu-3', category: 'psu', name: 'EVGA SuperNOVA 650 G5', price: 89.99 },
      { id: 'case-3', category: 'case', name: 'NZXT H5 Flow', price: 94.99 },
      { id: 'cooling-3', category: 'cooling', name: 'be quiet! Pure Rock 2', price: 44.99 }
    ]
  }
]

export default function SpecialistPanelPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null)
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Redirect if not authenticated or not a specialist
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'SPECIALIST')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, user?.role])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!isAuthenticated || user?.role !== 'SPECIALIST') {
    return null // Will redirect in the useEffect
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
  
  // Filter configurations based on search and status
  const filteredConfigurations = mockConfigurations.filter(config => {
    const matchesSearch = 
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.components.some(comp => comp.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || config.status === filterStatus
    
    return matchesSearch && matchesStatus
  })
  
  const toggleExpandConfig = (id: string) => {
    if (expandedConfig === id) {
      setExpandedConfig(null)
    } else {
      setExpandedConfig(id)
    }
  }
  
  const handleSelectConfig = (id: string) => {
    setSelectedConfig(id)
    setReviewComment('')
  }
  
  const handleApprove = () => {
    // In a real application, this would make an API call to update the configuration status
    console.log(`Approved configuration ${selectedConfig} with comment: ${reviewComment}`)
    alert('Configuration approved successfully')
    setSelectedConfig(null)
    setReviewComment('')
  }
  
  const handleReject = () => {
    // In a real application, this would make an API call to update the configuration status
    if (!reviewComment) {
      alert('Please provide a reason for rejection')
      return
    }
    
    console.log(`Rejected configuration ${selectedConfig} with comment: ${reviewComment}`)
    alert('Configuration rejected successfully')
    setSelectedConfig(null)
    setReviewComment('')
  }
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'cpu':
        return <Cpu size={16} className="text-blue-500" />
      case 'gpu':
        return <Monitor size={16} className="text-purple-500" />
      case 'motherboard':
        return <Server size={16} className="text-amber-500" />
      case 'ram':
        return <HardDrive size={16} className="text-green-500" />
      case 'storage':
        return <HardDrive size={16} className="text-indigo-500" />
      case 'psu':
        return <Zap size={16} className="text-yellow-500" />
      case 'case':
        return <Layers size={16} className="text-red-500" />
      case 'cooling':
        return <Fan size={16} className="text-cyan-500" />
      default:
        return <Cpu size={16} className="text-gray-500" />
    }
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('specialist.title')}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Configuration list */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock size={20} className="mr-2" />
              {t('specialist.pendingConfigs')}
            </h2>
            
            {/* Search and filter */}
            <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search configurations..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            
            {/* Configuration list */}
            {filteredConfigurations.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">No configurations found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConfigurations.map((config) => (
                  <div 
                    key={config.id}
                    className={`bg-gray-50 dark:bg-gray-900 rounded-lg border ${
                      selectedConfig === config.id 
                        ? 'border-blue-500 dark:border-blue-500' 
                        : 'border-gray-200 dark:border-gray-700'
                    } overflow-hidden`}
                  >
                    {/* Configuration header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => toggleExpandConfig(config.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {config.name}
                          </h3>
                          <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <User size={14} className="mr-1" />
                            {config.userName}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            config.status === 'SUBMITTED' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                              : config.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          } mr-2`}>
                            {config.status}
                          </span>
                          <ChevronDown 
                            size={20} 
                            className={`text-gray-500 transform transition-transform ${expandedConfig === config.id ? 'rotate-180' : ''}`} 
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(config.createdAt)}
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          €{config.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded view with components */}
                    {expandedConfig === config.id && (
                      <div className="px-4 pb-4">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Components
                          </h4>
                          <ul className="space-y-2">
                            {config.components.map((component) => (
                              <li key={component.id} className="flex justify-between text-sm">
                                <div className="flex items-center">
                                  {getCategoryIcon(component.category)}
                                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                                    {component.name}
                                  </span>
                                </div>
                                <span className="text-gray-900 dark:text-white">
                                  €{component.price.toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectConfig(config.id);
                          }}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                        >
                          {t('specialist.reviewConfig')}
                          <ChevronRight size={18} className="ml-1" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Review panel */}
        <div>
          {selectedConfig ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('specialist.reviewConfig')}
              </h2>
              
              {/* Configuration details */}
              {(() => {
                const config = mockConfigurations.find(c => c.id === selectedConfig)
                if (!config) return null
                
                return (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {config.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <User size={14} className="mr-1" />
                          {config.userName} ({config.email})
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-1 sm:mt-0">
                          Total: €{config.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Component compatibility check */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Compatibility Check
                      </h4>
                      
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-start">
                        <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">All components are compatible</p>
                          <p className="text-sm mt-1">The selected components work well together. No issues detected.</p>
                        </div>
                      </div>
                      
                      {/* Example warning - in a real application, this would be conditional */}
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md flex items-start mt-2">
                        <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Optimization suggestion</p>
                          <p className="text-sm mt-1">The selected power supply (650W) is adequate, but for future upgrades, considering a 750W PSU might be beneficial.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Components list */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Components
                      </h4>
                      
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden">
                        <div className="grid grid-cols-3 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-850 p-2">
                          <div>Component</div>
                          <div>Description</div>
                          <div className="text-right">Price</div>
                        </div>
                        
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {config.components.map((component) => (
                            <div key={component.id} className="grid grid-cols-3 p-2 text-sm">
                              <div className="flex items-center">
                                {getCategoryIcon(component.category)}
                                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                                  {component.category.charAt(0).toUpperCase() + component.category.slice(1)}
                                </span>
                              </div>
                              <div className="text-gray-700 dark:text-gray-300">
                                {component.name}
                              </div>
                              <div className="text-right font-medium text-gray-900 dark:text-white">
                                €{component.price.toFixed(2)}
                              </div>
                            </div>
                          ))}
                          
                          <div className="grid grid-cols-3 p-2 bg-gray-50 dark:bg-gray-900">
                            <div className="col-span-2 text-right font-medium text-gray-900 dark:text-white">
                              Total:
                            </div>
                            <div className="text-right font-bold text-gray-900 dark:text-white">
                              €{config.totalPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Review form */}
                    <div>
                      <div className="mb-4">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('specialist.comment')}
                        </label>
                        <textarea
                          id="comment"
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Add your review comments, suggestions or reasons for rejection..."
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={handleApprove}
                          className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                        >
                          <CheckCircle size={18} className="mr-2" />
                          {t('specialist.approve')}
                        </button>
                        
                        <button
                          onClick={handleReject}
                          className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                        >
                          <XCircle size={18} className="mr-2" />
                          {t('specialist.reject')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-3">
                  <Cpu size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Select a Configuration
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a configuration from the list to review its details and compatibility.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}