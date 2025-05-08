'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ConfigEditForm } from '@/app/components/Staff/Configurations/ConfigEditForm'

interface PageProps {
  params: {
    id: string
  }
}

interface Configuration {
  id: string;
  name: string;
  description?: string;
  components: Array<{
    id: string;
    name: string;
    category: string;
    categoryId: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  status?: string;
}

export default function AdminEditConfigurationPage({ params }: PageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/unauthorized')
      return
    }
    fetchConfiguration()
  }, [user, params.id])

  const fetchConfiguration = async () => {
    try {
      const response = await fetch(`/api/admin/configurations/${params.id}`)
      const data = await response.json()
      setConfiguration(data)
    } catch (error) {
      console.error('Error fetching configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/admin/configurations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        router.push('/admin/configurations')
      }
    } catch (error) {
      console.error('Error updating configuration:', error)
    }
  }

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
        <h1 className="text-2xl font-bold">Edit Configuration</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {configuration && (
          <ConfigEditForm 
            configuration={configuration}
            onSave={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}