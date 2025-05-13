'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  Tag, 
  Megaphone, 
  TrendingUp, 
  Users, 
  DollarSign,
  CalendarDays,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface MarketingStats {
  activePromoCodes: number
  totalDiscountGiven: number
  activeUsers: number
  conversionRate: number
  recentCampaigns: Array<{
    id: string
    name: string
    type: string
    status: string
    startDate: string
    endDate?: string
  }>
  promoCodeUsage: Array<{
    code: string
    usageCount: number
    discountAmount: number
  }>
}

export default function MarketingOverviewPage() {
  const t = useTranslations()
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<MarketingStats | null>(null)

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    const fetchMarketingStats = async () => {
      try {
        const response = await fetch('/api/admin/marketing/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching marketing stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketingStats()
  }, [user, router])

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
          Marketing Overview
        </h1>
        <div className="flex gap-4">
          <Link 
            href={`/${router.locale}/admin/marketing/promo-codes/create`}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Tag size={18} />
            Create Promo Code
          </Link>
          <Link 
            href={`/${router.locale}/admin/marketing/campaigns`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Megaphone size={18} />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Promo Codes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.activePromoCodes || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <Tag className="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Discount Given</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{stats?.totalDiscountGiven?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.activeUsers || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.conversionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Marketing Tools
          </h2>
          <div className="space-y-3">
            <Link 
              href={`/${router.locale}/admin/marketing/promo-codes`}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Promo Codes</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link 
              href={`/${router.locale}/admin/marketing/campaigns`}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center gap-3">
                <Megaphone className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Campaigns</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Campaigns
          </h2>
          <div className="space-y-3">
            {stats?.recentCampaigns?.map((campaign) => (
              <div 
                key={campaign.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {campaign.type} • {campaign.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(campaign.startDate).toLocaleDateString()}
                  </p>
                  {campaign.endDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      to {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promo Code Usage */}
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Top Promo Codes
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usage Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Discount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-stone-950 divide-y divide-gray-200 dark:divide-gray-700">
                {stats?.promoCodeUsage?.map((promo) => (
                  <tr key={promo.code}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {promo.usageCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        €{promo.discountAmount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}