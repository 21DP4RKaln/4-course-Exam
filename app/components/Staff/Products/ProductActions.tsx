'use client'

import { useRouter } from 'next/navigation'
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

interface ProductActionsProps {
  id: string
  type: 'component' | 'peripheral' | 'ready-made'
  onDelete?: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ProductActions({ 
  id, 
  type, 
  onDelete,
  canEdit = true,
  canDelete = true
}: ProductActionsProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const locale = 'en'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleView = () => {
    const basePath = `/${locale}/${user?.role.toLowerCase()}`
    
    switch (type) {
      case 'component':
        router.push(`${basePath}/components/${id}`)
        break
      case 'peripheral':
        router.push(`${basePath}/peripherals/${id}`)
        break
      case 'ready-made':
        router.push(`${basePath}/ready-made/${id}`)
        break
    }
  }

  const handleEdit = () => {
    if (!canEdit) return
    
    const basePath = `/${locale}/${user?.role.toLowerCase()}`
    
    switch (type) {
      case 'component':
        router.push(`${basePath}/components/${id}/edit`)
        break
      case 'peripheral':
        router.push(`${basePath}/peripherals/${id}/edit`)
        break
      case 'ready-made':
        router.push(`${basePath}/configurations/${id}/edit`)
        break
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <MoreVertical size={20} />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <button
              onClick={handleView}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Eye size={16} className="mr-2" />
              View Details
            </button>
            
            {canEdit && (
              <button
                onClick={handleEdit}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </button>
            )}
            
            {canDelete && onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}