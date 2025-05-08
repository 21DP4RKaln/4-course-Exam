'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Wrench, Package, Cpu, Monitor, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardStats {
  pendingRepairs: number
  activeRepairs: number
  completedRepairs: number
  pendingConfigurations: number
  totalComponents: number
  totalPeripherals: number
  activeConfigurations: number
}

export default function SpecialistDashboard() {
  const t = useTranslations()
  const { user } = useAuth()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/specialist/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const quickLinks = [
    {
      title: 'Repair Requests',
      description: 'Manage repair requests',
      href: `/${locale}/specialist/repairs`,
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Configurations',
      description: 'Review user configurations',
      href: `/${locale}/specialist/configurations`,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Components',
      description: 'View component inventory',
      href: `/${locale}/specialist/components`,
      icon: Cpu,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Ready-Made PCs',
      description: 'Manage shop PCs',
      href: `/${locale}/specialist/ready-made`,
      icon: Monitor,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Repairs</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRepairs || 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Repairs</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRepairs || 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Configs</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingConfigurations || 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedRepairs || 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Repairs finished
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={`${link.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <link.icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Repair #1234 completed
                </p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New configuration submitted for review
                </p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New repair request received
                </p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}