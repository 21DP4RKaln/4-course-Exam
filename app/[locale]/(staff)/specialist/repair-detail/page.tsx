'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Clock, Wrench, CheckCircle, AlertCircle, CalendarDays, User, Mail, Phone, Package } from 'lucide-react'
import { Textarea } from '@/app/components/ui/textarea'
import { Label } from '@/app/components/ui/label'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import Link from 'next/link'

type RepairStatus = 'PENDING' | 'DIAGNOSING' | 'WAITING_FOR_PARTS' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type RepairPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface RepairPart {
  id: string;
  componentId: string;
  componentName: string;
  price: number;
  quantity: number;
}

interface DetailedRepair {
  id: string;
  title: string;
  description: string;
  status: RepairStatus;
  priority: RepairPriority;
  userId: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost: number;
  finalCost?: number;
  diagnosticNotes?: string;
  completionDate?: string;
  customer: Customer;
  parts: RepairPart[];
  product?: {
    type: 'peripheral' | 'configuration';
    name: string;
    category?: string;
  };
}

export default function RepairDetailsPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const locale = pathname.split('/')[1]
  const id = params.id as string
  
  const [repair, setRepair] = useState<DetailedRepair | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(action === 'edit')
  
  const [editData, setEditData] = useState({
    status: '',
    priority: '',
    diagnosticNotes: '',
    estimatedCost: '',
    finalCost: ''
  })

  useEffect(() => {
    fetchRepairDetails()
  }, [id])
  
  useEffect(() => {
    if (repair) {
      setEditData({
        status: repair.status,
        priority: repair.priority,
        diagnosticNotes: repair.diagnosticNotes || '',
        estimatedCost: String(repair.estimatedCost || ''),
        finalCost: String(repair.finalCost || '')
      })
    }
  }, [repair])

  const fetchRepairDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/staff/repairs/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch repair details')
      }
      
      const data = await response.json()
      setRepair(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setEditData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    
    try {
      const payload = {
        status: editData.status,
        priority: editData.priority,
        diagnosticNotes: editData.diagnosticNotes,
        estimatedCost: editData.estimatedCost ? parseFloat(editData.estimatedCost) : undefined,
        finalCost: editData.finalCost ? parseFloat(editData.finalCost) : undefined
      }
      
      const response = await fetch(`/api/staff/repairs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update repair')
      }
      
      await fetchRepairDetails()
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update repair')
    } finally {
      setUpdating(false)
    }
  }
  
  const completeRepair = async () => {
    setUpdating(true)
    
    try {
      const response = await fetch(`/api/staff/repairs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          completionDate: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to complete repair')
      }
      
      await fetchRepairDetails()
    } catch (err: any) {
      setError(err.message || 'Failed to complete repair')
    } finally {
      setUpdating(false)
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
        {status.replace('_', ' ')}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !repair) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-800">Error</h2>
        <p className="text-red-700">{error || 'Failed to load repair details'}</p>
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.back()}>
              ← Back to Repairs
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
            {repair.title}
          </h1>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Repair
              </Button>
              
              {repair.status !== 'COMPLETED' && repair.status !== 'CANCELLED' && (
                <Button onClick={completeRepair} disabled={updating}>
                  Mark as Completed
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel Edit
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="parts">Parts ({repair.parts?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          {isEditing ? (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editData.status}
                        onValueChange={(value) => handleSelectChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="DIAGNOSING">Diagnosing</SelectItem>
                          <SelectItem value="WAITING_FOR_PARTS">Waiting for Parts</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={editData.priority}
                        onValueChange={(value) => handleSelectChange("priority", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="estimatedCost">Estimated Cost (€)</Label>
                      <Input
                        id="estimatedCost"
                        name="estimatedCost"
                        type="number"
                        step="0.01"
                        value={editData.estimatedCost}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="finalCost">Final Cost (€)</Label>
                      <Input
                        id="finalCost"
                        name="finalCost"
                        type="number"
                        step="0.01"
                        value={editData.finalCost}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <Label htmlFor="diagnosticNotes">Diagnostic Notes</Label>
                      <Textarea
                        id="diagnosticNotes"
                        name="diagnosticNotes"
                        rows={5}
                        value={editData.diagnosticNotes}
                        onChange={handleChange}
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Updating...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Repair Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(repair.status)}
                    {getPriorityBadge(repair.priority)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-neutral-500" />
                      <span>Created: {new Date(repair.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {repair.completionDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Completed: {new Date(repair.completionDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {repair.estimatedCost > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Estimated Cost:</span>
                        <span>€{repair.estimatedCost.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {repair.finalCost && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Final Cost:</span>
                        <span>€{repair.finalCost.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  {repair.product && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-neutral-500">Product</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Package className="h-4 w-4 text-neutral-500" />
                        <span>{repair.product.name}</span>
                        {repair.product.category && (
                          <Badge variant="outline">{repair.product.category}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-neutral-500">Description</h3>
                    <p className="mt-1 whitespace-pre-line">{repair.description}</p>
                  </div>
                  
                  {repair.diagnosticNotes && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Diagnostic Notes</h3>
                      <p className="mt-1 text-blue-800 dark:text-blue-200 whitespace-pre-line">{repair.diagnosticNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-500" />
                    <span>{repair.customer?.name || 'Unknown Customer'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-500" />
                    <a href={`mailto:${repair.customer?.email}`} className="text-blue-600 hover:underline">
                      {repair.customer?.email}
                    </a>
                  </div>
                  
                  {repair.customer?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-neutral-500" />
                      <a href={`tel:${repair.customer.phone}`} className="text-blue-600 hover:underline">
                        {repair.customer.phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="parts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Parts Used for Repair</CardTitle>
              <Link href={`/${locale}/specialist/repairs/${repair.id}/parts`}>
                <Button size="sm">Manage Parts</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {repair.parts && repair.parts.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b text-sm font-medium">
                    <div className="col-span-5">Component</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>
                  
                  {repair.parts.map((part) => (
                    <div key={part.id} className="grid grid-cols-12 px-4 py-3 border-b last:border-b-0">
                      <div className="col-span-5">{part.componentName}</div>
                      <div className="col-span-2 text-right">{part.quantity}</div>
                      <div className="col-span-2 text-right">€{part.price.toFixed(2)}</div>
                      <div className="col-span-3 text-right font-medium">
                        €{(part.price * part.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-12 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-t">
                    <div className="col-span-9 text-right font-medium">Total:</div>
                    <div className="col-span-3 text-right font-bold">
                      €{repair.parts.reduce((sum, part) => sum + (part.price * part.quantity), 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No parts have been added to this repair yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
