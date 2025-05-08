'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Clock, Wrench, CheckCircle, AlertCircle, Search } from 'lucide-react'

type RepairStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type RepairPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

interface Repair {
  id: string
  title: string
  status: RepairStatus
  priority: RepairPriority
  userId: string
  userName: string
  createdAt: string
  estimatedCost: number
}

export default function RepairsPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | RepairStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRepairs()
  }, [])

  const fetchRepairs = async () => {
    try {
      const response = await fetch('/api/specialist/repairs')
      if (response.ok) {
        const data = await response.json()
        setRepairs(data)
      }
    } catch (error) {
      console.error('Error fetching repairs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: RepairStatus) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'IN_PROGRESS': { color: 'bg-blue-100 text-blue-800', icon: Wrench },
      'COMPLETED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    } as const

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: RepairPriority) => {
    const colors = {
      'LOW': 'bg-gray-100 text-gray-800',
      'NORMAL': 'bg-blue-100 text-blue-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge className={colors[priority]}>
        {priority}
      </Badge>
    )
  }

  const filteredRepairs = repairs.filter(repair => {
    if (filter !== 'all' && repair.status !== filter) return false
    if (searchQuery && !repair.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !repair.userName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Repair Requests
        </h1>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search repairs..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-gray-800 dark:border-gray-700"
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | RepairStatus)}
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredRepairs.map((repair) => (
          <Card key={repair.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{repair.title}</h3>
                    {getStatusBadge(repair.status)}
                    {getPriorityBadge(repair.priority)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Customer: {repair.userName}</p>
                    <p>Created: {new Date(repair.createdAt).toLocaleDateString()}</p>
                    {repair.estimatedCost && <p>Estimated: €{repair.estimatedCost}</p>}
                  </div>
                </div>
                <Link href={`/${locale}/specialist/repairs/${repair.id}`}>
                  <Button>View Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}