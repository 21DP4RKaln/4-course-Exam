'use client'

import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface ActionButtonsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  customActions?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'danger'
  }[]
  dropdown?: boolean
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  customActions = [],
  dropdown = false
}: ActionButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const actions = [
    ...(onView ? [{ label: 'View', icon: <Eye size={16} />, onClick: onView }] : []),
    ...(onEdit ? [{ label: 'Edit', icon: <Edit size={16} />, onClick: onEdit }] : []),
    ...(onDelete ? [{ label: 'Delete', icon: <Trash2 size={16} />, onClick: onDelete, variant: 'danger' as const }] : []),
    ...customActions
  ]

  if (dropdown) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <MoreVertical size={20} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick()
                    setIsOpen(false)
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    action.variant === 'danger'
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`p-2 rounded-full transition-colors ${
            action.variant === 'danger'
              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={action.label}
        >
          {action.icon || action.label}
        </button>
      ))}
    </div>
  )
}