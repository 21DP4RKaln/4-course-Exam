'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { RepairStatusBadge } from './RepairStatusBadge'
import { RepairStatusModal } from './RepairStatusModal'
import { RepairCompletionForm } from './RepairCompletionForm'
import { useAuth } from '@/app/contexts/AuthContext'
import { format } from 'date-fns'
import { 
  User, Mail, Phone, Calendar, DollarSign, 
  AlertTriangle, Clock, CheckCircle, Wrench
} from 'lucide-react'

interface RepairDetailsProps {
  repairId: string
  onBack?: () => void
}

interface RepairDetail {
  id: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  estimatedCost: number | null
  finalCost: number | null
  completionDate: string | null
  diagnosticNotes: string | null
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  peripheral?: {
    id: string
    name: string
    category: {
      name: string
    }
  }
  configuration?: {
    id: string
    name: string
  }
  specialists: Array<{
    id: string
    specialist: {
      name: string
      email: string
    }
    assignedAt: string
    notes: string | null
  }>
  parts: Array<{
    id: string
    component: {
      name: string
      price: number
    }
    quantity: number
    price: number
  }>
}

export function RepairDetails({ repairId, onBack }: RepairDetailsProps) {
  const t = useTranslations()
  const { user } = useAuth()
  const [repair, setRepair] = useState<RepairDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showCompletionForm, setShowCompletionForm] = useState(false)

  useEffect(() => {
    fetchRepairDetails()
  }, [repairId])

  const fetchRepairDetails = async () => {
    try {
      const response = await fetch(`/api/staff/repairs/${repairId}`)
      if (!response.ok) throw new Error('Failed to fetch repair details')
      const data = await response.json()
      setRepair(data)
    } catch (error) {
      console.error('Error fetching repair details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!repair) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500 dark:text-neutral-400">{t('repairs.notFound')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{repair.title}</h2>
            <p className="text-neutral-500 dark:text-neutral-400">ID: {repair.id}</p>
          </div>
          <div className="flex items-center gap-4">
            <RepairStatusBadge status={repair.status} />
            {repair.status !== 'COMPLETED' && repair.status !== 'CANCELLED' && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="btn btn-primary"
              >
                {t('repairs.updateStatus')}
              </button>
            )}
            {repair.status === 'IN_PROGRESS' && (
              <button
                onClick={() => setShowCompletionForm(true)}
                className="btn btn-success"
              >
                {t('repairs.complete')}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('repairs.customerInfo')}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User size={18} className="text-neutral-400" />
                <span>{repair.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-neutral-400" />
                <span>{repair.user.email}</span>
              </div>
              {repair.user.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-neutral-400" />
                  <span>{repair.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Repair Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('repairs.repairInfo')}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-neutral-400" />
                <span>{format(new Date(repair.createdAt), 'MMM d, yyyy HH:mm')}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-neutral-400" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${repair.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    repair.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    repair.priority === 'NORMAL' ? 'bg-blue-100 text-blue-800' :
                    'bg-neutral-100 text-stone-950'}`}>
                  {t(`repairs.priority.${repair.priority.toLowerCase()}`)}
                </span>
              </div>
              {repair.estimatedCost && (
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-neutral-400" />
                  <span>Est: €{repair.estimatedCost.toFixed(2)}</span>
                </div>
              )}
              {repair.finalCost && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>Final: €{repair.finalCost.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {repair.description && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{t('repairs.description')}</h3>
            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {repair.description}
            </p>
          </div>
        )}

        {/* Diagnostic Notes */}
        {repair.diagnosticNotes && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{t('repairs.diagnosticNotes')}</h3>
            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {repair.diagnosticNotes}
            </p>
          </div>
        )}

        {/* Device Information */}
        {(repair.peripheral || repair.configuration) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{t('repairs.device')}</h3>
            {repair.peripheral && (
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-neutral-400" />
                <span>{repair.peripheral.name} ({repair.peripheral.category.name})</span>
              </div>
            )}
            {repair.configuration && (
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-neutral-400" />
                <span>{repair.configuration.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Assigned Specialists */}
        {repair.specialists.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{t('repairs.specialists')}</h3>
            <div className="space-y-2">
              {repair.specialists.map(specialist => (
                <div key={specialist.id} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-700 p-3 rounded">
                  <div>
                    <p className="font-medium">{specialist.specialist.name}</p>
                    <p className="text-sm text-neutral-500">{specialist.specialist.email}</p>
                  </div>
                  <div className="text-sm text-neutral-500">
                    {format(new Date(specialist.assignedAt), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parts Used */}
        {repair.parts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{t('repairs.partsUsed')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">{t('repairs.part')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">{t('repairs.quantity')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">{t('repairs.price')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">{t('repairs.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {repair.parts.map(part => (
                    <tr key={part.id}>
                      <td className="px-4 py-2">{part.component.name}</td>
                      <td className="px-4 py-2">{part.quantity}</td>
                      <td className="px-4 py-2">€{part.price.toFixed(2)}</td>
                      <td className="px-4 py-2">€{(part.price * part.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showStatusModal && (
        <RepairStatusModal
          repair={repair}
          onClose={() => setShowStatusModal(false)}
          onUpdate={fetchRepairDetails}
        />
      )}

      {showCompletionForm && (
        <RepairCompletionForm
          repair={repair}
          onClose={() => setShowCompletionForm(false)}
          onComplete={() => {
            fetchRepairDetails()
            setShowCompletionForm(false)
          }}
        />
      )}
    </div>
  )
}