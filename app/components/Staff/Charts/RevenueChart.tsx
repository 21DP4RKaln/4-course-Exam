'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

interface RevenueData {
  month: string
  revenue: number
  expenses: number
  profit: number
  orders: number
}

export function RevenueChart() {
  const t = useTranslations()
  const { theme } = useTheme()
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/admin/financial/revenue')
      if (response.ok) {
        const revenueData = await response.json()
        setData(revenueData)
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartColors = {
    revenue: theme === 'dark' ? '#10b981' : '#059669',
    expenses: theme === 'dark' ? '#ef4444' : '#dc2626',
    profit: theme === 'dark' ? '#3b82f6' : '#2563eb',
    orders: theme === 'dark' ? '#f59e0b' : '#d97706'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.charts.revenue')}</CardTitle>
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
        <CardTitle>{t('admin.charts.revenue')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="month" 
                stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
              />
              <YAxis 
                yAxisId="left"
                stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                label={{ value: '€', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                label={{ value: 'Orders', angle: 90, position: 'insideRight' }}
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
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                fill={chartColors.revenue}
                stroke={chartColors.revenue}
                fillOpacity={0.6}
                name={t('admin.charts.revenue')}
              />
              <Bar 
                yAxisId="left"
                dataKey="expenses" 
                fill={chartColors.expenses} 
                name={t('admin.charts.expenses')} 
              />
              <Bar 
                yAxisId="left"
                dataKey="profit" 
                fill={chartColors.profit} 
                name={t('admin.charts.profit')} 
              />
              <Bar 
                yAxisId="right"
                dataKey="orders" 
                fill={chartColors.orders} 
                name={t('admin.charts.orders')} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}