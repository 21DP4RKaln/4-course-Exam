'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { RepairDetails } from '@/app/components/Staff/Repairs/RepairDetails'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default function AdminRepairDetailsPage({ params }: PageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/unauthorized')
      return
    }
  }, [user])

  if (loading) {
    return <div>Loading...</div>
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
        <h1 className="text-2xl font-bold">Repair Details</h1>
      </div>

      <RepairDetails 
        repairId={params.id}
        onBack={() => router.back()}
      />
    </div>
  )
}