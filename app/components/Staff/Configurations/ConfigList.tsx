'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Monitor, 
  Eye, 
  Edit, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react'
import { ConfigDetails } from './ConfigDetails'
import { ConfigPublishForm } from './ConfigPublishForm'
import Loading from '@/app/components/ui/Loading'

interface Configuration {
  id: string
  name: string
  userId: string
  userName?: string
  userEmail?: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  totalPrice: number
  createdAt: string
  isTemplate: boolean
  isPublic: boolean
  components: Array<{
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }>
}

interface ConfigListProps {
  type?: 'all' | 'pending' | 'approved' | 'rejected'
  showUserInfo?: boolean
}

export function ConfigList({ type = 'all', showUserInfo = false }: ConfigListProps) {
  const t = useTranslations()
  const { user } = useAuth()
  const router = useRouter()
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null)
  const [publishingConfig, setPublishingConfig] = useState<Configuration | null>(null)
  const [filters, setFilters] = useState({
    status: type === 'all' ? '' : type.toUpperCase(),
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  useEffect(() => {
    fetchConfigurations()
  }, [filters])

  const fetchConfigurations = async () => {
    try {
      const queryParams = new URLSearchParams({
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })

      const response = await fetch(`/api/staff/configurations?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch configurations')
      
      const data = await response.json()
      setConfigurations(data)
    } catch (error) {
      console.error('Error fetching configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (configId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/staff/configurations/${configId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      await fetchConfigurations()
    } catch (error) {
      console.error('Error updating configuration status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
          <Clock size={12} /> Draft
        </span>
      case 'SUBMITTED':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
          <Send size={12} /> Pending Review
        </span>
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle size={12} /> Approved
        </span>
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-1">
          <XCircle size={12} /> Rejected
        </span>
      default:
        return null
    }
  }

  const filteredConfigurations = configurations.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search configurations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-stone-950 dark:border-neutral-700"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border rounded-lg dark:bg-stone-950 dark:border-neutral-700"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="px-4 py-2 border rounded-lg dark:bg-stone-950 dark:border-neutral-700"
          >
            <option value="createdAt">Date</option>
            <option value="totalPrice">Price</option>
            <option value="name">Name</option>
          </select>
          <button
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
            }))}
            className="px-4 py-2 border rounded-lg dark:bg-stone-950 dark:border-neutral-700"
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Configurations Table */}
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Configuration
                </th>
                {showUserInfo && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    User
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Components
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredConfigurations.map((config) => (
                <tr key={config.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Monitor className="h-5 w-5 text-neutral-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {config.name}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          ID: {config.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  {showUserInfo && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-white">
                        {config.userName}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {config.userEmail}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(config.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                    €{config.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {config.components.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {new Date(config.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedConfig(config)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {config.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(config.id, 'APPROVED')}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(config.id, 'REJECTED')}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      
                      {config.status === 'APPROVED' && !config.isPublic && (
                        <button
                          onClick={() => setPublishingConfig(config)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                          title="Publish to Shop"
                        >
                          <Send size={18} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => router.push(`/${user?.role.toLowerCase()}/configurations/${config.id}/edit`)}
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Details Modal */}
      {selectedConfig && (
        <ConfigDetails
          configuration={selectedConfig}
          onClose={() => setSelectedConfig(null)}
        />
      )}

      {/* Publish Configuration Modal */}
      {publishingConfig && (
        <ConfigPublishForm
          configuration={publishingConfig}
          onClose={() => setPublishingConfig(null)}
          onPublished={() => {
            setPublishingConfig(null)
            fetchConfigurations()
          }}
        />
      )}
    </div>
  )
}