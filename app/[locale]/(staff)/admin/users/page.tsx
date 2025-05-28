'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Eye, Search, UserCheck, UserX } from 'lucide-react'
import { DataTable, Column } from '@/app/components/Staff/Common/DataTable'
import { ActionButtons } from '@/app/components/Staff/Common/ActionButtons'
import { SearchBar } from '@/app/components/Staff/Common/SearchBar'
import { StatusBadge } from '@/app/components/Staff/Common/StatusBadge'

interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN' | 'SPECIALIST'
  isBlocked: boolean
  createdAt: string
}

export default function UsersPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-block`, {
        method: 'POST',
      })
      
      if (response.ok) {
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u
        ))
      }
    } catch (error) {
      console.error('Error toggling user block status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== id))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const columns: Column<User>[] = [
    { 
      key: 'name' as keyof User, 
      label: 'Name' 
    },
    { 
      key: 'email' as keyof User, 
      label: 'Email' 
    },
    { 
      key: 'role' as keyof User, 
      label: 'Role',
      render: (value: User['role']) => (
        <StatusBadge 
          status={value} 
          variant={value === 'ADMIN' ? 'danger' : value === 'SPECIALIST' ? 'warning' : 'info'}
        />
      )
    },
    { 
      key: 'isBlocked' as keyof User, 
      label: 'Status',
      render: (value: boolean) => (
        <StatusBadge 
          status={value ? 'Blocked' : 'Active'} 
          variant={value ? 'danger' : 'success'}
        />
      )
    },
    { 
      key: 'createdAt' as keyof User, 
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'id' as keyof User,
      label: 'Actions',
      render: (value: string, user: User) => (
        <div className="flex items-center space-x-2">
          <ActionButtons
            onView={() => router.push(`/${locale}/admin/users/${user.id}`)}
            onEdit={() => router.push(`/${locale}/admin/users/${user.id}/edit`)}
            onDelete={() => handleDelete(user.id)}
          />
          <button
            onClick={() => handleToggleBlock(user)}
            className={`p-2 rounded-lg ${
              user.isBlocked 
                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
            title={user.isBlocked ? 'Unblock User' : 'Block User'}
          >
            {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ]

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Users Management
        </h1>
        <button
          onClick={() => router.push(`/${locale}/admin/users/create`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users..."
          />
        </div>
        
        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
        />
      </div>
    </div>
  )
}