'use client'

import { useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ConfigEditForm } from '@/app/components/Staff/Configurations/ConfigEditForm'

export default function AdminCreateConfigurationPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (user?.role !== 'ADMIN') {
    router.push('/unauthorized')
    return null
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/admin/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        router.push('/admin/configurations')
      }
    } catch (error) {
      console.error('Error creating configuration:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create Configuration</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <ConfigEditForm onSave={handleSubmit} />
      </div>
    </div>
  )
}