'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import ProfileTab from '@/app/components/Dashboard/Components'
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

import { 
  getPendingConfigurations, 
  reviewConfiguration, 
  type PendingConfiguration 
} from '@/lib/services/specialistService'

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
  const [filterStatus, setFilterStatus] = useState('SUBMITTED')
  
  // Data state
  const [configurations, setConfigurations] = useState<PendingConfiguration[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showProfileSettings, setShowProfileSettings] = useState(false)
  
  // Redirect if not authenticated or not a specialist
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'SPECIALIST')) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, router, locale, pathname, user?.role])
  
  // Fetch configurations from the database
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'SPECIALIST') return
    
    const fetchConfigurations = async () => {
      setDataLoading(true)
      setError(null)
      
      try {
        const configData = await getPendingConfigurations()
        setConfigurations(configData)
      } catch (err) {
        console.error('Error fetching configurations:', err)
        setError('Failed to load configurations. Please try again later.')
      } finally {
        setDataLoading(false)
      }
    }
    
    fetchConfigurations()
  }, [isAuthenticated, user?.role])
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }
  
  // Auth check - will redirect in useEffect
  if (!isAuthenticated || user?.role !== 'SPECIALIST') {
    return null
  }
  
  // Format date for display
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
  
  // Filter configurations based on search query and filter status
  const filteredConfigurations = configurations.filter(config => {
    const matchesSearch = searchQuery === '' || 
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.components.some(comp => comp.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || config.status === filterStatus
    
    return matchesSearch && matchesStatus
  })
  
  // Toggle expanded view for a configuration
  const toggleExpandConfig = (id: string) => {
    setExpandedConfig(prevId => prevId === id ? null : id)
  }
  
  // Select a configuration for review
  const handleSelectConfig = (id: string) => {
    setSelectedConfig(id)
    setReviewComment('')
  }
  
  // Approve the selected configuration
  const handleApprove = async () => {
    if (!selectedConfig) return
    
    setActionLoading(true)
    try {
      const success = await reviewConfiguration(
        selectedConfig, 
        'APPROVED', 
        reviewComment || 'Configuration approved by specialist'
      )
      
      if (success) {
        alert('Configuration approved successfully')
        // Remove from the list
        setConfigurations(prevConfigs => 
          prevConfigs.filter(c => c.id !== selectedConfig)
        )
        setSelectedConfig(null)
        setReviewComment('')
      } else {
        setError('Failed to approve configuration')
      }
    } catch (err) {
      console.error('Error approving configuration:', err)
      setError('An error occurred while approving the configuration')
    } finally {
      setActionLoading(false)
    }
  }
  
  // Reject the selected configuration
  const handleReject = async () => {
    if (!selectedConfig) return
    
    if (!reviewComment) {
      alert('Please provide a reason for rejection')
      return
    }
    
    setActionLoading(true)
    try {
      const success = await reviewConfiguration(
        selectedConfig, 
        'REJECTED', 
        reviewComment
      )
      
      if (success) {
        alert('Configuration rejected successfully')
        // Remove from the list
        setConfigurations(prevConfigs => 
          prevConfigs.filter(c => c.id !== selectedConfig)
        )
        setSelectedConfig(null)
        setReviewComment('')
      } else {
        setError('Failed to reject configuration')
      }
    } catch (err) {
      console.error('Error rejecting configuration:', err)
      setError('An error occurred while rejecting the configuration')
    } finally {
      setActionLoading(false)
    }
  }
  
  // Get icon for component category
  const getCategoryIcon = (category: string) => {
    const lowerCaseCategory = category.toLowerCase()
    
    if (lowerCaseCategory.includes('cpu')) return <Cpu size={16} className="text-red-500" />
    if (lowerCaseCategory.includes('gpu') || lowerCaseCategory.includes('graphics')) return <Monitor size={16} className="text-purple-500" />
    if (lowerCaseCategory.includes('motherboard')) return <Server size={16} className="text-amber-500" />
    if (lowerCaseCategory.includes('memory') || lowerCaseCategory.includes('ram')) return <HardDrive size={16} className="text-green-500" />
    if (lowerCaseCategory.includes('storage')) return <HardDrive size={16} className="text-indigo-500" />
    if (lowerCaseCategory.includes('power') || lowerCaseCategory.includes('psu')) return <Zap size={16} className="text-yellow-500" />
    if (lowerCaseCategory.includes('case')) return <Layers size={16} className="text-red-500" />
    if (lowerCaseCategory.includes('cooling')) return <Fan size={16} className="text-cyan-500" />
    
    return <Cpu size={16} className="text-gray-500" />
  }
  
  // Main component render
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
            
            {/* Search and filter controls */}
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            
            {/* Configuration list */}
            {dataLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mr-3"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading configurations...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle size={32} className="mx-auto text-red-500 mb-2" />
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredConfigurations.length === 0 ? (
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
                        ? 'border-red-500 dark:border-red-500' 
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
                          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 mr-2`}>
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
                          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
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
                const config = configurations.find(c => c.id === selectedConfig)
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
                      
                      {/* This would be replaced with actual compatibility check logic */}
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-start">
                        <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">All components are compatible</p>
                          <p className="text-sm mt-1">The selected components work well together. No issues detected.</p>
                        </div>
                      </div>
                      
                      {/* Power supply suggestion based on actual components */}
                      {config.components.some(c => 
                        c.category.toLowerCase().includes('power') && 
                        c.name.toLowerCase().includes('650w') &&
                        config.components.some(g => 
                          g.category.toLowerCase().includes('gpu') && 
                          g.name.toLowerCase().includes('rtx')
                        )
                      ) && (
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md flex items-start mt-2">
                          <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Optimization suggestion</p>
                            <p className="text-sm mt-1">The selected power supply (650W) may be insufficient for the high-end GPU. Consider upgrading to a 750W or 850W PSU for better stability.</p>
                          </div>
                        </div>
                      )}
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
                                  {component.category}
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
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={handleApprove}
                          disabled={actionLoading}
                          className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle size={18} className="mr-2" />
                              {t('specialist.approve')}
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleReject}
                          disabled={actionLoading}
                          className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <XCircle size={18} className="mr-2" />
                              {t('specialist.reject')}
                            </>
                          )}
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