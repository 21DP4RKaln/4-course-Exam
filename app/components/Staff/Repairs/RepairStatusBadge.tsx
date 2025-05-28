'use client'

import { useTranslations } from 'next-intl'
import { RepairStatus } from '@prisma/client'

interface RepairStatusBadgeProps {
  status: RepairStatus | string
}

export function RepairStatusBadge({ status }: RepairStatusBadgeProps) {
  const t = useTranslations()

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'DIAGNOSING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'WAITING_FOR_PARTS':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-neutral-100 text-stone-950 dark:bg-neutral-900 dark:text-neutral-200'
    }
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
      {t(`repairs.status.${status.toLowerCase()}`)}
    </span>
  )
}