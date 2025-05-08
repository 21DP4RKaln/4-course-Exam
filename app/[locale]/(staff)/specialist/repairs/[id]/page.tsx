'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { ArrowLeft, Clock, Wrench, CheckCircle, AlertCircle } from 'lucide-react'

interface RepairDetails {
  id: string
  title: string
  description: string
  status: string
  priority: string
  userId: string
  userName: string
  userEmail: string
  createdAt: string
  estimatedCost: number
  finalCost?: number
  diagnosticNotes?: string
  completionDate?: string
}

export default function RepairDetailsPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const [repair, setRepair] = useState<RepairDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchRepairDetails()
  }, [params.id])

  const fetchRepairDetails = async () => {
    try {
      const response = await fetch(`/api/specialist/repairs/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setRepair(data)
        setNewStatus(data.status)
      }
    } catch (error) {
      console.error('Error fetching repair details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      const response = await fetch(`/api/specialist/repairs/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          diagnosticNotes: notes
        })
      })

      if (response.ok) {
        await fetchRepairDetails()
        setShowStatusModal(false)
      }
    } catch (error) {
      console.error('Error updating repair status:', error)
    }
  }

  if (loading || !repair) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
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
            <CardTitle>Repair Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{repair.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{repair.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <Badge>{repair.status}</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Priority</h4>
                  <Badge>{repair.priority}</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Created</h4>
                  <p>{new Date(repair.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Estimated Cost</h4>
                  <p>€{repair.estimatedCost}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Customer Information</h4>
                <p>Name: {repair.userName}</p>
                <p>Email: {repair.userEmail}</p>
              </div>

              {repair.diagnosticNotes && (
                <div>
                  <h4 className="font-medium mb-1">Diagnostic Notes</h4>
                  <p className="whitespace-pre-wrap">{repair.diagnosticNotes}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={() => setShowStatusModal(true)}>
                  Update Status
                </Button>
                {repair.status === 'IN_PROGRESS' && (
                  <Button variant="default" className="bg-green-600 hover:bg-green-700">Complete Repair</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Repair Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add diagnostic notes..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleStatusUpdate}>Save</Button>
                  <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}