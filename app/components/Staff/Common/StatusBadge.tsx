'use client'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

const statusVariants = {
  // Order statuses
  PENDING: 'warning',
  PROCESSING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  
  // Configuration statuses
  DRAFT: 'default',
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  
  // Repair statuses
  DIAGNOSING: 'info',
  WAITING_FOR_PARTS: 'warning',
  IN_PROGRESS: 'info',
  
  // Generic statuses
  ACTIVE: 'success',
  INACTIVE: 'default',
  BLOCKED: 'danger',
} as const

export function StatusBadge({ 
  status, 
  variant = 'default',
  size = 'md' 
}: StatusBadgeProps) {
  const autoVariant = statusVariants[status as keyof typeof statusVariants] || variant

  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const variantClasses = {
    default: 'bg-gray-100 text-stone-950 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }

  return (
    <span 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[autoVariant]}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}