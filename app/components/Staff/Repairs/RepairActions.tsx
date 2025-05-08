'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Trash2,
  MessageSquare,
  Clock
} from 'lucide-react'

interface RepairActionsProps {
  repair: {
    id: string
    status: string
    title: string
  }
  onUpdate: () => void
  userRole: 'ADMIN' | 'SPECIALIST' | 'USER'
}

export function RepairActions({ repair, onUpdate, userRole }: RepairActionsProps) {
  const t = useTranslations()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleView = () => {
    router.push(`/${userRole.toLowerCase()}/repairs/${repair.id}`)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (loading) return
    setLoading(true)
    
    try {
      const response = await fetch(`/api/staff/repairs/${repair.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      onUpdate()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('repairs.confirmDelete'))) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/staff/repairs/${repair.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete repair')
      
      onUpdate()
    } catch (error) {
      console.error('Error deleting repair:', error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  const menuItems = [
    {
      label: t('common.view'),
      icon: Eye,
      onClick: handleView,
      show: true,
    },
    {
      label: t('repairs.updateStatus'),
      icon: Clock,
      onClick: () => router.push(`/${userRole.toLowerCase()}/repairs/${repair.id}`),
      show: repair.status !== 'COMPLETED' && repair.status !== 'CANCELLED',
    },
    {
      label: t('repairs.markInProgress'),
      icon: Edit,
      onClick: () => handleStatusUpdate('IN_PROGRESS'),
      show: repair.status === 'DIAGNOSING' || repair.status === 'WAITING_FOR_PARTS',
    },
    {
      label: t('repairs.markCompleted'),
      icon: CheckCircle,
      onClick: () => router.push(`/${userRole.toLowerCase()}/repairs/${repair.id}`),
      show: repair.status === 'IN_PROGRESS',
    },
    {
      label: t('repairs.cancel'),
      icon: XCircle,
      onClick: () => handleStatusUpdate('CANCELLED'),
      show: repair.status !== 'COMPLETED' && repair.status !== 'CANCELLED',
    },
    {
      label: t('common.delete'),
      icon: Trash2,
      onClick: handleDelete,
      show: userRole === 'ADMIN',
      className: 'text-red-600 hover:text-red-700',
    },
  ].filter(item => item.show)

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        disabled={loading}
      >
        <MoreVertical size={20} />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                item.className || 'text-gray-700 dark:text-gray-200'
              }`}
              disabled={loading}
            >
              <item.icon size={16} className="mr-2" />
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}