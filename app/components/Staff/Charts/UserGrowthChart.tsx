'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

interface UserGrowthData {
  date: string
  newUsers: number
  totalUsers: number
}

export function UserGrowthChart() {
  const t = useTranslations()
  const { theme } = useTheme()
  const [data, setData] = useState<UserGrowthData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserGrowthData()
  }, [])

  const fetchUserGrowthData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/users')
      if (response.ok) {
        const growthData = await response.json()
        setData(growthData)
      }
    } catch (error) {
      console.error('Error fetching user growth data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartColors = {
    newUsers: theme === 'dark' ? '#10b981' : '#059669',
    totalUsers: theme === 'dark' ? '#3b82f6' : '#2563eb'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.charts.userGrowth')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.charts.userGrowth')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
                stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '0.5rem',
                  color: theme === 'dark' ? '#f3f4f6' : '#111827'
                }}
              />
              <Area
                type="monotone"
                dataKey="newUsers"
                stackId="1"
                stroke={chartColors.newUsers}
                fill={chartColors.newUsers}
                fillOpacity={0.6}
                name={t('admin.charts.newUsers')}
              />
              <Area
                type="monotone"
                dataKey="totalUsers"
                stackId="2"
                stroke={chartColors.totalUsers}
                fill={chartColors.totalUsers}
                fillOpacity={0.3}
                name={t('admin.charts.totalUsers')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}