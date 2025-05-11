'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react'
import { DataTable, Column } from '@/app/components/Staff/Common/DataTable'
import { ActionButtons } from '@/app/components/Staff/Common/ActionButtons'
import { SearchBar } from '@/app/components/Staff/Common/SearchBar'
import { useTheme } from '@/app/contexts/ThemeContext'

interface Component {
  id: string
  name: string
  category: { name: string }
  price: number
  discountPrice: number | null
  discountExpiresAt: string | null
  stock: number
  sku: string
  createdAt: string
}

export default function ComponentsPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const { theme } = useTheme()
  
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchComponents()
  }, [])
  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/admin/components')
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched components:", data);
        setComponents(data)
      }
    } catch (error) {
      console.error('Error fetching components:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this component?')) return

    try {
      const response = await fetch(`/api/admin/components/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setComponents(components.filter(component => component.id !== id))
      }
    } catch (error) {
      console.error('Error deleting component:', error)
    }
  }
  const columns: Column<Component>[] = [
    { 
      key: 'name',
      label: 'Name' 
    },
    { 
      key: 'category',
      label: 'Category',
      render: (value: Component['category']) => value.name
    },
    { 
      key: 'price',
      label: 'Price',
      render: (value: number) => `€${value.toFixed(2)}`
    },
    {
      key: 'discountPrice',
      label: 'Discount Price',
      render: (value: number | null, row: Component) => {
        if (!value) return '-';
        const isExpired = row.discountExpiresAt && new Date(row.discountExpiresAt) < new Date();
        if (isExpired) return '-';
        return `€${value.toFixed(2)}`;
      }
    },
    { 
      key: 'stock',
      label: 'Stock'
    },
    { 
      key: 'sku',
      label: 'SKU'
    },
    {      key: 'id',
      label: 'Actions',
      render: (item: Component) => {
        console.log("Item in action buttons:", item);
        return (
          <ActionButtons
            onView={() => {
              console.log(`Navigating to view: /${locale}/admin/components/${item.id}`);
              router.push(`/${locale}/admin/components/${item.id}`);
            }}
            onEdit={() => {
              console.log(`Navigating to edit: /${locale}/admin/components/${item.id}/edit`);
              router.push(`/${locale}/admin/components/${item.id}/edit`);
            }}
            onDelete={() => handleDelete(item.id)}
          />
        );
      },
    },
  ]

  const filteredComponents = components.filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Components Management
        </h1>
        <button
          onClick={() => router.push(`/${locale}/admin/components/create`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Component
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search components..."
          />
        </div>
        
        <DataTable
          columns={columns}
          data={filteredComponents}
          loading={loading}
        />
      </div>
    </div>
  )
}