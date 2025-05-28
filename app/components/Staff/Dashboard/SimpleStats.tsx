'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { StatsCard } from './StatsCard'
import { Wrench, Settings, AlertCircle, CheckCircle } from 'lucide-react'

interface StatsData {
  pendingRepairs: number
  activeRepairs: number
  completedRepairs?: number
  pendingConfigurations: number
  approvedConfigurations: number
  totalRepairs?: number
}

export function SimpleStats() {
  const t = useTranslations()
  const [stats, setStats] = useState<StatsData>({
    pendingRepairs: 0,
    activeRepairs: 0,
    pendingConfigurations: 0,
    approvedConfigurations: 0
  })
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
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-neutral-100 dark:bg-stone-950 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title={t('specialist.dashboard.pendingRepairs')}
        value={stats.pendingRepairs}
        icon={<AlertCircle className="h-6 w-6" />}
        description={t('specialist.dashboard.requiresAttention')}
        trend={stats.totalRepairs ? {
          value: Math.round((stats.pendingRepairs / stats.totalRepairs) * 100),
          isPositive: false
        } : undefined}
      />
      <StatsCard
        title={t('specialist.dashboard.activeRepairs')}
        value={stats.activeRepairs}
        icon={<Wrench className="h-6 w-6" />}
        description={t('specialist.dashboard.inProgress')}
        trend={stats.totalRepairs ? {
          value: Math.round((stats.activeRepairs / stats.totalRepairs) * 100),
          isPositive: true
        } : undefined}
      />
      <StatsCard
        title={t('specialist.dashboard.pendingConfigurations')}
        value={stats.pendingConfigurations}
        icon={<Settings className="h-6 w-6" />}
        description={t('specialist.dashboard.awaitingReview')}
      />
      <StatsCard
        title={t('specialist.dashboard.approvedConfigurations')}
        value={stats.approvedConfigurations}
        icon={<CheckCircle className="h-6 w-6" />}
        description={t('specialist.dashboard.thisMonth')}
      />
    </div>
  )
}