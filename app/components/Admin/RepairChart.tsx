'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/app/contexts/ThemeContext'

interface RepairMetrics {
  month: string
  pending: number
  inProgress: number
  completed: number
  cancelled: number
}

export function RepairChart() {
  const t = useTranslations()
  const { theme } = useTheme()
  const [data, setData] = useState<RepairMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRepairData()
  }, [])

  const fetchRepairData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/repair-metrics')
      if (response.ok) {
        const repairData = await response.json()
        setData(repairData)
      }
    } catch (error) {
      console.error('Error fetching repair data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartColors = {
    pending: theme === 'dark' ? '#f59e0b' : '#d97706',
    inProgress: theme === 'dark' ? '#3b82f6' : '#2563eb',
    completed: theme === 'dark' ? '#10b981' : '#059669',
    cancelled: theme === 'dark' ? '#ef4444' : '#dc2626'
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="month" 
            stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
            fontSize={12}
          />
          <YAxis 
            stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              borderRadius: '0.5rem',
              color: theme === 'dark' ? '#f3f4f6' : '#111827'
            }}
          />
          <Legend />
          <Bar dataKey="pending" fill={chartColors.pending} name={t('staff.pendingRepairs')} />
          <Bar dataKey="inProgress" fill={chartColors.inProgress} name={t('staff.activeRepairs')} />
          <Bar dataKey="completed" fill={chartColors.completed} name={t('staff.completedRepairs')} />
          <Bar dataKey="cancelled" fill={chartColors.cancelled} name={t('staff.cancelledRepairs')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
