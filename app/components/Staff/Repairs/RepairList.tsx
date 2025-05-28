'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { RepairStatusBadge } from './RepairStatusBadge'
import { RepairActions } from './RepairActions'
import { DataTable, Column } from '../Common/DataTable'
import { RepairStatus } from '@prisma/client'
import { useAuth } from '@/app/contexts/AuthContext'
import { format } from 'date-fns'
import { Search, Filter } from 'lucide-react'

interface Repair {
  id: string
  title: string
  status: RepairStatus
  priority: string
  createdAt: string
  updatedAt: string
  estimatedCost: number | null
  finalCost: number | null
  user?: {
    name: string
    email: string
  }
  peripheral?: {
    name: string
  }
  configuration?: {
    name: string
  }
}

export function RepairList() {
  const t = useTranslations()
  const { user } = useAuth()
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'ALL'>('ALL')

  useEffect(() => {
    fetchRepairs()
  }, [])

  const fetchRepairs = async () => {
    try {
      const response = await fetch(`/api/staff/repairs`)
      if (!response.ok) throw new Error('Failed to fetch repairs')
      const data = await response.json()
      setRepairs(data)
    } catch (error) {
      console.error('Error fetching repairs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = 
      repair.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || repair.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const columns: Column<Repair>[] = [
    {
      key: 'id',
      label: t('repairs.id'),
      render: (value: string) => value.slice(0, 8)
    },
    {
      key: 'title',
      label: t('repairs.title'),
      render: (value: string, repair: Repair) => (
        <div>
          <p className="font-medium">{repair.title}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {repair.peripheral?.name || repair.configuration?.name || t('repairs.noProduct')}
          </p>
        </div>
      )
    },
    {
      key: 'user',
      label: t('repairs.customer'),
      render: (value: Repair['user']) => (
        <div>
          <p className="font-medium">{value?.name}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{value?.email}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: t('repairs.status'),
      render: (value: RepairStatus) => <RepairStatusBadge status={value} />
    },
    {
      key: 'priority',
      label: t('repairs.priority'),
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium
          ${value === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            value === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
            value === 'NORMAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            'bg-neutral-100 text-stone-950 dark:bg-neutral-900 dark:text-neutral-200'}`}>
          {t(`repairs.priority.${value.toLowerCase()}`)}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: t('repairs.created'),
      render: (value: string) => format(new Date(value), 'MMM d, yyyy')
    },
    {
      key: 'estimatedCost',
      label: t('repairs.cost'),
      render: (value: number | null, repair: Repair) => (
        <div>
          {repair.estimatedCost && (
            <p>Est: €{repair.estimatedCost.toFixed(2)}</p>
          )}
          {repair.finalCost && (
            <p className="text-green-600 dark:text-green-400">Final: €{repair.finalCost.toFixed(2)}</p>
          )}
        </div>
      )
    },
    {
      key: 'id',
      label: t('repairs.actions'),
      render: (value: string, repair: Repair) => (
        <RepairActions 
          repair={repair} 
          onUpdate={fetchRepairs} 
          userRole={user?.role || 'USER'}
        />
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder={t('repairs.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-neutral-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RepairStatus | 'ALL')}
            className="border rounded-lg px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600"
          >
            <option value="ALL">{t('repairs.allStatuses')}</option>
            {Object.values(RepairStatus).map(status => (
              <option key={status} value={status}>
                {t(`repairs.status.${status.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredRepairs}
        emptyMessage={t('repairs.noRepairs')}
      />
    </div>
  )
}