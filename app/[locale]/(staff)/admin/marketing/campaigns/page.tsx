'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Megaphone,
  Eye,
  BarChart
} from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  description: string
  type: 'EMAIL' | 'PROMO' | 'SOCIAL' | 'BANNER'
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  startDate: string
  endDate: string
  targetAudience: string
  budget?: number
  spent?: number
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
  }
  createdAt: string
  createdBy: string
}

export default function CampaignsPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Get current locale from pathname
  const currentLocale = pathname.split('/')[1]

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/admin/marketing/campaigns')
        if (!response.ok) throw new Error('Failed to fetch campaigns')
        const data = await response.json()
        setCampaigns(data)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [user, router])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const response = await fetch(`/api/admin/marketing/campaigns/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete campaign')
      
      setCampaigns(campaigns.filter(campaign => campaign.id !== id))
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Failed to delete campaign')
    }
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const badges = {
      DRAFT: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', icon: Edit },
      SCHEDULED: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-300', icon: Clock },
      ACTIVE: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-300', icon: CheckCircle },
      PAUSED: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-300', icon: Clock },
      COMPLETED: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-300', icon: XCircle }
    }

    const badge = badges[status]
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const getTypeBadge = (type: Campaign['type']) => {
    const badges = {
      EMAIL: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-300', icon: Megaphone },
      PROMO: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-300', icon: Megaphone },
      SOCIAL: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-300', icon: Megaphone },
      BANNER: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-300', icon: Megaphone }
    }

    const badge = badges[type]
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {type}
      </span>
    )
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Marketing Campaigns
        </h1>
        <Link 
          href={`/${currentLocale}/admin/marketing/campaigns/create`}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Create Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="EMAIL">Email</option>
              <option value="PROMO">Promotion</option>
              <option value="SOCIAL">Social Media</option>
              <option value="BANNER">Banner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.name}
                      </div>
                      {campaign.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {campaign.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(campaign.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      to {new Date(campaign.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{campaign.metrics.impressions}</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{campaign.metrics.conversions}</span>
                        </div>
                      </div>
                    </div>
                    {campaign.budget && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        €{campaign.spent || 0} / €{campaign.budget}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/${currentLocale}/admin/marketing/campaigns/${campaign.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/${currentLocale}/admin/marketing/campaigns/${campaign.id}/edit`}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}