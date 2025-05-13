'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface ConfiguratorLayoutProps {
  children: React.ReactNode
}

/**
 * Special layout component for configurator that removes header and footer
 */
const ConfiguratorLayout: React.FC<ConfiguratorLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Logo Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-stone-950">
        <Link href={`/${locale}`} className="inline-block">
          <Image
            src="/images/logo-removebg.png"
            alt="Logo"
            width={150}
            height={50}
            className="h-12 w-auto"
          />
        </Link>
      </div>
      
      <main className="px-6 py-8">
        <div className="space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default ConfiguratorLayout