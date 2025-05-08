'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Plus, Search } from 'lucide-react'

interface Configuration {
  id: string
  name: string
  description: string
  status: string
  totalPrice: number
  userId: string
  userName: string
  createdAt: string
}

export default function ConfigurationsPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchConfigurations()
  }, [])

  const fetchConfigurations = async () => {
    try {
      const response = await fetch('/api/specialist/configurations')
      if (response.ok) {
        const data = await response.json()
        setConfigurations(data)
      }
    } catch (error) {
      console.error('Error fetching configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SUBMITTED': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={colors[status] || colors['DRAFT']}>
        {status}
      </Badge>
    )
  }

  const filteredConfigurations = configurations.filter(config => {
    if (filter !== 'all' && config.status !== filter) return false
    if (searchQuery && !config.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !config.userName.toLowerCase().includes(searchQuery.toLowerCase())) return false
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
          Configurations
        </h1>
        <Link href={`/${locale}/specialist/configurations/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search configurations..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-gray-800 dark:border-gray-700"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredConfigurations.map((config) => (
          <Card key={config.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{config.name}</h3>
                    {getStatusBadge(config.status)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Customer: {config.userName}</p>
                    <p>Created: {new Date(config.createdAt).toLocaleDateString()}</p>
                    <p>Price: €{config.totalPrice}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/${locale}/specialist/configurations/${config.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                  {config.status === 'SUBMITTED' && (
                    <Button>Review</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}