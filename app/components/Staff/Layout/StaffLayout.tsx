'use client'

import React, { ReactNode } from 'react'
import { StaffSidebar } from './StaffSidebar'
import { StaffHeader } from './StaffHeader'
import { StaffFooter } from './StaffFooter'
import { useTheme } from '@/app/contexts/ThemeContext'

interface StaffLayoutProps {
  children: ReactNode
}

export function StaffLayout({ children }: StaffLayoutProps) {
  const { theme } = useTheme()

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Sidebar */}
      <StaffSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <StaffHeader />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <StaffFooter />
      </div>
    </div>
  )
}