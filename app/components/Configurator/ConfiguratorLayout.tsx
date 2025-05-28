'use client'

import React from 'react'
import { useTheme } from '@/app/contexts/ThemeContext'

interface ConfiguratorLayoutProps {
  children: React.ReactNode
}

const ConfiguratorLayout: React.FC<ConfiguratorLayoutProps> = ({ children }) => {
  const { theme } = useTheme()
  return (
    <div className={`min-h-screen max-h-screen overflow-hidden ${
      theme === 'dark' 
        ? 'bg-stone-950 text-white' 
        : 'bg-neutral-100 text-neutral-900'
    } transition-colors duration-200`}>
      <div className="h-full overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default ConfiguratorLayout
