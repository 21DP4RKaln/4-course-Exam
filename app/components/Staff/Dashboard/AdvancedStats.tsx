'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { StatsCard } from './StatsCard'
import { 
  Users, ShoppingCart, DollarSign, Package, 
  Wrench, Settings, CheckCircle, AlertCircle 
} from 'lucide-react'

interface AdminStatsData {
  totalUsers: number
  newUsersThisMonth: number
  totalOrders: number
  ordersThisMonth: number
  totalRevenue: number
  revenueThisMonth: number
  totalComponents: number
  lowStockComponents: number
  pendingRepairs: number
  completedRepairs: number
  pendingConfigurations: number
  approvedConfigurations: number
  activeRepairs: number
}

export function AdvancedStats() {
  const t = useTranslations()
  const [stats, setStats] = useState<AdminStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/staff/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-100 dark:bg-stone-950 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('admin.dashboard.totalUsers')}
          value={stats.totalUsers}
          icon={<Users className="h-6 w-6" />}
          trend={{
            value: Math.round((stats.newUsersThisMonth / stats.totalUsers) * 100),
            isPositive: true
          }}
          description={`+${stats.newUsersThisMonth} ${t('admin.dashboard.thisMonth')}`}
        />
        
        <StatsCard
          title={t('admin.dashboard.totalOrders')}
          value={stats.totalOrders}
          icon={<ShoppingCart className="h-6 w-6" />}
          trend={{
            value: Math.round((stats.ordersThisMonth / stats.totalOrders) * 100),
            isPositive: true
          }}
          description={`${stats.ordersThisMonth} ${t('admin.dashboard.thisMonth')}`}
        />
        
        <StatsCard
          title={t('admin.dashboard.totalRevenue')}
          value={`€${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6" />}
          trend={{
            value: Math.round((stats.revenueThisMonth / stats.totalRevenue) * 100),
            isPositive: true
          }}
          description={`€${stats.revenueThisMonth.toLocaleString()} ${t('admin.dashboard.thisMonth')}`}
        />
        
        <StatsCard
          title={t('admin.dashboard.inventory')}
          value={stats.totalComponents}
          icon={<Package className="h-6 w-6" />}
          description={`${stats.lowStockComponents} ${t('admin.dashboard.lowStock')}`}
        />
      </div>

      {/* Service Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('admin.dashboard.pendingRepairs')}
          value={stats.pendingRepairs}
          icon={<AlertCircle className="h-6 w-6" />}
          description={t('admin.dashboard.requiresAttention')}
        />
        
        <StatsCard
          title={t('admin.dashboard.activeRepairs')}
          value={stats.activeRepairs}
          icon={<Wrench className="h-6 w-6" />}
          description={t('admin.dashboard.inProgress')}
        />
        
        <StatsCard
          title={t('admin.dashboard.pendingConfigurations')}
          value={stats.pendingConfigurations}
          icon={<Settings className="h-6 w-6" />}
          description={t('admin.dashboard.awaitingReview')}
        />
        
        <StatsCard
          title={t('admin.dashboard.approvedConfigurations')}
          value={stats.approvedConfigurations}
          icon={<CheckCircle className="h-6 w-6" />}
          description={t('admin.dashboard.thisMonth')}
        />
      </div>
    </div>
  )
}