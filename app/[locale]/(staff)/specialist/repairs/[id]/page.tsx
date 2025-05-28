'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { 
  Card,
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Label } from '@/app/components/ui/label'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { 
  ArrowLeft, 
  Clock, 
  Wrench, 
  CheckCircle, 
  AlertCircle,
  User,
  Mail,
  Phone,
  Save,
  Euro
} from 'lucide-react'

type RepairStatus = 'PENDING' | 'DIAGNOSING' | 'WAITING_FOR_PARTS' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type RepairPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

interface Component {
  id: string;
  name: string;
  category: string;
  quantity: number;
}

interface Product {
  type: 'peripheral' | 'configuration';
  id: string;
  name: string;
  category?: string;
  imageUrl?: string;
  description?: string;
  components?: Component[];
}

interface RepairPart {
  id: string;
  componentId: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

interface Specialist {
  id: string;
  name: string;
  email: string;
  assignedAt: string;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface RepairDetails {
  id: string;
  title: string;
  description: string;
  status: RepairStatus;
  priority: RepairPriority;
  customer: Customer;
  specialists: Specialist[];
  product?: Product | null;
  parts: RepairPart[];
  estimatedCost?: number;
  finalCost?: number;
  diagnosticNotes?: string;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RepairDetailsPage() {  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [repair, setRepair] = useState<RepairDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [diagnosticNotes, setDiagnosticNotes] = useState('')
  const [estimatedCost, setEstimatedCost] = useState<string>('')
  const [finalCost, setFinalCost] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus | ''>('')
  const [selectedPriority, setSelectedPriority] = useState<RepairPriority | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchRepairDetails()
  }, [params.id])

  const fetchRepairDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/staff/repairs/${params.id}`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }
      
      const data = await response.json()
      setRepair(data)
      setDiagnosticNotes(data.diagnosticNotes || '')
      setSelectedStatus(data.status || '')
      setSelectedPriority(data.priority || '')
      setEstimatedCost(data.estimatedCost?.toString() || '')
      setFinalCost(data.finalCost?.toString() || '')
    } catch (error) {
      console.error('Error fetching repair details:', error)
      setError('Failed to load repair details')
    } finally {
      setLoading(false)
    }
  }

  const saveChanges = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      const updateData: any = {}
      
      if (selectedStatus && selectedStatus !== repair?.status) {
        updateData.status = selectedStatus
      }
      
      if (selectedPriority && selectedPriority !== repair?.priority) {
        updateData.priority = selectedPriority
      }
      
      if (diagnosticNotes !== repair?.diagnosticNotes) {
        updateData.diagnosticNotes = diagnosticNotes
      }
      
      if (estimatedCost && parseFloat(estimatedCost) !== repair?.estimatedCost) {
        updateData.estimatedCost = parseFloat(estimatedCost)
      }
      
      if (finalCost && parseFloat(finalCost) !== repair?.finalCost) {
        updateData.finalCost = parseFloat(finalCost)
      }

      // Only send request if there are changes
      if (Object.keys(updateData).length === 0) {
        setSuccessMessage('No changes to save')
        setSaving(false)
        return
      }
      
      const response = await fetch(`/api/staff/repairs/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update repair')
      }
      
      const updatedRepair = await response.json()
      setRepair(updatedRepair)
      setSuccessMessage('Repair updated successfully')
      
    } catch (error: any) {
      console.error('Error updating repair:', error)
      setError(error.message || 'Failed to update repair')
    } finally {
      setSaving(false)
    }
  }

  const completeRepair = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      if (!finalCost) {
        setError('Please set the final cost before completing the repair')
        setSaving(false)
        return
      }

      const response = await fetch(`/api/staff/repairs/${params.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          finalCost: parseFloat(finalCost),
          diagnosticNotes
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to complete repair')
      }
      
      const updatedRepair = await response.json()
      setRepair(updatedRepair)
      setSelectedStatus('COMPLETED')
      setSuccessMessage('Repair marked as completed')
      
      // Refresh the page after a delay
      setTimeout(() => {
        fetchRepairDetails()
      }, 1500)
      
    } catch (error: any) {
      console.error('Error completing repair:', error)
      setError(error.message || 'Failed to complete repair')
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: RepairStatus) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'DIAGNOSING': { color: 'bg-purple-100 text-purple-800', icon: Wrench },
      'WAITING_FOR_PARTS': { color: 'bg-orange-100 text-orange-800', icon: Clock },
      'IN_PROGRESS': { color: 'bg-blue-100 text-blue-800', icon: Wrench },
      'COMPLETED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    } as const

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: RepairPriority) => {
    const colors = {
      'LOW': 'bg-neutral-100 text-neutral-800',
      'NORMAL': 'bg-blue-100 text-blue-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge className={colors[priority]}>
        {priority}
      </Badge>
    )
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
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {repair.title}
            </h1>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(repair.status)}
            {getPriorityBadge(repair.priority)}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Repair Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full border rounded-md px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as RepairStatus)}
                    disabled={repair.status === 'COMPLETED' || repair.status === 'CANCELLED'}
                  >
                    <option value="">Select Status</option>
                    <option value="PENDING">PENDING</option>
                    <option value="DIAGNOSING">DIAGNOSING</option>
                    <option value="WAITING_FOR_PARTS">WAITING FOR PARTS</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="w-full border rounded-md px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as RepairPriority)}
                    disabled={repair.status === 'COMPLETED' || repair.status === 'CANCELLED'}
                  >
                    <option value="">Select Priority</option>
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Cost (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <Input
                      id="estimatedCost"
                      type="number"
                      value={estimatedCost}                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEstimatedCost(e.target.value)}
                      className="pl-10"
                      disabled={repair.status === 'COMPLETED' || repair.status === 'CANCELLED'}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="finalCost">Final Cost (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <Input
                      id="finalCost"
                      type="number"
                      value={finalCost}                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFinalCost(e.target.value)}
                      className="pl-10"
                      disabled={repair.status === 'COMPLETED' || repair.status === 'CANCELLED'}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosticNotes">Diagnostic Notes</Label>                  <Textarea
                  id="diagnosticNotes"
                  value={diagnosticNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDiagnosticNotes(e.target.value)}
                  rows={4}
                  disabled={repair.status === 'COMPLETED' || repair.status === 'CANCELLED'}
                  placeholder="Enter detailed diagnostic notes and repair information"
                  className="w-full border rounded-md px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Repair Description</Label>
                <div className="p-3 border rounded-md whitespace-pre-wrap dark:bg-neutral-800 dark:border-neutral-700">
                  {repair.description || 'No description provided'}
                </div>
              </div>

              {repair.product && (
                <div className="space-y-2">
                  <Label>Related Product</Label>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {repair.product.type === 'peripheral' && repair.product.imageUrl && (
                          <img 
                            src={repair.product.imageUrl} 
                            alt={repair.product.name}
                            className="w-24 h-24 object-contain"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{repair.product.name}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {repair.product.type === 'peripheral' 
                              ? `Peripheral - ${repair.product.category}` 
                              : 'Custom PC Configuration'}
                          </p>
                          {repair.product.type === 'configuration' && repair.product.components && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400">
                                Show Components ({repair.product.components.length})
                              </summary>
                              <ul className="mt-2 text-sm space-y-1 ml-4">
                                {repair.product.components.map(component => (
                                  <li key={component.id}>
                                    {component.quantity > 1 ? `${component.quantity}x ` : ''}
                                    {component.name} ({component.category})
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>            <CardFooter className="flex flex-wrap gap-3 justify-between">
              <div className="flex gap-3">
                <Button 
                  onClick={saveChanges} 
                  disabled={saving || repair.status === 'COMPLETED' || repair.status === 'CANCELLED'}
                >
                  {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>                <Button
                  onClick={() => router.push(`/${locale}/specialist/repairs/${repair.id}/parts`)}
                  disabled={repair.status === 'COMPLETED' || repair.status === 'CANCELLED'}
                  variant="outline"
                >
                  Add Parts
                </Button>
              </div>
              {repair.status !== 'COMPLETED' && repair.status !== 'CANCELLED' && (
                <Button 
                  onClick={completeRepair} 
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Mark as Complete
                </Button>
              )}
            </CardFooter>
          </Card>

          {repair.parts && repair.parts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Replacement Parts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Component</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {repair.parts.map(part => (
                        <tr key={part.id}>
                          <td className="px-4 py-3 whitespace-nowrap">{part.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{part.category}</td>
                          <td className="px-4 py-3 text-center">{part.quantity}</td>
                          <td className="px-4 py-3 text-right">€{part.price.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="font-medium">
                        <td colSpan={3} className="px-4 py-3 text-right">Total:</td>
                        <td className="px-4 py-3 text-right">
                          €{repair.parts.reduce((total, part) => total + (part.price * part.quantity), 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-neutral-500" />
                <div>
                  <p className="font-medium">{repair.customer.name}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Customer</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-neutral-500" />
                <a href={`mailto:${repair.customer.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {repair.customer.email}
                </a>
              </div>
              
              {repair.customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-neutral-500" />
                  <a href={`tel:${repair.customer.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {repair.customer.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repair Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Created</span>
                <span>{new Date(repair.createdAt).toLocaleDateString()}</span>
              </div>
              
              {repair.completionDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Completed</span>
                  <span>{new Date(repair.completionDate).toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Last Updated</span>
                <span>{new Date(repair.updatedAt).toLocaleDateString()}</span>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Assigned Specialists</h4>
                {repair.specialists.length > 0 ? (
                  <div className="space-y-3">
                    {repair.specialists.map(specialist => (
                      <div key={specialist.id} className="text-sm">
                        <div className="font-medium">{specialist.name}</div>
                        <div className="text-neutral-500 dark:text-neutral-400">{specialist.email}</div>
                        <div className="text-xs">Assigned: {new Date(specialist.assignedAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No specialists assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}