'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/app/contexts/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

interface SalesData {
  date: string
  configurations: number
  components: number
  peripherals: number
  total: number
}

export function SalesChart() {
  const t = useTranslations()
  const { theme } = useTheme()
  const [data, setData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalesData()
  }, [])

  const fetchSalesData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/sales')
      if (response.ok) {
        const salesData = await response.json()
        setData(salesData)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartColors = {
    configurations: theme === 'dark' ? '#ef4444' : '#dc2626',
    components: theme === 'dark' ? '#3b82f6' : '#2563eb',
    peripherals: theme === 'dark' ? '#10b981' : '#059669',
    total: theme === 'dark' ? '#f59e0b' : '#d97706'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.charts.sales')}</CardTitle>
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
        <CardTitle>{t('admin.charts.sales')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <Legend />
              <Line
                type="monotone"
                dataKey="configurations"
                stroke={chartColors.configurations}
                name={t('admin.charts.configurations')}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="components"
                stroke={chartColors.components}
                name={t('admin.charts.components')}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="peripherals"
                stroke={chartColors.peripherals}
                name={t('admin.charts.peripherals')}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={chartColors.total}
                name={t('admin.charts.total')}
                strokeWidth={3}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}