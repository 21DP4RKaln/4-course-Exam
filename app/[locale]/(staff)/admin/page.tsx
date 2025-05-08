'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { 
  BarChart, Users, Package, Wrench, DollarSign, 
  TrendingUp, AlertCircle, CheckCircle, Clock
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRepairs: 0,
    totalRevenue: 0,
    pendingConfigurations: 0,
    activeRepairs: 0,
    lowStockItems: 0,
    monthlyGrowth: 0
  })

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    
    if (!user || user.role !== 'ADMIN') {
      router.push(`/${locale}/unauthorized`)
      return
    }

    fetchDashboardData()
  }, [loading, isAuthenticated, user, locale, pathname, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {user?.name || user?.email}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={+12.5}
          color="blue"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={Package}
          trend={+8.2}
          color="green"
        />
        <StatsCard
          title="Active Repairs"
          value={stats.activeRepairs}
          icon={Wrench}
          color="orange"
        />
        <StatsCard
          title="Total Revenue"
          value={`€${stats.totalRevenue}`}
          icon={DollarSign}
          trend={+15.3}
          color="purple"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Configurations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingConfigurations}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStockItems}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Growth</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">+{stats.monthlyGrowth}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded">
            <span className="text-gray-500 dark:text-gray-400">Sales Chart Coming Soon</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Repair Metrics</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded">
            <span className="text-gray-500 dark:text-gray-400">Repair Chart Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Define types for StatsCard component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

// Simple Stats Card Component
function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  } as const;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}