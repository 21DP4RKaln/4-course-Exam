'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Label } from '@/app/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewRepairPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [issue, setIssue] = useState('')
  const [serviceType, setServiceType] = useState('diagnostics')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const createRepair = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName || !lastName || !email || !issue || !serviceType) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setSaving(true)
      setError(null)
      
      const formData = new FormData()
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('serviceId', serviceType)
      formData.append('issue', issue)
      
      const response = await fetch('/api/staff/repairs', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create repair')
      }
      
      const data = await response.json()
      router.push(`/${locale}/specialist/repairs/${data.id}`)
    } catch (error: any) {
      console.error('Error creating repair:', error)
      setError(error.message || 'Failed to create repair')
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/specialist/repairs`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Repairs
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Create New Repair
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={createRepair}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Repair Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <select
                    id="serviceType"
                    className="w-full border rounded-md px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
                    value={serviceType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setServiceType(e.target.value)}
                    required
                  >
                    <option value="diagnostics">Diagnostics</option>
                    <option value="hardware-replacement">Hardware Replacement</option>
                    <option value="data-recovery">Data Recovery</option>
                    <option value="virus-removal">Virus Removal</option>
                    <option value="performance-optimization">Performance Optimization</option>
                    <option value="custom">Custom Repair</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issue">Issue Description *</Label>
                  <Textarea
                    id="issue"
                    value={issue}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIssue(e.target.value)}
                    rows={5}
                    placeholder="Describe the issue in detail"
                    className="w-full"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="mr-2 h-4 w-4" />}
                  Create Repair
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-medium">Diagnostics</h3>
                  <p className="text-sm text-neutral-600">€10 - Estimated time: 1-3 days</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Hardware Replacement</h3>
                  <p className="text-sm text-neutral-600">€20 - Estimated time: 1-2 weeks</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Data Recovery</h3>
                  <p className="text-sm text-neutral-600">€30 - Estimated time: 3-7 days</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Virus Removal</h3>
                  <p className="text-sm text-neutral-600">€20 - Estimated time: 1-3 days</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Performance Optimization</h3>
                  <p className="text-sm text-neutral-600">€25 - Estimated time: 1-3 days</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Custom Repair</h3>
                  <p className="text-sm text-neutral-600">€35 - Estimated time: 1-7 days</p>
                </div>
                
                <div className="text-sm text-neutral-500 italic border-t pt-4 mt-4">
                  <p>All repairs include an initial diagnostic fee. Additional costs may apply for parts.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
