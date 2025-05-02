'use client'

import React from 'react'

interface ConfiguratorLayoutProps {
  children: React.ReactNode
}

/**
 * Special layout component for configurator that removes header and footer
 */
const ConfiguratorLayout: React.FC<ConfiguratorLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default ConfiguratorLayout