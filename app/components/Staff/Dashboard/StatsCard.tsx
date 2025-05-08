'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  className
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <div className={cn(
                "flex items-center text-sm font-medium",
                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {trend.value}%
              </div>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className={cn(
            "p-3 rounded-full",
            trend?.isPositive ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
            trend?.isPositive === false ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
            "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          )}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}