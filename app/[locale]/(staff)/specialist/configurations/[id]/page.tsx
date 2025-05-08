'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { ArrowLeft, ShoppingCart, Edit, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ConfigurationDetails {
  id: string
  name: string
  description: string
  status: string
  totalPrice: number
  userId: string
  userName: string
  createdAt: string
  components: {
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }[]
}

export default function ConfigurationDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [configuration, setConfiguration] = useState<ConfigurationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    fetchConfigurationDetails()
  }, [params.id])

  const fetchConfigurationDetails = async () => {
    try {
      const response = await fetch(`/api/specialist/configurations/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setConfiguration(data)
      }
    } catch (error) {
      console.error('Error fetching configuration details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      const response = await fetch(`/api/specialist/configurations/${params.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        await fetchConfigurationDetails()
        alert('Configuration approved successfully!')
      }
    } catch (error) {
      console.error('Error approving configuration:', error)
      alert('Failed to approve configuration')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      const response = await fetch(`/api/specialist/configurations/${params.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        await fetchConfigurationDetails()
        alert('Configuration rejected')
      }
    } catch (error) {
      console.error('Error rejecting configuration:', error)
      alert('Failed to reject configuration')
    }
  }

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/specialist/configurations/${params.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        await fetchConfigurationDetails()
        alert('Configuration published to shop!')
      }
    } catch (error) {
      console.error('Error publishing configuration:', error)
      alert('Failed to publish configuration')
    }
  }

  if (loading || !configuration) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{configuration.name}</CardTitle>
              <Badge className={getStatusColor(configuration.status)}>
                {configuration.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {configuration.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Created By</h4>
                  <p>{configuration.userName}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Created Date</h4>
                  <p>{new Date(configuration.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Total Price</h4>
                  <p className="text-lg font-semibold">€{configuration.totalPrice}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <Badge className={getStatusColor(configuration.status)}>
                    {configuration.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Components</h4>
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-2 text-left">Component</th>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-center">Quantity</th>
                        <th className="px-4 py-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configuration.components.map((component) => (
                        <tr key={component.id} className="border-b">
                          <td className="px-4 py-2">{component.name}</td>
                          <td className="px-4 py-2">{component.category}</td>
                          <td className="px-4 py-2 text-center">{component.quantity}</td>
                          <td className="px-4 py-2 text-right">€{component.price}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">
                          Total:
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          €{configuration.totalPrice}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                {configuration.status === 'SUBMITTED' && (
                  <>
                    <Button onClick={handleApprove} disabled={approving}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="destructive" onClick={handleReject}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {configuration.status === 'APPROVED' && (
                  <Button onClick={handlePublish}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Publish to Shop
                  </Button>
                )}
                <Link href={`/${locale}/specialist/configurations/${configuration.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}