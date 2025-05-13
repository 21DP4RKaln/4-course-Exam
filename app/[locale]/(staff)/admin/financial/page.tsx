'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import {
  DollarSign, TrendingUp, TrendingDown, BarChart2,
  PieChart, FileText, Download, Calendar, ArrowUp,
  ArrowDown, ShoppingCart, Users, Package
} from 'lucide-react'

type FinancialStats = {
  totalRevenue: number
  monthlyRevenue: number
  weeklyRevenue: number
  totalOrders: number
  averageOrderValue: number
  topSellingProducts: Array<{
    id: string
    name: string
    revenue: number
    quantity: number
  }>
  revenueByCategory: Array<{
    category: string
    revenue: number
  }>
  monthlyGrowth: number
  weeklyGrowth: number
}

export default function AdminFinancialPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const { user } = useAuth()
  const { theme } = useTheme()
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push(`/${locale}/dashboard`)
      return
    }
    fetchFinancialStats()
  }, [user, timeRange])

  const fetchFinancialStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/financial/stats?range=${timeRange}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching financial stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (format: 'csv' | 'pdf') => {
    // Implement export functionality
    console.log(`Exporting as ${format}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load financial data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financial Dashboard
        </h1>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-stone-950"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={() => exportReport('csv')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-stone-950 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{stats.monthlyRevenue.toFixed(2)}
              </p>
              <p className={`text-sm ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                {stats.monthlyGrowth >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                {Math.abs(stats.monthlyGrowth)}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalOrders}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{stats.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <BarChart2 className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Selling Products</h3>
          </div>
          <div className="p-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">
                    Quantity
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.topSellingProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                    </td>
                    <td className="py-3">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {product.quantity}
                      </p>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        €{product.revenue.toFixed(2)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue by Category</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.revenueByCategory.map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-900 dark:text-white">{category.category}</span>
                    <span className="text-gray-900 dark:text-white">€{category.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(category.revenue / stats.totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/${locale}/admin/financial/reports`}
          className="bg-white dark:bg-stone-950 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-lg font-medium text-gray-900 dark:text-white">Financial Reports</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View detailed reports</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/financial/invoices`}
          className="bg-white dark:bg-stone-950 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-lg font-medium text-gray-900 dark:text-white">Invoices</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage invoices</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/orders`}
          className="bg-white dark:bg-stone-950 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-lg font-medium text-gray-900 dark:text-white">Orders</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View all orders</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}