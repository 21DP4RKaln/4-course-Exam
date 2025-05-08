"use client"

import React from 'react'
import ConfiguratorPage from '@/app/components/Configurator/ConfiguratorPage'
import ConfiguratorLayout from '@/app/components/Configurator/ConfiguratorLayout'

export default function Page() {
  return (
    <ConfiguratorLayout>
      <ConfiguratorPage />
    </ConfiguratorLayout>
  )
}