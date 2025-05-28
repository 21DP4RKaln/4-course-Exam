'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RepairStatus } from '@prisma/client'
import { X } from 'lucide-react'

interface RepairStatusModalProps {
  repair: {
    id: string
    status: string
    title: string
  }
  onClose: () => void
  onUpdate: () => void
}

export function RepairStatusModal({ repair, onClose, onUpdate }: RepairStatusModalProps) {
  const t = useTranslations()
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus>(repair.status as RepairStatus)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/staff/repairs/${repair.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          notes,
        }),
      })

      if (!response.ok) throw new Error('Failed to update repair status')

      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating repair status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-stone-950 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('repairs.updateStatus')}</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('repairs.currentStatus')}
            </label>
            <p className="text-neutral-600 dark:text-neutral-400">{t(`repairs.status.${repair.status.toLowerCase()}`)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('repairs.newStatus')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as RepairStatus)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600"
              required
            >
              {Object.values(RepairStatus).map(status => (
                <option key={status} value={status}>
                  {t(`repairs.status.${status.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('repairs.notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600"
              rows={3}
              placeholder={t('repairs.notesPlaceholder')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? t('common.updating') : t('common.update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}