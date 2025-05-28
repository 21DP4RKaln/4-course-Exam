'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { DataTable, Column } from '../Common/DataTable'
import { ProductActions } from './ProductActions'
import { StatusBadge } from '../Common/StatusBadge'
import { SearchBar } from '../Common/SearchBar'
import { useTranslations } from 'next-intl'
import { Keyboard, AlertCircle } from 'lucide-react'
import { useTheme } from '@/app/contexts/ThemeContext'

interface Peripheral {
  id: string
  name: string
  category: {
    name: string
  }
  price: number
  stock: number
  sku: string
  imageUrl?: string
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
}

export function PeripheralList() {
  const t = useTranslations()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [peripherals, setPeripherals] = useState<Peripheral[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    fetchPeripherals()
  }, [])

  const fetchPeripherals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff/products/peripherals')
      
      if (!response.ok) {
        throw new Error('Failed to fetch peripherals')
      }

      const data = await response.json()
      setPeripherals(data)
    } catch (error) {
      console.error('Error fetching peripherals:', error)
      setError('Failed to load peripherals')
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (stock: number): Peripheral['status'] => {
    if (stock === 0) return 'OUT_OF_STOCK'
    if (stock < 10) return 'LOW_STOCK'
    return 'IN_STOCK'
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this peripheral?')) return

    try {
      const response = await fetch(`/api/staff/products/peripherals/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete peripheral')
      }

      setPeripherals(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting peripheral:', error)
      alert('Failed to delete peripheral')
    }
  }

  const filteredPeripherals = peripherals.filter(peripheral =>
    peripheral.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    peripheral.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    peripheral.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: Column<Peripheral>[] = [
    {
      key: 'imageUrl' as keyof Peripheral,
      label: 'Image',
      render: (value: string) => value ? (
        <img 
          src={value} 
          alt="Peripheral" 
          className="w-10 h-10 object-cover rounded"
        />
      ) : (
        <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center">
          <Keyboard size={20} className="text-neutral-400" />
        </div>
      )
    },
    {
      key: 'name' as keyof Peripheral,
      label: 'Name',
      sortable: true
    },
    {
      key: 'category' as keyof Peripheral,
      label: 'Category',
      render: (value: { name: string }) => value.name
    },
    {
      key: 'sku' as keyof Peripheral,
      label: 'SKU',
      sortable: true
    },
    {
      key: 'price' as keyof Peripheral,
      label: 'Price',
      render: (value: number) => `€${value.toFixed(2)}`
    },
    {
      key: 'stock' as keyof Peripheral,
      label: 'Stock',
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <span>{value}</span>
          <StatusBadge status={getStockStatus(value)} />
        </div>
      )
    },
    {
      key: 'id' as keyof Peripheral,
      label: 'Actions',
      render: (value: string, item: Peripheral) => (
        <ProductActions
          id={value}
          type="peripheral"
          onDelete={() => handleDelete(value)}
          canEdit={isAdmin}
          canDelete={isAdmin}
        />
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Peripherals Inventory
        </h2>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search peripherals..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredPeripherals}
        emptyMessage="No peripherals found"
      />
    </div>
  )
}